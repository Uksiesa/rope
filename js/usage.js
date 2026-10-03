/* KÄYTTÖLOKI — mittaa appin omaa käyttöä, ei pelin tapahtumia.

   Tarkoitus on yksi: nähdä mihin pelin aikana kuluu aikaa, jotta käyttöliittymä
   voidaan järjestää tukemaan pelaamista eikä hidastamaan sitä. Siksi mitataan
   nimenomaan matkaa toiminnon alusta tulokseen — näkymän avaus, selaaminen,
   haku, valinta, heitto — eikä pelkkiä painalluksia.

   Data pysyy laitteella (localStorage, avain tm.usage.v1) eikä kulje mihinkään.
   Puskuri on rengas: vanhimmat tapahtumat putoavat pois kun raja täyttyy.

   Tapahtuman muoto on tahallaan lyhyt, koska niitä kertyy tuhansia:
     t  aikaleima (ms)
     k  laji: view, scroll, search, pick, roll, cast, tweak, tap
     v  kohde (näkymän tai taidon nimi)
     ms kesto edellisestä merkityksellisestä hetkestä
     ...lajikohtaisia kenttiä */

const Usage = {

  KEY: 'tm.usage.v1',
  MAX: 3000,

  buf: [],
  view: null,
  viewAt: 0,
  maxScroll: 0,
  marks: {},
  saveTimer: null,

  /* ---------------- Perusta ---------------- */

  init() {
    try {
      const raw = localStorage.getItem(this.KEY);
      this.buf = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(this.buf)) this.buf = [];
    } catch (e) { this.buf = []; }

    // Vierityksen syvyys kertoo, kuinka kaukana tarvittu asia oli. Luku otetaan
    // talteen vasta näkymää vaihdettaessa, joten vierityksestä ei synny ryöppyä.
    window.addEventListener('scroll', () => {
      const y = window.scrollY + window.innerHeight;
      if (y > this.maxScroll) this.maxScroll = y;
    }, { passive: true });

    // Appi suljetaan usein kesken kaiken, joten viimeinen näkymä kirjataan ulos.
    window.addEventListener('pagehide', () => { this.closeView(); this.flush(); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') { this.closeView(); this.flush(); }
    });
  },

  log(kind, data) {
    this.buf.push(Object.assign({ t: Date.now(), k: kind }, data || {}));
    if (this.buf.length > this.MAX) this.buf.splice(0, this.buf.length - this.MAX);
    this.save();
  },

  /** Kirjoitus viivästetään, jottei jokainen näppäily käy localStoragessa. */
  save() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.flush(), 1200);
  },

  flush() {
    clearTimeout(this.saveTimer);
    try { localStorage.setItem(this.KEY, JSON.stringify(this.buf)); } catch (e) { /* täynnä: ohitetaan */ }
  },

  clear() {
    this.buf = [];
    this.flush();
  },

  /* ---------------- Mittauspisteet ---------------- */

  /** Näkymän vaihto. Edellisestä kirjataan kesto ja kuinka syvälle vieritettiin. */
  enterView(name) {
    this.closeView();
    this.view = name;
    this.viewAt = Date.now();
    this.maxScroll = window.innerHeight;
    this.marks = {};
  },

  closeView() {
    if (!this.view) return;
    const screens = window.innerHeight ? this.maxScroll / window.innerHeight : 1;
    this.log('view', {
      v: this.view,
      ms: Date.now() - this.viewAt,
      scr: Math.round(screens * 10) / 10
    });
    this.view = null;
  },

  /** Merkki, josta seuraava kesto lasketaan (esim. taidon valinta). */
  mark(name) { this.marks[name] = Date.now(); },

  since(name) {
    const at = this.marks[name] || this.viewAt;
    return at ? Date.now() - at : 0;
  },

  /** Haku: pituus ja osumien määrä kertovat, löytyykö asia hakemalla vai ei. */
  search(mode, query, hits) {
    this.log('search', { v: mode, len: String(query || '').length, hits: hits });
  },

  /** Valinta listasta. via = miten löytyi, idx = monesko rivi listassa.
      Rivinumero on ykkösestä alkava, jotta ylimmän rivin valinta erottuu
      puuttuvasta tiedosta. */
  pick(mode, name, via, idx) {
    this.log('pick', {
      v: name, m: mode, via: via,
      idx: idx >= 0 ? idx + 1 : null,
      ms: this.since('enter')
    });
    this.mark('pick');
  },

  /** Heitto: aika valinnasta heittoon on se luku, jota kannattaa pienentää. */
  roll(mode, extra) {
    this.log('roll', Object.assign({ v: mode, ms: this.since('pick') }, extra || {}));
  },

  /** Säätö jota tehdään toistuvasti: jako, kantopaikka, modi. */
  tweak(what, value) { this.log('tweak', { v: what, val: value }); },

  /** Yksittäinen painallus jolle ei ole omaa lajia. */
  tap(what) { this.log('tap', { v: what }); },

  /* ---------------- Yhteenveto ---------------- */

  /** Luvut jotka kertovat onko appi pelin tiellä. Laskenta tehdään vasta
      pyydettäessä, koska se käy koko puskurin läpi. */
  summary() {
    const b = this.buf;
    const views = {};
    b.filter(x => x.k === 'view').forEach(x => {
      const v = views[x.v] || (views[x.v] = { ms: 0, visits: 0, scr: 0 });
      v.ms += x.ms || 0;
      v.visits += 1;
      v.scr = Math.max(v.scr, x.scr || 0);
    });

    const picks = b.filter(x => x.k === 'pick');
    const rolls = b.filter(x => x.k === 'roll');
    const vias = {};
    picks.forEach(p => { vias[p.via || '?'] = (vias[p.via || '?'] || 0) + 1; });

    const med = arr => {
      const s = arr.filter(n => Number.isFinite(n) && n > 0).sort((a, b2) => a - b2);
      return s.length ? s[Math.floor(s.length / 2)] : 0;
    };

    const top = (list, key, n) => {
      const c = {};
      list.forEach(x => { if (x[key]) c[x[key]] = (c[x[key]] || 0) + 1; });
      return Object.keys(c).sort((a, b2) => c[b2] - c[a]).slice(0, n).map(k => ({ name: k, n: c[k] }));
    };

    return {
      events: b.length,
      from: b.length ? b[0].t : 0,
      to: b.length ? b[b.length - 1].t : 0,
      views: views,
      searches: b.filter(x => x.k === 'search').length,
      medFind: med(picks.map(p => p.ms)),     // näkymän avauksesta valintaan
      medRoll: med(rolls.map(r => r.ms)),     // valinnasta heittoon
      medDepth: med(picks.map(p => p.idx)),   // kuinka alhaalta listasta valittiin
      vias: vias,
      topSkills: top(picks.filter(p => p.m === 'action'), 'v', 5),
      topSpells: top(b.filter(x => x.k === 'cast'), 'v', 5),
      topTweaks: top(b.filter(x => x.k === 'tweak'), 'v', 5)
    };
  },

  /** Koko loki sarkainerotettuna, valmiina taulukkolaskentaan. */
  exportTsv() {
    const TAB = String.fromCharCode(9);
    const cols = ['t', 'aika', 'k', 'v', 'm', 'via', 'idx', 'len', 'hits', 'ms', 'scr', 'val'];
    const lines = [cols.join(TAB)];
    this.buf.forEach(x => {
      lines.push([
        x.t, new Date(x.t).toISOString(), x.k, x.v === undefined ? '' : x.v,
        x.m || '', x.via || '', x.idx === undefined ? '' : x.idx,
        x.len === undefined ? '' : x.len, x.hits === undefined ? '' : x.hits,
        x.ms === undefined ? '' : x.ms, x.scr === undefined ? '' : x.scr,
        x.val === undefined ? '' : x.val
      ].join(TAB));
    });
    return lines.join('\n');
  }
};
