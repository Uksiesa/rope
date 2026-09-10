/* Lähtötiedot: Ballarionin hahmolomake Google Sheetsistä.

   Tämä tiedosto on generoitu js/sheets.js -parserilla samasta lomakkeesta, jota
   appi lukee live-tilassa (CONFIG.data.source = 'sheets'). Mockup-tilassa data
   tulee tästä, joten appi toimii myös ilman verkkoyhteyttä ja Sheets-asetuksia.

   Älä muokkaa käsin: päivitä lomake Sheetsissä ja hae data appin ⟳-napilla. */

const SEED_CHARACTER = {

  meta: {
      "name": "Ballarion",
      "profession": "Laulaja",
      "culture": "Callisitren",
      "race": "",
      "sex": "Mies",
      "height": "175 cm",
      "weight": "81 kg",
      "level": 7,
      "exp": 91400,
      "player": "",
      "realm": "",
      "age": "",
      "hair": "",
      "eyes": "",
      "bio": "",
      "notes": [
          {
              "label": "Kirjastokortit",
              "value": "Callisitren, Virta, Hilu, Mykkyys, Tamarang, Hiner, Tirkan, Flabad, Wyner, Aalto, Aydindril kaupunginkirjasto, Kloom, Mirn, Rippla"
          },
          {
              "label": "Muuta",
              "value": "Killattoman ominaisuusbonus tasolla 2: +1 olemus. Kameleonttisuden lihan syömisestä +5 bonus esineet -taitoon, viihdyttäjäkillan ominaisuusbonus tasolla 1: +1 ketteryys; viihdyttäjäkillan ominaisuustaso tasolla 2: +1 olemus; taikurikillan ominaisuusbonus tasolla 1: +1 olemus;"
          }
      ]
  },

  vitals: {"hitsMax":49,"ppMax":25},

  /* Ominaisuudet. bonus = lomakkeen "Total" (Normal + Extra). */
  stats: [
    {"code":"T","name":"Terveys","english":"Constitution","temp":50,"pot":50,"bonusNormal":0,"bonusExtra":5,"bonus":5},
    {"code":"K","name":"Ketteryys","english":"Agility","temp":96,"pot":96,"bonusNormal":22,"bonusExtra":1,"bonus":23},
    {"code":"I","name":"Itsekuri","english":"Self-Discipline","temp":59,"pot":59,"bonusNormal":1,"bonusExtra":0,"bonus":1},
    {"code":"M","name":"Muisti","english":"Memory","temp":90,"pot":90,"bonusNormal":12,"bonusExtra":0,"bonus":12},
    {"code":"P","name":"Päättely","english":"Reasoning","temp":95,"pot":95,"bonusNormal":20,"bonusExtra":0,"bonus":20},
    {"code":"Vo","name":"Voima","english":"Strength","temp":67,"pot":68,"bonusNormal":3,"bonusExtra":5,"bonus":8},
    {"code":"N","name":"Nopeus","english":"Quickness","temp":97,"pot":97,"bonusNormal":24,"bonusExtra":0,"bonus":24},
    {"code":"O","name":"Olemus","english":"Presence","temp":101,"pot":101,"bonusNormal":35,"bonusExtra":1,"bonus":36},
    {"code":"Va","name":"Vaisto","english":"Intuition","temp":98,"pot":98,"bonusNormal":26,"bonusExtra":0,"bonus":26},
    {"code":"E","name":"Empatia","english":"Empathy","temp":73,"pot":73,"bonusNormal":5,"bonusExtra":0,"bonus":5},
    {"code":"AP","name":"Ulkonäkö","english":"Appearance","temp":70,"pot":0,"bonusNormal":0,"bonusExtra":0,"bonus":0}
  ],

  /* Killat ja taso niissä. */
  guilds: [
    {"name":"Viihdyttäjät","level":2,"rank":"","since":"","note":""},
    {"name":"Taikurit","level":1,"rank":"","since":"","note":""}
  ],

  /* Kielet. spoken/written = saavutettu taso; study = kesken oleva opiskelu. */
  languages: [
    {"name":"Midland","spoken":8,"written":8,"study":null},
    {"name":"D'Hara","spoken":7,"written":6,"study":{"track":"written","from":6,"to":7,"hoursNeeded":112,"note":"14 pv -> 112 h opiskelua (kirj.)"}},
    {"name":"Uusi maailma","spoken":3,"written":0,"study":null}
  ],

  /* Panssari ja puolustus sellaisena kuin lomakkeessa. */
  armor: {"type":"AT5 +10","db":34,"shield":"-","helm":"-","armGreaves":"-","legGreaves":"-"},

  defense: [
    {"id":"d-qu","name":"Nopeusbonus (N)","value":24,"toggleable":false,"on":true,"note":"Aina mukana"},
    {"id":"d-armor","name":"Haarniska AT5 +10","value":10,"toggleable":true,"on":true,"note":"Lomakkeen DB 34 − nopeusbonus"}
  ],

  /* Aseet: OB tulee vastaavasta taidosta. */
  weapons: [
    {"id":"w-quarterstaff","name":"Quarterstaff","ob":89,"table":"","note":"ase +15M · fumble 03","canParry":true,"blocks":[]},
    {"id":"w-aseeton-heitto","name":"Aseeton — heitto","ob":63,"table":"","note":"","canParry":true,"blocks":[]},
    {"id":"w-aseeton-lyönti","name":"Aseeton — lyönti","ob":48,"table":"","note":"","canParry":true,"blocks":[]},
    {"id":"w-suunnatut-taiat","name":"Suunnatut taiat","ob":43,"table":"","note":"ei parrya","canParry":false,"blocks":[]}
  ],

  /* Loitsulistat: bonus on listan taitobonus (heittoon lisättävä). */
  spellLists: [
    {"id":"sl-sense-mastery","name":"Sense Mastery","bonus":32,"ranks":2,"skillId":"sk-lista-1-sense-mastery-50","spellCount":2,"knownCount":2},
    {"id":"sl-speed","name":"Speed","bonus":37,"ranks":3,"skillId":"sk-lista-2-speed-50","spellCount":3,"knownCount":3},
    {"id":"sl-movement","name":"Movement","bonus":52,"ranks":6,"skillId":"sk-lista-3-movement-50","spellCount":6,"knownCount":6},
    {"id":"sl-cloaking","name":"Cloaking","bonus":52,"ranks":6,"skillId":"sk-lista-4-cloaking-50","spellCount":7,"knownCount":6},
    {"id":"sl-attack-avoidance","name":"Attack Avoidance","bonus":37,"ranks":3,"skillId":"sk-lista-5-attack-avoidance-50","spellCount":5,"knownCount":3},
    {"id":"sl-sound-control","name":"Sound Control","bonus":52,"ranks":6,"skillId":"sk-lista-6-sound-control-50","spellCount":7,"knownCount":5},
    {"id":"sl-controlling-songs","name":"Controlling Songs","bonus":52,"ranks":6,"skillId":"sk-lista-7-controlling-songs-50","spellCount":7,"knownCount":5},
    {"id":"sl-sound-projection","name":"Sound Projection","bonus":52,"ranks":6,"skillId":"sk-lista-8-sound-projection-50","spellCount":8,"knownCount":6},
    {"id":"sl-light-molding","name":"Light Molding","bonus":52,"ranks":6,"skillId":"sk-lista-9-light-molding-50","spellCount":6,"knownCount":6},
    {"id":"sl-lores","name":"Lores","bonus":32,"ranks":2,"skillId":"sk-lista-10-lores-50","spellCount":4,"knownCount":2}
  ],

  /* Loitsut listoittain. known = false tarkoittaa, ettei listan taso vielä riitä. */
  spells: [
    {"id":"sp-sound-control-1","name":"Quiet I","list":"Sound Control","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-controlling-songs-1","name":"Calm Song","list":"Controlling Songs","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-projection-1","name":"Long Whisper I","list":"Sound Projection","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-light-molding-1","name":"Light Mirage","list":"Light Molding","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-movement-1","name":"Leaping","list":"Movement","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sense-mastery-1","name":"Sly ears","list":"Sense Mastery","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-speed-1","name":"Run","list":"Speed","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-control-2","name":"Sonic Law I","list":"Sound Control","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-controlling-songs-2","name":"Holding Song","list":"Controlling Songs","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-projection-2","name":"Sounding II","list":"Sound Projection","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-light-molding-2","name":"Projected Light","list":"Light Molding","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-movement-2","name":"Landing","list":"Movement","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sense-mastery-2","name":"Nightvision","list":"Sense Mastery","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-speed-2","name":"Speed reading","list":"Speed","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-controlling-songs-3","name":"Stun Song","list":"Controlling Songs","level":3,"pp":3,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-projection-3","name":"Song Sounding II","list":"Sound Projection","level":3,"pp":3,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-light-molding-3","name":"Light Control I","list":"Light Molding","level":3,"pp":3,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-movement-3","name":"Levitation I","list":"Movement","level":3,"pp":3,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-speed-3","name":"Speed I","list":"Speed","level":3,"pp":3,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-control-4","name":"Silence I","list":"Sound Control","level":4,"pp":4,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-projection-4","name":"Song II","list":"Sound Projection","level":4,"pp":4,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-light-molding-4","name":"Sudden Light","list":"Light Molding","level":4,"pp":4,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-movement-4","name":"Wind drift","list":"Movement","level":4,"pp":4,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-control-5","name":"Sonic Law II","list":"Sound Control","level":5,"pp":5,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-controlling-songs-5","name":"Sleep Song","list":"Controlling Songs","level":5,"pp":5,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-projection-5","name":"Long Whisper III","list":"Sound Projection","level":5,"pp":5,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-light-molding-5","name":"Shock Bolt I","list":"Light Molding","level":5,"pp":5,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-movement-5","name":"Underwater movement","list":"Movement","level":5,"pp":5,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-control-6","name":"Sudden Sound","list":"Sound Control","level":6,"pp":6,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-controlling-songs-6","name":"Charm Song","list":"Controlling Songs","level":6,"pp":6,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-projection-6","name":"Sounding V","list":"Sound Projection","level":6,"pp":6,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-light-molding-6","name":"Light Glamour","list":"Light Molding","level":6,"pp":6,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-movement-6","name":"Fly I","list":"Movement","level":6,"pp":6,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-control-7","name":"Deafen","list":"Sound Control","level":7,"pp":7,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-controlling-songs-7","name":"Fear's Song","list":"Controlling Songs","level":7,"pp":7,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-projection-7","name":"Great Song I","list":"Sound Projection","level":7,"pp":7,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-control-8","name":"Cracks","list":"Sound Control","level":8,"pp":8,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-controlling-songs-8","name":"Calm Song True","list":"Controlling Songs","level":8,"pp":8,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-sound-projection-8","name":"Song Sounding III","list":"Sound Projection","level":8,"pp":8,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-lores-1","name":"Recall","list":"Lores","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-attack-avoidance-1","name":"Turn missile","list":"Attack Avoidance","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-cloaking-1","name":"Blur","list":"Cloaking","level":1,"pp":1,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-lores-2","name":"Learn Language II","list":"Lores","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-attack-avoidance-2","name":"Turn blade","list":"Attack Avoidance","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-cloaking-2","name":"Shadow","list":"Cloaking","level":2,"pp":2,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-lores-3","name":"Language Lore","list":"Lores","level":3,"pp":3,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-attack-avoidance-3","name":"Shield I","list":"Attack Avoidance","level":3,"pp":3,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-cloaking-3","name":"Unseen","list":"Cloaking","level":3,"pp":3,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-lores-4","name":"Mind's Lore I","list":"Lores","level":4,"pp":4,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-cloaking-4","name":"Cloaking I","list":"Cloaking","level":4,"pp":4,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-attack-avoidance-5","name":"Deflect I","list":"Attack Avoidance","level":5,"pp":5,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-cloaking-5","name":"Facades I","list":"Cloaking","level":5,"pp":5,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-attack-avoidance-6","name":"Bladeturn I","list":"Attack Avoidance","level":6,"pp":6,"known":false,"range":"","duration":"","area":"","note":""},
    {"id":"sp-cloaking-6","name":"Cloaking III","list":"Cloaking","level":6,"pp":6,"known":true,"range":"","duration":"","area":"","note":""},
    {"id":"sp-cloaking-7","name":"Cloaking Sphere I","list":"Cloaking","level":7,"pp":7,"known":false,"range":"","duration":"","area":"","note":""}
  ],

  /* Taidot kategorioittain. */
  skills: [
    {"id":"sk-ajan-taju","name":"Ajan taju","display":"Ajan taju","category":"Havannointi","ranks":2,"total":29,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-havannointi","name":"Havannointi","display":"Havannointi","category":"Havannointi","ranks":12,"total":84,"breakdown":[{"label":"Tasot","value":54},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":6}]},
    {"id":"sk-jälkien-lukeminen","name":"Jälkien lukeminen","display":"Jälkien lukeminen","category":"Havannointi","ranks":0,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-suuntavaisto","name":"Suuntavaisto","display":"Suuntavaisto","category":"Havannointi","ranks":1,"total":28,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-liikkeet-hyppy","name":"Liikkeet - hyppy","display":"Liikkeet - hyppy","category":"Keskittyminen","ranks":0,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-laskeutuminen","name":"Liikkeet - laskeutuminen","display":"Liikkeet - laskeutuminen","category":"Keskittyminen","ranks":0,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-nopea-aseen-veto","name":"Liikkeet - nopea aseen veto","display":"Liikkeet - nopea aseen veto","category":"Keskittyminen","ranks":0,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-nopeus","name":"Liikkeet - nopeus","display":"Liikkeet - nopeus","category":"Keskittyminen","ranks":6,"total":49,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-tasapaino","name":"Liikkeet - tasapaino","display":"Liikkeet - tasapaino","category":"Keskittyminen","ranks":0,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-voima","name":"Liikkeet - voima","display":"Liikkeet - voima","category":"Keskittyminen","ranks":1,"total":24,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-meditoiva-nukkuminen","name":"Meditoiva nukkuminen","display":"Meditoiva nukkuminen","category":"Keskittyminen","ranks":0,"total":-11,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":14}]},
    {"id":"sk-raivonta","name":"Raivonta","display":"Raivonta","category":"Keskittyminen","ranks":0,"total":-22,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":3}]},
    {"id":"sk-huuliltaluku","name":"Huuliltaluku","display":"Huuliltaluku","category":"Kielet","ranks":1,"total":42,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":23},{"label":"Taso","value":14}]},
    {"id":"sk-kauppa","name":"Kauppa","display":"Kauppa","category":"Kielet","ranks":0,"total":2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":13},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-1-suullinen-midland","name":"Kieli 1 - suullinen Midland","display":"Midland — puhe","category":"Kielet","ranks":8,"total":66,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-1-kirjallinen-midland","name":"Kieli 1 - kirjallinen Midland","display":"Midland — kirjoitus","category":"Kielet","ranks":8,"total":66,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-2-suullinen-dhara","name":"Kieli 2 - suullinen D'Hara","display":"D'Hara — puhe","category":"Kielet","ranks":7,"total":61,"breakdown":[{"label":"Tasot","value":35},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-2-kirjallinen-dhara","name":"Kieli 2 - kirjallinen D'Hara","display":"D'Hara — kirjoitus","category":"Kielet","ranks":6,"total":56,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-3-suullinen-uusi-maailma","name":"Kieli 3 - suullinen Uusi maailma","display":"Uusi maailma — puhe","category":"Kielet","ranks":4,"total":46,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-3-kirjallinen-uusi-maailma","name":"Kieli 3 - kirjallinen Uusi maailma","display":"Uusi maailma — kirjoitus","category":"Kielet","ranks":0,"total":1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-4-suullinen-kieli-4","name":"Kieli 4 - suullinen Kieli 4","display":"Kieli 4 — puhe","category":"Kielet","ranks":0,"total":1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-4-kirjallinen-kieli-4","name":"Kieli 4 - kirjallinen Kieli 4","display":"Kieli 4 — kirjoitus","category":"Kielet","ranks":0,"total":1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-laulaminen","name":"Laulaminen","display":"Laulaminen","category":"Kielet","ranks":12,"total":89,"breakdown":[{"label":"Tasot","value":54},{"label":"Ominaisuudet","value":21},{"label":"Taso","value":14}]},
    {"id":"sk-matkiminen","name":"Matkiminen","display":"Matkiminen","category":"Kielet","ranks":6,"total":58,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":14},{"label":"Taso","value":14}]},
    {"id":"sk-merkinanto","name":"Merkinanto","display":"Merkinanto","category":"Kielet","ranks":2,"total":31,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":7},{"label":"Taso","value":14}]},
    {"id":"sk-musiikki","name":"Musiikki","display":"Musiikki","category":"Kielet","ranks":6,"total":58,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":14},{"label":"Taso","value":14}]},
    {"id":"sk-puhetaito","name":"Puhetaito","display":"Puhetaito","category":"Kielet","ranks":10,"total":85,"breakdown":[{"label":"Tasot","value":50},{"label":"Ominaisuudet","value":21},{"label":"Taso","value":14}]},
    {"id":"sk-tarinointi","name":"Tarinointi","display":"Tarinointi","category":"Kielet","ranks":12,"total":92,"breakdown":[{"label":"Tasot","value":54},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":14}]},
    {"id":"sk-alamaailmatieto","name":"Alamaailmatieto","display":"Alamaailmatieto","category":"Magia","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-esineet-riimut","name":"Esineet (+riimut)","display":"Esineet (+riimut)","category":"Magia","ranks":3,"total":36,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":16},{"label":"Muu","value":5}]},
    {"id":"sk-lista-1-sense-mastery-50","name":"Lista 1 - Sense Mastery (50)","display":"Sense Mastery","category":"Magia","ranks":2,"total":32,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-2-speed-50","name":"Lista 2 - Speed (50)","display":"Speed","category":"Magia","ranks":3,"total":37,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-3-movement-50","name":"Lista 3 - Movement (50)","display":"Movement","category":"Magia","ranks":6,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-4-cloaking-50","name":"Lista 4 - Cloaking (50)","display":"Cloaking","category":"Magia","ranks":6,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-5-attack-avoidance-50","name":"Lista 5 - Attack Avoidance (50)","display":"Attack Avoidance","category":"Magia","ranks":3,"total":37,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-6-sound-control-50","name":"Lista 6 - Sound Control (50)","display":"Sound Control","category":"Magia","ranks":6,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-7-controlling-songs-50","name":"Lista 7 - Controlling Songs (50)","display":"Controlling Songs","category":"Magia","ranks":6,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-8-sound-projection-50","name":"Lista 8 - Sound Projection (50)","display":"Sound Projection","category":"Magia","ranks":6,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-9-light-molding-50","name":"Lista 9 - Light Molding (50)","display":"Light Molding","category":"Magia","ranks":6,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-10-lores-50","name":"Lista 10 - Lores (50)","display":"Lores","category":"Magia","ranks":2,"total":32,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-11","name":"Lista 11 -","display":"Lista 11 -","category":"Magia","ranks":0,"total":-3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-12","name":"Lista 12 -","display":"Lista 12 -","category":"Magia","ranks":0,"total":-3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-maagiset-eläimet-tieto","name":"Maagiset eläimet -tieto","display":"Maagiset eläimet -tieto","category":"Magia","ranks":0,"total":-5,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":20}]},
    {"id":"sk-suunnatut-taiat","name":"Suunnatut taiat","display":"Suunnatut taiat","category":"Magia","ranks":4,"total":43,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-diplomatia","name":"Diplomatia","display":"Diplomatia","category":"Sosiaaliset","ranks":8,"total":85,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":21}]},
    {"id":"sk-johtaminen","name":"Johtaminen","display":"Johtaminen","category":"Sosiaaliset","ranks":8,"total":89,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":28},{"label":"Taso","value":21}]},
    {"id":"sk-kuulustelu","name":"Kuulustelu","display":"Kuulustelu","category":"Sosiaaliset","ranks":8,"total":83,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":22},{"label":"Taso","value":21}]},
    {"id":"sk-lahjonta","name":"Lahjonta","display":"Lahjonta","category":"Sosiaaliset","ranks":5,"total":74,"breakdown":[{"label":"Tasot","value":25},{"label":"Ominaisuudet","value":28},{"label":"Taso","value":21}]},
    {"id":"sk-pikapuhe","name":"Pikapuhe","display":"Pikapuhe","category":"Sosiaaliset","ranks":8,"total":97,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":36},{"label":"Taso","value":21}]},
    {"id":"sk-viettely","name":"Viettely","display":"Viettely","category":"Sosiaaliset","ranks":7,"total":77,"breakdown":[{"label":"Tasot","value":35},{"label":"Ominaisuudet","value":21},{"label":"Taso","value":21}]},
    {"id":"sk-aseeton-taistelu-lyönti","name":"Aseeton taistelu - lyönti","display":"Aseeton taistelu - lyönti","category":"Taistelu","ranks":8,"total":48,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":8}]},
    {"id":"sk-aseeton-taistelu-heitto","name":"Aseeton taistelu - heitto","display":"Aseeton taistelu - heitto","category":"Taistelu","ranks":8,"total":63,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-ase-1-quarterstaff","name":"Ase 1 - Quarterstaff","display":"Quarterstaff","category":"Taistelu","ranks":13,"total":89,"breakdown":[{"label":"Tasot","value":56},{"label":"Ominaisuudet","value":18},{"label":"Esine","value":15}]},
    {"id":"sk-haarniska","name":"Haarniska","display":"Haarniska","category":"Taistelu","ranks":0,"total":-18,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-piiritysaseet","name":"Piiritysaseet","display":"Piiritysaseet","category":"Taistelu","ranks":0,"total":0,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":25}]},
    {"id":"sk-sodanjohto","name":"Sodanjohto","display":"Sodanjohto","category":"Taistelu","ranks":0,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-tyrmäyssieto","name":"Tyrmäyssieto","display":"Tyrmäyssieto","category":"Taistelu","ranks":2,"total":11,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":1}]},
    {"id":"sk-tähtäys","name":"Tähtäys","display":"Tähtäys","category":"Taistelu","ranks":0,"total":-3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-väijytys","name":"Väijytys","display":"Väijytys","category":"Taistelu","ranks":0,"total":-1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":24}]},
    {"id":"sk-ensiapu","name":"Ensiapu","display":"Ensiapu","category":"Taiteet","ranks":2,"total":27,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":3},{"label":"Taso","value":14}]},
    {"id":"sk-kokkaus","name":"Kokkaus","display":"Kokkaus","category":"Taiteet","ranks":1,"total":41,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":22},{"label":"Taso","value":14}]},
    {"id":"sk-käsityö","name":"Käsityö","display":"Käsityö","category":"Taiteet","ranks":6,"total":56,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-näyttely","name":"Näyttely","display":"Näyttely","category":"Taiteet","ranks":7,"total":70,"breakdown":[{"label":"Tasot","value":35},{"label":"Ominaisuudet","value":21},{"label":"Taso","value":14}]},
    {"id":"sk-seppä","name":"Seppä","display":"Seppä","category":"Taiteet","ranks":0,"total":5,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16},{"label":"Taso","value":14}]},
    {"id":"sk-toisapu","name":"Toisapu","display":"Toisapu","category":"Taiteet","ranks":0,"total":11,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":22},{"label":"Taso","value":14}]},
    {"id":"sk-arkkitehtuuri","name":"Arkkitehtuuri","display":"Arkkitehtuuri","category":"Tieteet","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-eläintieto","name":"Eläintieto","display":"Eläintieto","category":"Tieteet","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-hallinto","name":"Hallinto","display":"Hallinto","category":"Tieteet","ranks":1,"total":33,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":28}]},
    {"id":"sk-historia-westland","name":"Historia Westland","display":"Historia Westland","category":"Tieteet","ranks":0,"total":-18,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-historia-midland","name":"Historia Midland","display":"Historia Midland","category":"Tieteet","ranks":5,"total":32,"breakdown":[{"label":"Tasot","value":25},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-historia-dhara","name":"Historia D'Hara","display":"Historia D'Hara","category":"Tieteet","ranks":3,"total":22,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-historia-uusi-maailma","name":"Historia Uusi maailma","display":"Historia Uusi maailma","category":"Tieteet","ranks":0,"total":-18,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-kartoitus","name":"Kartoitus","display":"Kartoitus","category":"Tieteet","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-kasvitieto","name":"Kasvitieto","display":"Kasvitieto","category":"Tieteet","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-kauppatieto","name":"Kauppatieto","display":"Kauppatieto","category":"Tieteet","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-kivitieto","name":"Kivitieto","display":"Kivitieto","category":"Tieteet","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-lakitieto","name":"Lakitieto","display":"Lakitieto","category":"Tieteet","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-matematiikka","name":"Matematiikka","display":"Matematiikka","category":"Tieteet","ranks":2,"total":26,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-metallitieto","name":"Metallitieto","display":"Metallitieto","category":"Tieteet","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-navigointi","name":"Navigointi","display":"Navigointi","category":"Tieteet","ranks":0,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-piiritys","name":"Piiritys","display":"Piiritys","category":"Tieteet","ranks":0,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-sodankäynti","name":"Sodankäynti","display":"Sodankäynti","category":"Tieteet","ranks":0,"total":3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":28}]},
    {"id":"sk-sääennustus","name":"Sääennustus","display":"Sääennustus","category":"Tieteet","ranks":0,"total":6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":31}]},
    {"id":"sk-eläinten-käsittely-koulutus","name":"Eläinten käsittely/koulutus","display":"Eläinten käsittely/koulutus","category":"Ulkoilu","ranks":0,"total":-4,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":21}]},
    {"id":"sk-erätaidot","name":"Erätaidot","display":"Erätaidot","category":"Ulkoilu","ranks":0,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12}]},
    {"id":"sk-jäljitys","name":"Jäljitys","display":"Jäljitys","category":"Ulkoilu","ranks":0,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-kaivaminen","name":"Kaivaminen","display":"Kaivaminen","category":"Ulkoilu","ranks":0,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-keräily","name":"Keräily","display":"Keräily","category":"Ulkoilu","ranks":0,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-nyljentä","name":"Nyljentä","display":"Nyljentä","category":"Ulkoilu","ranks":0,"total":0,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":25}]},
    {"id":"sk-ratsastus","name":"Ratsastus","display":"Ratsastus","category":"Ulkoilu","ranks":5,"total":39,"breakdown":[{"label":"Tasot","value":25},{"label":"Ominaisuudet","value":14}]},
    {"id":"sk-suunnistus","name":"Suunnistus","display":"Suunnistus","category":"Ulkoilu","ranks":0,"total":-14,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":11}]},
    {"id":"sk-tähtitiede","name":"Tähtitiede","display":"Tähtitiede","category":"Ulkoilu","ranks":0,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12}]},
    {"id":"sk-akrobatia","name":"Akrobatia","display":"Akrobatia","category":"Urheilu","ranks":3,"total":46,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":7}]},
    {"id":"sk-heittely","name":"Heittely","display":"Heittely","category":"Urheilu","ranks":6,"total":60,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":23},{"label":"Taso","value":7}]},
    {"id":"sk-hiihto","name":"Hiihto","display":"Hiihto","category":"Urheilu","ranks":0,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":5},{"label":"Taso","value":7}]},
    {"id":"sk-kestävyysjuoksu","name":"Kestävyysjuoksu","display":"Kestävyysjuoksu","category":"Urheilu","ranks":0,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":5},{"label":"Taso","value":7}]},
    {"id":"sk-kiipeily","name":"Kiipeily","display":"Kiipeily","category":"Urheilu","ranks":4,"total":50,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":23},{"label":"Taso","value":7}]},
    {"id":"sk-köydelläkävely","name":"Köydelläkävely","display":"Köydelläkävely","category":"Urheilu","ranks":0,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":7}]},
    {"id":"sk-pikajuoksu","name":"Pikajuoksu","display":"Pikajuoksu","category":"Urheilu","ranks":5,"total":61,"breakdown":[{"label":"Tasot","value":25},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":7},{"label":"Muu","value":5}]},
    {"id":"sk-purjehdus","name":"Purjehdus","display":"Purjehdus","category":"Urheilu","ranks":0,"total":7,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":25},{"label":"Taso","value":7}]},
    {"id":"sk-soutu","name":"Soutu","display":"Soutu","category":"Urheilu","ranks":0,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":5},{"label":"Taso","value":7}]},
    {"id":"sk-tanssi","name":"Tanssi","display":"Tanssi","category":"Urheilu","ranks":6,"total":67,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":25},{"label":"Taso","value":7},{"label":"Muu","value":5}]},
    {"id":"sk-uinti","name":"Uinti","display":"Uinti","category":"Urheilu","ranks":3,"total":27,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":5},{"label":"Taso","value":7}]},
    {"id":"sk-ansan-poisto","name":"Ansan poisto","display":"Ansan poisto","category":"Vehkeily","ranks":0,"total":0,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":25}]},
    {"id":"sk-ansojen-teko","name":"Ansojen teko","display":"Ansojen teko","category":"Vehkeily","ranks":0,"total":3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":28}]},
    {"id":"sk-hiivi","name":"Hiivi","display":"Hiivi","category":"Vehkeily","ranks":4,"total":32,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":12}],"note":"Lomakkeella: Hiivi/piileskele 32/21"},
    {"id":"sk-piileskele","name":"Piileskele","display":"Piileskele","category":"Vehkeily","ranks":4,"total":21,"breakdown":[],"note":"Lomakkeella: Hiivi/piileskele 32/21"},
    {"id":"sk-köydenkäsittely","name":"Köydenkäsittely","display":"Köydenkäsittely","category":"Vehkeily","ranks":3,"total":33,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":18}]},
    {"id":"sk-naamiointi","name":"Naamiointi","display":"Naamiointi","category":"Vehkeily","ranks":4,"total":36,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-piilottaminen","name":"Piilottaminen","display":"Piilottaminen","category":"Vehkeily","ranks":0,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-taskuvarkaus","name":"Taskuvarkaus","display":"Taskuvarkaus","category":"Vehkeily","ranks":0,"total":-1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":24}]},
    {"id":"sk-tiirikointi","name":"Tiirikointi","display":"Tiirikointi","category":"Vehkeily","ranks":1,"total":27,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-väärentäminen","name":"Väärentäminen","display":"Väärentäminen","category":"Vehkeily","ranks":0,"total":-14,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":11}]}
  ],

  /* Lomakkeessa ei ole näitä — ne ovat appissa kertyvää dataa. */
  resists: [],
  inventory: [],
  money: {}
};
