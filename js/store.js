/* Tilan hallinta. Kolme erillistä kerrosta:

   1) CHARACTER — hahmodata Sheetistä. Vain luku, välimuistitetaan offline-käyttöön.
   2) SESSION   — yhden pelisession aikana muuttuvat arvot: osumapisteet,
                  voimapisteet, kierrosluku, tilavaikutukset, DB-togglet.
                  Ei tarvitse säilyä sessioiden välillä; "Aloita uusi sessio" nollaa.
   3) DURABLE   — kertyvä data: matkapäivät, muona, rahat, kielten tunnit,
                  päiväkirja ja varusteiden kantopaikat. Säilyy sessioiden yli ja
                  tämä on se osa, joka viedään takaisin Google Sheetsiin.

   Ero on tärkeä: Sheetin päivitys ei saa nollata kertynyttä dataa, eikä uuden
   session aloitus saa hukata kerättyjä kielitunteja tai rahoja. */

const STORAGE = {
  session:   'tm.session.v2',
  durable:   'tm.durable.v2',
  character: 'tm.character.v2',
  fetchedAt: 'tm.fetchedAt.v2',
  pushedAt:  'tm.pushedAt.v2'
};

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}

const Store = {

  raw: null,          // lomakkeen raakasyötteet sellaisenaan
  character: null,    // Rules.compute(raw) — johdetut bonukset laskettuna
  session: null,
  durable: null,
  listeners: [],

  /* ---------------- Hahmodata ---------------- */

  setCharacter(data, meta) {
    // Varmistetaan että kaikki listat ovat olemassa, vaikka välilehti puuttuisi.
    ['stats', 'skills', 'weapons', 'defense', 'spells', 'guilds',
     'resists', 'languages', 'inventory', 'spellBonuses'].forEach(k => {
      if (!Array.isArray(data[k])) data[k] = [];
    });
    if (!data.vitals) data.vitals = { hitsMax: 0, ppMax: 0 };
    if (!data.money) data.money = {};

    // Varusteet eivät ole lomakkeella, vaan tiedostossa js/inventory-data.js.
    if (!data.inventory.length && typeof INVENTORY_DATA !== 'undefined') {
      data.inventory = INVENTORY_DATA.map(i => Object.assign({}, i));
    }
    this.raw = data;
    Rules.use(data.rules || null);
    this.character = Rules.compute(data, this.durable && this.durable.levelUp);
    if (meta && meta.cache) {
      writeJson(STORAGE.character, data);
      try { localStorage.setItem(STORAGE.fetchedAt, new Date().toISOString()); } catch (e) { /* ohitetaan */ }
    }
    this.reconcile();
    this.emit();
  },

  cachedCharacter() { return readJson(STORAGE.character); },

  fetchedAt() {
    try { return localStorage.getItem(STORAGE.fetchedAt); } catch (e) { return null; }
  },

  pushedAt() {
    try { return localStorage.getItem(STORAGE.pushedAt); } catch (e) { return null; }
  },

  markPushed() {
    try { localStorage.setItem(STORAGE.pushedAt, new Date().toISOString()); } catch (e) { /* ohitetaan */ }
  },

  /* ---------------- Oletusarvot ---------------- */

  defaultSession() {
    return {
      hpCur: null,          // null = täydet, asetetaan kun hahmo ladataan
      ppCur: null,
      weaponId: null,
      splitPct: 0,          // kuinka monta % OB-poolista parryyn
      defenseOff: [],       // pois kytketyt DB-komponentit
      defenseInit: false,
      round: 1,             // taistelukierros
      effects: [],          // { id, type: 'stun'|'bleed', name, rounds, perRound }
      recentSkills: [],
      spellId: null,
      activeSpells: []    // { id, spell, at } — poistetaan käsin
    };
  },

  defaultDurable() {
    const money = {};
    CONFIG.coins.forEach(c => { money[c.key] = 0; });
    return {
      day: CONFIG.calendar.startTravelDay || 0,   // matkapäivälaskuri, ks. CONFIG.calendar
      food: CONFIG.food.startUnits,
      money: money,
      moneyInit: false,
      langHours: {},        // { "kieli|spoken"|"kieli|written": kertyneet tunnit }
      langTargets: {},      // sama avain: montako tuntia seuraava taso vaatii
      langRanks: {},        // sama avain: lomakkeen tason päälle ansaitut tasot
      langUndo: {},         // sama avain: viimeisimmän tasonnoston tiedot peruutusta varten
      log: [],              // päiväkirja, ks. Adventure-moduuli
      itemLocations: {},    // { esineen id: kantopaikka }
      itemQty: {},          // { esineen id: kpl } — korvaa varustelistan määrän
      itemsRemoved: [],     // poistettujen varusteiden id:t
      itemsCustom: [],      // appissa lisätyt varusteet, sama muoto kuin listassa
      levelUp: null,        // appissa tehty tasonnosto, kunnes se on viety Sheetiin
      updatedAt: null
    };
  },

  /* ---------------- Lataus ja tallennus ---------------- */

  load() {
    this.session = Object.assign(this.defaultSession(), readJson(STORAGE.session) || {});

    const d = readJson(STORAGE.durable) || {};
    this.durable = Object.assign(this.defaultDurable(), d);
    this.durable.money = Object.assign(this.defaultDurable().money, d.money || {});
    this.durable.langHours = d.langHours || {};
    this.durable.langTargets = d.langTargets || {};
    this.durable.langRanks = d.langRanks || {};
    this.durable.langUndo = d.langUndo || {};
    this.durable.log = Array.isArray(d.log) ? d.log : [];
    this.durable.itemLocations = d.itemLocations || {};
    this.durable.itemQty = d.itemQty || {};
    this.durable.itemsRemoved = Array.isArray(d.itemsRemoved) ? d.itemsRemoved : [];
    this.durable.itemsCustom = Array.isArray(d.itemsCustom) ? d.itemsCustom : [];

    // Vanha tallennus voi olla laskurin lähtöarvoa pienempi (ennen kuin
    // startTravelDay oli olemassa). Sitä pienempi matkapäivä ei ole mahdollinen.
    const firstDay = CONFIG.calendar.startTravelDay || 0;
    if (!Number.isFinite(this.durable.day) || this.durable.day < firstDay) {
      this.durable.day = firstDay;
    }
  },

  saveSession() { writeJson(STORAGE.session, this.session); },

  saveDurable() {
    this.durable.updatedAt = new Date().toISOString();
    writeJson(STORAGE.durable, this.durable);
  },

  /** Session-tason muutos (osumapisteet, tilavaikutukset, valinnat). */
  update(fn) {
    fn(this.session);
    this.saveSession();
    this.emit();
  },

  /** Laskee johdetut bonukset uudelleen (tasonnoston tai sääntömuutoksen jälkeen). */
  recompute() {
    if (!this.raw) return;
    this.character = Rules.compute(this.raw, this.durable && this.durable.levelUp);
    this.reconcile();
    this.emit();
  },

  /** Kertyvän datan muutos (päivät, muona, rahat, tunnit, päiväkirja). */
  updateDurable(fn) {
    fn(this.durable);
    this.saveDurable();
    this.emit();
  },

  /* ---------------- Yhteensovitus hahmodatan kanssa ---------------- */

  reconcile() {
    const c = this.character, s = this.session, d = this.durable;
    if (!c || !s || !d) return;

    if (s.hpCur === null || s.hpCur === undefined) s.hpCur = c.vitals.hitsMax;
    s.hpCur = clamp(s.hpCur, 0, c.vitals.hitsMax);

    if (s.ppCur === null || s.ppCur === undefined) s.ppCur = c.vitals.ppMax;
    s.ppCur = clamp(s.ppCur, 0, c.vitals.ppMax);

    const weaponIds = c.weapons.map(w => w.id);
    if (!weaponIds.includes(s.weaponId)) s.weaponId = weaponIds[0] || null;

    if (!s.defenseInit) {
      s.defenseOff = c.defense.filter(x => x.toggleable && x.on === false).map(x => x.id);
      s.defenseInit = true;
    }

    // Kielet: lomake antaa saavutetun tason ja mahdollisen tuntitavoitteen
    // (esim. "6->7", "112 h opiskelua"). Tunnit ja niiden myötä ansaitut tasot
    // ovat kertyvää dataa. Tavoite on tasokohtainen ja muokattavissa appissa.
    (c.languages || []).forEach(l => {
      ['spoken', 'written'].forEach(track => {
        const k = langKey(l.name, track);
        if (d.langHours[k] === undefined) d.langHours[k] = 0;
        if (d.langRanks[k] === undefined) d.langRanks[k] = 0;
        if (d.langTargets[k] === undefined) {
          d.langTargets[k] = (l.study && l.study.track === track && l.study.hoursNeeded)
            ? l.study.hoursNeeded
            : CONFIG.language.defaultHoursNeeded;
        }
      });
    });

    // Lähtörahat otetaan hahmolta vain kerran.
    if (!d.moneyInit) {
      CONFIG.coins.forEach(cn => { d.money[cn.key] = (c.money && c.money[cn.key]) || 0; });
      d.moneyInit = true;
    }

    // Varusteiden oletuspaikat Sheetistä, jos käyttäjä ei ole vaihtanut niitä.
    (c.inventory || []).forEach(i => {
      if (d.itemLocations[i.id] === undefined) d.itemLocations[i.id] = i.location || '';
    });

    this.saveSession();
    this.saveDurable();
  },

  /* ---------------- Nollaukset ---------------- */

  /** Uusi pelisessio: osumapisteet täyteen, vaikutukset pois. Kertyvä data säilyy. */
  resetSession() {
    this.session = this.defaultSession();
    this.reconcile();
    this.emit();
  },

  /** Kertyvän datan nollaus: päivät, muona, rahat, tunnit, päiväkirja. */
  resetDurable() {
    this.durable = this.defaultDurable();
    this.reconcile();
    this.emit();
  },

  /* ---------------- Varusteet ---------------- */

  /** Näytettävä varustelista: js/inventory-data.js:n lista, johon on sovellettu
      kertyvän datan muutokset — poistot, kpl-määrät ja appissa lisätyt esineet.
      Pohjalista pysyy koskemattomana, joten sen muokkaus näkyy heti eikä
      käyttäjän tekemiä muutoksia tarvitse purkaa. */
  inventory() {
    const d = this.durable, c = this.character;
    const removed = d.itemsRemoved || [];
    const base = ((c && c.inventory) || [])
      .filter(i => removed.indexOf(i.id) < 0)
      .map(i => Object.assign({}, i, { qty: this.qtyOf(i) }));
    const custom = (d.itemsCustom || [])
      .map(i => Object.assign({}, i, { custom: true, qty: this.qtyOf(i) }));
    return base.concat(custom);
  },

  /** Esineen kappalemäärä: kertyvä arvo voittaa listan oletuksen. */
  qtyOf(item) {
    const set = this.durable.itemQty[item.id];
    return Number.isFinite(set) ? set : (item.qty || 1);
  },

  /** Uusi id lisätylle varusteelle. Omat esineet erotetaan c-etuliitteellä,
      jotta ne eivät koskaan törmää pohjalistan id:hin. */
  nextItemId() {
    const used = (this.durable.itemsCustom || []).map(i => i.id);
    let n = 1;
    while (used.indexOf('c' + n) >= 0) n++;
    return 'c' + n;
  },

  /* ---------------- Kertyvän datan vienti ---------------- */

  /** Sheetiin vietävä muoto: yksi litteä objekti + rivilistat. */
  exportDurable() {
    const d = this.durable;
    const c = this.character;
    return {
      updatedAt: d.updatedAt || new Date().toISOString(),
      character: c ? c.meta.name : '',
      day: d.day,
      date: typeof Calendar !== 'undefined' ? Calendar.format(d.day) : String(d.day),
      food: d.food,
      money: Object.assign({}, d.money),
      langHours: Object.assign({}, d.langHours),
      langTargets: Object.assign({}, d.langTargets),
      langRanks: Object.assign({}, d.langRanks),
      itemLocations: Object.assign({}, d.itemLocations),
      itemQty: Object.assign({}, d.itemQty),
      itemsRemoved: (d.itemsRemoved || []).slice(),
      itemsCustom: (d.itemsCustom || []).map(i => Object.assign({}, i)),
      levelUp: d.levelUp ? JSON.parse(JSON.stringify(d.levelUp)) : null,
      // Varusteet myös nimillä, jotta vienti on luettavaa ilman id-kartoitusta.
      inventory: this.inventory().map(i => ({
        name: i.name,
        qty: i.qty,
        slot: d.itemLocations[i.id] !== undefined ? d.itemLocations[i.id] : (i.location || ''),
        note: i.note || '',
        custom: !!i.custom
      })),
      log: d.log.map(e => Object.assign({}, e, {
        date: typeof Calendar !== 'undefined' ? Calendar.format(e.day) : '',
        moon: typeof Moon !== 'undefined' ? Moon.phaseName(e.day) : '',
        moonDay: typeof Moon !== 'undefined' ? Moon.cycleDay(e.day) : null,
        moonLit: typeof Moon !== 'undefined' ? Math.round(Moon.illumination(e.day) * 100) : null
      }))
    };
  },

  /** Sama tekstinä, valmiina liitettäväksi Sheetiin (sarkainerotettu). */
  exportDurableTsv() {
    const TAB = String.fromCharCode(9);
    const d = this.durable;
    const lines = [];
    lines.push('key\tvalue');
    lines.push('updatedAt\t' + (d.updatedAt || ''));
    // Tasonnosto: uudet tasot ja ominaisuusarvot lomakkeeseen kirjattavaksi
    if (d.levelUp) {
      lines.push('');
      lines.push('TASONNOSTO');
      lines.push('uusi taso' + TAB + d.levelUp.level);
      lines.push('kehityspisteet' + TAB + d.levelUp.spent);
      const names = this.character
        ? this.character.skills.reduce((m, x) => { m[x.id] = x.display || x.name; return m; }, {})
        : {};
      Object.keys(d.levelUp.ranks || {}).forEach(id =>
        lines.push('taito: ' + (names[id] || id) + TAB + d.levelUp.ranks[id] + ' tasoa'));
      Object.keys(d.levelUp.stats || {}).forEach(code => {
        const st = d.levelUp.stats[code];
        lines.push('ominaisuus: ' + code + TAB + st.temp + ' / ' + st.pot);
      });
    }

    lines.push('day\t' + d.day);
    lines.push('food\t' + d.food);
    CONFIG.coins.forEach(c => lines.push(c.key + '\t' + (d.money[c.key] || 0)));
    Object.keys(d.langHours).forEach(k => lines.push('lang:' + k + '\t' + d.langHours[k]));

    // Varusteet omana taulukkonaan ja nimillä: pelkkä id ei kerro lokia
    // lukevalle mitään. Poistetut ovat mukana, jotta lokista näkee myös sen
    // mitä matkalla hävisi tai kului loppuun.
    lines.push('');
    lines.push('VARUSTEET');
    lines.push(['esine', 'kpl', 'kantopaikka', 'tila', 'tarkenne'].join(TAB));
    const slotOf = i => d.itemLocations[i.id] !== undefined
      ? d.itemLocations[i.id] : (i.location || '');
    this.inventory().forEach(i => lines.push(
      [i.name, i.qty, slotOf(i) || '-', i.custom ? 'lisatty' : '', i.note || ''].join(TAB)));
    const removed = d.itemsRemoved || [];
    ((this.character && this.character.inventory) || [])
      .filter(i => removed.indexOf(i.id) >= 0)
      .forEach(i => lines.push([i.name, 0, '-', 'poistettu', i.note || ''].join(TAB)));

    // Päiväkirja. Kuun vaihe on pelin kannalta olennainen, joten se kulkee
    // päiväyksen rinnalla eikä jää vain appiin.
    lines.push('');
    lines.push(['day', 'date', 'kuu', 'kuun pv', 'valaistus %',
                'meals', 'langHours', 'spentBase', 'notes'].join(TAB));
    d.log.forEach(e => {
      const lang = Object.keys(e.lang || {}).reduce((s, k) => s + e.lang[k], 0);
      const spent = (e.spend || []).reduce((s, x) => s + x.base, 0);
      const notes = (e.spend || []).map(x => x.label).filter(Boolean).join('; ');
      // Vaihenimi kattaa useamman päivän, joten kierron päivä ja valaistus
      // ovat mukana omina sarakkeinaan.
      const hasMoon = typeof Moon !== 'undefined';
      const moon = hasMoon ? Moon.phaseName(e.day) : '';
      const moonDay = hasMoon ? Moon.cycleDay(e.day) + '/' + CONFIG.moon.cycleDays : '';
      const lit = hasMoon ? Math.round(Moon.illumination(e.day) * 100) : '';
      // Päiväys lasketaan päivänumerosta eikä lueta merkinnästä: kalenterin
      // asetukset ovat muuttuneet kesken kampanjan, jolloin tallennettu päiväys
      // olisi vanhentunut.
      const date = typeof Calendar !== 'undefined' ? Calendar.format(e.day) : (e.date || '');
      lines.push([e.day, date, moon, moonDay, lit, e.meals === null ? '' : e.meals,
                  lang, spent, notes].join(TAB));
    });

    // Päivän tapahtumat: taidot, loitsut, taisteluheitot ja osumapisteet.
    // Omana taulukkonaan, koska niitä on päivää kohti vaihteleva määrä.
    const labels = { skill: 'taito', spell: 'loitsu', fight: 'taistelu alkoi',
                     hp: 'osumapisteet', act: 'toimi' };
    if (d.log.some(e => (e.events || []).length || (e.spend || []).length)) {
      lines.push('');
      lines.push('TAPAHTUMAT');
      lines.push(['day', 'date', 'laji', 'nimi', 'arvo'].join(TAB));
      d.log.forEach(e => {
        const day = typeof Calendar !== 'undefined' ? Calendar.format(e.day) : (e.date || '');
        // Ostokset ovat omassa listassaan, mutta lokissa ne kuuluvat samaan
        // tapahtumavirtaan kuin kaikki muukin päivän toiminta.
        (e.spend || []).forEach(sp => lines.push(
          [e.day, day, 'ostos', sp.label || 'ostos',
           '-' + (typeof Money !== 'undefined' ? Money.formatBase(sp.base) : sp.base)].join(TAB)));

        (e.events || []).forEach(x => {
          const laji = x.t === 'roll'
            ? (x.target === 'attack' ? 'hyokkays' : 'puolustus')
            : (labels[x.t] || x.t);
          const arvo = x.t === 'spell' ? '-' + x.pp + ' pp'
                     : x.t === 'hp' ? (x.delta > 0 ? '+' : '') + x.delta
                     : x.t === 'act' ? (typeof DayLog !== 'undefined' ? DayLog.actValue(x)
                                        : (x.value || x.delta))
                     : (x.total === undefined ? '' : x.total);
          const nimi = [x.name || x.label || '', x.round ? 'kierros ' + x.round : '', x.note || '']
            .filter(Boolean).join(' · ');
          lines.push([e.day, day, laji, nimi, arvo].join(TAB));
        });
      });
    }

    return lines.join('\n');
  },

  /* ---------------- Tilaan reagointi ---------------- */

  onChange(fn) { this.listeners.push(fn); },
  emit() { this.listeners.forEach(fn => fn(this.character, this.session, this.durable)); }
};
