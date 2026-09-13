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
        rules:     1135503206,   // "Rules": ominaisuusbonus-, kehityspiste- ja
                                 //          voimapistetaulukot + taitoluokkien tasobonus
        spells:    354842485,    // "Spell bonus": loitsujen vaikutukset
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
      { name: 'Tammikuu',     days: 31 },
      { name: 'Helmikuu',     days: 28 },
      { name: 'Maaliskuu',    days: 31 },
      { name: 'Huhtikuu',     days: 30 },
      { name: 'Toukokuu',     days: 31 },
      { name: 'Kesäkuu',      days: 30 },
      { name: 'Heinäkuu',     days: 31 },
      { name: 'Elokuu',       days: 31 },
      { name: 'Syyskuu',      days: 30 },
      { name: 'Lokakuu',      days: 31 },
      { name: 'Marraskuu',    days: 30 },
      { name: 'Joulukuu',     days: 31 }
    ],
    // Kampanjan aloituspäivä. monthIndex 0 = ensimmäinen kuukausi yllä.
    start: { year: 4761, monthIndex: 9, day: 26 },
    yearSuffix: 'Uuden ajan vuosi'
  },

  /* ---------- Kuun kierto ---------- */
  moon: {
    cycleDays: 28,   // kierron pituus päivinä
    startPhase: 23,   // monesko päivä kierrossa kampanjan aloituspäivänä (0 = uusikuu)
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
    startUnits: 14,
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

  /* ---------- Bonuslaskennan taulukot ----------
     Nämä ovat oletukset. Sheetin Rules-välilehti korvaa ne, jos se on olemassa
     ja gids.rules on asetettu. Arvot alla on johdettu Ballarionin lomakkeesta,
     joten ne kattavat vain hänen nykyiset ominaisuusarvonsa — täydellinen
     taulukko kuuluu Rules-välilehdelle. */
  rules: {
    // Tasojen tuotto: 0 tasoa on rangaistus, sitten laskeva tuotto.
    noRankPenalty: -25,
    rankProgression: [
      { ranks: 10, perRank: 5 },
      { ranks: 10, perRank: 2 },
      { ranks: 10, perRank: 1 }
    ],

    // Ominaisuusarvo -> bonus
    statBonus: [
      { from: 50, to: 50, value: 0 },
      { from: 59, to: 59, value: 1 },
      { from: 67, to: 67, value: 3 },
      { from: 70, to: 70, value: 0 },
      { from: 73, to: 73, value: 5 },
      { from: 90, to: 90, value: 12 },
      { from: 95, to: 95, value: 20 },
      { from: 96, to: 96, value: 22 },
      { from: 97, to: 97, value: 24 },
      { from: 98, to: 98, value: 26 },
      { from: 101, to: 101, value: 35 }
    ],

    // Ominaisuusarvo -> kehityspisteitä tasoa kohti
    devPoints: [
      { from: 50, to: 50, value: 9.6 },
      { from: 59, to: 59, value: 9.9 },
      { from: 90, to: 90, value: 12.8 },
      { from: 95, to: 95, value: 13.8 },
      { from: 96, to: 96, value: 14.0 }
    ],

    // Ominaisuusarvo -> voimapisteitä tasoa kohti
    powerPoints: [
      { from: 73, to: 73, value: 2.4 },
      { from: 98, to: 98, value: 3.9 },
      { from: 101, to: 101, value: 4.2 }
    ],

    // Ammatin tasokerroin taitokategorioittain (Laulaja)
    levelBonus: {
      'Sosiaaliset': 3,
      'Kielet': 2,
      'Taiteet': 2,
      'Urheilu': 1
    },

    // Kiltatason tuottamat ominaisuusbonukset. Tyhjänä käytetään lomakkeen
    // Extra-saraketta sellaisenaan.
    guildBonus: [],

    // Osumapisteet: perusarvo + kestävyysbonus + taso × tasokerroin.
    // Kerroin riippuu ammatista ja voi vaihdella tason mukaan; Laulajalla se on
    // aina 2. Väliperustainen taulukko, jossa Alkaen/Asti ovat hahmon tasoja.
    hitsPerLevel: [
      { from: 1, to: 99, value: 2 }
    ],

    // Fumble-arvo aseille joita ei ole lomakkeen WEAPONS-taulukossa
    // (aseeton taistelu, suunnatut taiat). Heitto <= arvo on fumble.
    defaultFumble: 5,

    // Taidot joiden Classes-solu ei kerro oikeaa ominaisuutta. Lomakkeessa
    // aseettoman taistelun rivit ovat identtiset, vaikka lyönti käyttää Voimaa
    // ja heitto Ketteryyttä.
    classesOverride: {
      'Aseeton taistelu - lyönti': 'Vo',
      'Aseeton taistelu - heitto': 'K'
    },

    // Taidot joissa lomakkeen oma luku tiedetään virheelliseksi. Laskennan tulos
    // on oikea; nämä näkyvät poikkeamalistassa erikseen merkittyinä.
    sheetErrors: ['Toisapu', 'Sääennustus'],

    settings: {
      hitsBase: 30,
      hitsStat: 'T',
      quicknessStat: 'N',
      ppStats: ['O', 'Va', 'E'],
      dpStats: ['T', 'K', 'I', 'M', 'P']
    }
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
