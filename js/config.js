/* Kaikki kampanjakohtaiset asetukset yhdessä paikassa.
   Muokkaa tätä tiedostoa, ei muuta koodia. */

const CONFIG = {

  /* ---------- Datalähde ---------- */
  data: {
    // 'seed'   = käytä js/seed-data.js -tiedoston lähtötietoja (toimii offline)
    // 'sheets' = lue hahmolomake Google Sheetsistä, seed-data varalla
    source: 'sheets',

    sheets: {
      // Hahmolomakkeen id osoitteesta .../spreadsheets/d/<TÄMÄ>/edit
      spreadsheetId: '1SpiqV8YcrjZ4apqzacSFINM0N2jeE93E6cUEyHVWfHY',

      // Välilehtien gid:t. Löytyvät osoiterivistä kun välilehti on auki:
      // .../edit#gid=761231743
      gids: {
        character: 1754872422,   // "Character"
        skills:    761231743,    // "Skills or capabilities"
        durable:   null          // syntyy vasta kun kertyvän datan vienti otetaan käyttöön
      },

      // Kertyvän datan kirjoitus takaisin Sheetiin.
      // Vaatii Apps Script -web appin (ks. docs/kertyva-data.md).
      // Tyhjänä kirjoitus on pois käytöstä ja käytetään leikepöytävientiä.
      writeUrl: '',

      // Jaettu salasana, joka lähetetään kirjoituspyynnön mukana ja tarkistetaan
      // Apps Scriptissä. Estää satunnaiset kirjoitukset, jos osoite vuotaa.
      writeToken: 'vaihda-tama'
    }
  },

  /* ---------- Kalenteri ---------- */
  calendar: {
    // Kuukaudet: nimi + päivien määrä. Vaihda vapaasti — myös määrä saa muuttua.
    months: [
      { name: 'Jäätalvi',    days: 30 },
      { name: 'Suvenodotus', days: 30 },
      { name: 'Kylvökuu',    days: 30 },
      { name: 'Lehtikuu',    days: 30 },
      { name: 'Kukkakuu',    days: 30 },
      { name: 'Aurinkokuu',  days: 30 },
      { name: 'Heinäkuu',    days: 30 },
      { name: 'Elokuu',      days: 30 },
      { name: 'Sadonkorjuu', days: 30 },
      { name: 'Ruskakuu',    days: 30 },
      { name: 'Sumukuu',     days: 30 },
      { name: 'Pimeäkuu',    days: 30 }
    ],
    // Kampanjan aloituspäivä. monthIndex 0 = ensimmäinen kuukausi yllä.
    start: { year: 4761, monthIndex: 2, day: 14 },
    yearSuffix: 'Uuden ajan vuosi'
  },

  /* ---------- Kuun kierto ---------- */
  moon: {
    cycleDays: 28,   // kierron pituus päivinä
    startPhase: 6,   // monesko päivä kierrossa kampanjan aloituspäivänä (0 = uusikuu)
    phases: [
      { name: 'Uusikuu',              at: 0.000 },
      { name: 'Kasvava sirppi',       at: 0.125 },
      { name: 'Ensimmäinen neljännes',at: 0.250 },
      { name: 'Kasvava kupu',         at: 0.375 },
      { name: 'Täysikuu',             at: 0.500 },
      { name: 'Vähenevä kupu',        at: 0.625 },
      { name: 'Viimeinen neljännes',  at: 0.750 },
      { name: 'Vähenevä sirppi',      at: 0.875 }
    ]
  },

  /* ---------- Muona ---------- */
  food: {
    startUnits: 24,
    barMax: 40,        // täysi palkki tällä määrällä
    lowWarning: 6      // varoitus tämän alle
  },

  /* ---------- Rahat ---------- */
  // Järjestys ylhäältä alas: 1 ylempi = 10 alempaa.
  coins: [
    { key: 'gold',   name: 'Kulta',   short: 'kp', color: '#e0b243' },
    { key: 'silver', name: 'Hopea',   short: 'hp', color: '#c6ccd6' },
    { key: 'bronze', name: 'Pronssi', short: 'pp', color: '#c08457' },
    { key: 'copper', name: 'Kupari',  short: 'kup', color: '#b06a3b' }
  ],
  coinRatio: 10,

  // Valmiit selitteet ostoksille päiväkirjaan.
  spendLabels: ['Muona', 'Varusteet', 'Majoitus', 'Ratsu', 'Lahjus', 'Muu'],

  /* ---------- Kielet ---------- */
  language: {
    // Tuntitavoite kasvaa tason mukana, joten se annetaan kielikohtaisesti
    // appissa ("Tavoite"-nappi Matka-välilehdellä). Lomakkeen merkintä
    // (esim. "14 pv -> 112 h opiskelua") luetaan lähtöarvoksi.
    // 0 = ei oletusta, tavoite kysytään käyttäjältä.
    defaultHoursNeeded: 0,
    hoursPerDay: 8,
    quickAdd: [1, 2, 4, 8]
  },

  /* ---------- Taistelu ---------- */
  combat: {
    // Osumapisteiden varoitusrajat (osuus maksimista).
    hpWarn: 0.5,
    hpDanger: 0.25,
    splitStep: 5,

    // Tilavaikutusten oletukset. rounds = kierroksia, perRound = hp/kierros.
    effectPresets: [
      { type: 'stun',  name: 'Tainnutus',        rounds: 2 },
      { type: 'stun',  name: 'Toimintakyvytön',  rounds: 1 },
      { type: 'stun',  name: 'Huimaus',          rounds: 3 },
      { type: 'bleed', name: 'Verenvuoto',       perRound: 1 },
      { type: 'bleed', name: 'Paha verenvuoto',  perRound: 3 }
    ]
  },

  /* ---------- Avoin heitto ----------
     RoleMasterin d100 on avoin: korkea heitto heitetään uudelleen ja lisätään,
     matala heitetään uudelleen ja vähennetään. Appi ei päätä puolestasi milloin
     ketjua jatketaan — se vain laskee summan ja ehdottaa jatkoa näillä rajoilla. */
  openEnded: {
    high: 96,   // tästä ylöspäin ehdotetaan uutta heittoa, joka lisätään
    low: 5      // tästä alaspäin ehdotetaan uutta heittoa, joka vähennetään (0 = pois)
  },

  /* ---------- Taikuus ---------- */
  magic: {
    ppWarn: 0.5,
    ppDanger: 0.25
  },

  /* ---------- Hahmon kuva ----------
     Ensimmäinen löytyvä tiedosto näytetään hahmolomakkeen yläreunassa.
     Tallenna kuva kansioon img/ jollain näistä nimistä. Jos tiedostoa ei ole,
     kuvapaikka piilotetaan eikä mitään rikkoudu. */
  portrait: ['img/hahmo.jpg', 'img/hahmo.png', 'img/hahmo.jpeg', 'img/hahmo.webp'],

  /* ---------- Varusteiden kantopaikat ---------- */
  slots: [
    'Kädessä', 'Yllä', 'Vyöllä', 'Selässä', 'Reppu',
    'Viini', 'Pussi', 'Ratsun kuormassa', 'Leirissä'
  ],

  /* ---------- Puhetunnistus ---------- */
  speech: {
    lang: 'fi-FI'
  }
};
