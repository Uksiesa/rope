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

  character: null,
  session: null,
  durable: null,
  listeners: [],

  /* ---------------- Hahmodata ---------------- */

  setCharacter(data, meta) {
    // Varmistetaan että kaikki listat ovat olemassa, vaikka välilehti puuttuisi.
    ['stats', 'skills', 'weapons', 'defense', 'spells', 'guilds',
     'resists', 'languages', 'inventory'].forEach(k => {
      if (!Array.isArray(data[k])) data[k] = [];
    });
    if (!data.vitals) data.vitals = { hitsMax: 0, ppMax: 0 };
    if (!data.money) data.money = {};
    this.character = data;
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
      spellId: null
    };
  },

  defaultDurable() {
    const money = {};
    CONFIG.coins.forEach(c => { money[c.key] = 0; });
    return {
      day: 0,               // kuluneita matkapäiviä aloituspäivästä
      food: CONFIG.food.startUnits,
      money: money,
      moneyInit: false,
      langHours: {},        // { "kieli|spoken"|"kieli|written": kertyneet tunnit }
      langTargets: {},      // sama avain: montako tuntia seuraava taso vaatii
      langRanks: {},        // sama avain: lomakkeen tason päälle ansaitut tasot
      log: [],              // päiväkirja, ks. Adventure-moduuli
      itemLocations: {},    // { esineen id: kantopaikka }
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
    this.durable.log = Array.isArray(d.log) ? d.log : [];
    this.durable.itemLocations = d.itemLocations || {};
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
      log: d.log.map(e => Object.assign({}, e))
    };
  },

  /** Sama tekstinä, valmiina liitettäväksi Sheetiin (sarkainerotettu). */
  exportDurableTsv() {
    const d = this.durable;
    const lines = [];
    lines.push('key\tvalue');
    lines.push('updatedAt\t' + (d.updatedAt || ''));
    lines.push('day\t' + d.day);
    lines.push('food\t' + d.food);
    CONFIG.coins.forEach(c => lines.push(c.key + '\t' + (d.money[c.key] || 0)));
    Object.keys(d.langHours).forEach(k => lines.push('lang:' + k + '\t' + d.langHours[k]));
    Object.keys(d.itemLocations).forEach(k => lines.push('slot:' + k + '\t' + d.itemLocations[k]));
    lines.push('');
    lines.push('day\tdate\tmeals\tlangHours\tspentBase\tnotes');
    d.log.forEach(e => {
      const lang = Object.keys(e.lang || {}).reduce((s, k) => s + e.lang[k], 0);
      const spent = (e.spend || []).reduce((s, x) => s + x.base, 0);
      const notes = (e.spend || []).map(x => x.label).filter(Boolean).join('; ');
      lines.push([e.day, e.date || '', e.meals === null ? '' : e.meals, lang, spent, notes].join('\t'));
    });
    return lines.join('\n');
  },

  /* ---------------- Tilaan reagointi ---------------- */

  onChange(fn) { this.listeners.push(fn); },
  emit() { this.listeners.forEach(fn => fn(this.character, this.session, this.durable)); }
};
