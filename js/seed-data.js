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
              "value": "Killattoman ominaisuusbonus tasolla 2: +1 olemus. \nKameleonttisuden lihan syömisestä +5 bonus esineet -taitoon.\nViihdyttäjäkillan ominaisuusbonus tasolla 1: +1 ketteryys.\nViihdyttäjäkillan tasoetu tasolla 1: +5 pikajuoksu -taitoon\nViihdyttäjäkillan ominaisuustaso tasolla 2: +1 olemus.\nViihdyttäjäkillan tasoetu tasolla 2: +1*taso havainnointi -taitoon.\nTaikurikillan ominaisuusbonus tasolla 1: +1 olemus.\nTaikurikillan tasoetu tasolla 1: +5 ensiapu -taitoon.\nJoikaus (erityinen laulaminen): +5"
          }
      ]
  },

  vitals: {"hitsMax":49,"ppMax":25},

  /* Ominaisuudet. bonus = lomakkeen "Total" (Normal + Extra). */
  stats: [
    {"code":"T","name":"Terveys","english":"Constitution","temp":50,"pot":50,"devPoints":9.6,"bonusNormal":0,"bonusExtra":5,"bonus":5,"bonusGiven":true},
    {"code":"K","name":"Ketteryys","english":"Agility","temp":96,"pot":96,"devPoints":14,"bonusNormal":22,"bonusExtra":1,"bonus":23,"bonusGiven":true},
    {"code":"I","name":"Itsekuri","english":"Self-Discipline","temp":59,"pot":59,"devPoints":9.9,"bonusNormal":1,"bonusExtra":0,"bonus":1,"bonusGiven":true},
    {"code":"M","name":"Muisti","english":"Memory","temp":90,"pot":90,"devPoints":12.8,"bonusNormal":12,"bonusExtra":0,"bonus":12,"bonusGiven":true},
    {"code":"P","name":"Päättely","english":"Reasoning","temp":95,"pot":95,"devPoints":13.8,"bonusNormal":20,"bonusExtra":0,"bonus":20,"bonusGiven":true},
    {"code":"Vo","name":"Voima","english":"Strength","temp":67,"pot":68,"devPoints":0,"bonusNormal":3,"bonusExtra":5,"bonus":8,"bonusGiven":true},
    {"code":"N","name":"Nopeus","english":"Quickness","temp":97,"pot":97,"devPoints":0,"bonusNormal":24,"bonusExtra":0,"bonus":24,"bonusGiven":true},
    {"code":"O","name":"Olemus","english":"Presence","temp":101,"pot":101,"devPoints":0,"bonusNormal":35,"bonusExtra":1,"bonus":36,"bonusGiven":true},
    {"code":"Va","name":"Vaisto","english":"Intuition","temp":98,"pot":98,"devPoints":0,"bonusNormal":26,"bonusExtra":0,"bonus":26,"bonusGiven":true},
    {"code":"E","name":"Empatia","english":"Empathy","temp":73,"pot":73,"devPoints":0,"bonusNormal":5,"bonusExtra":0,"bonus":5,"bonusGiven":true},
    {"code":"AP","name":"Ulkonäkö","english":"Appearance","temp":70,"pot":0,"devPoints":0,"bonusNormal":0,"bonusExtra":0,"bonus":0,"bonusGiven":false}
  ],

  /* Kiltojen tasoedut Muuta-kentästä jäsennettynä. */
  guildRules: [
    {"guildStem":"Viihdyttäjä","level":1,"kind":"stat","target":"ketteryys","stat":"K","amount":1,"perLevel":false,"source":"Viihdyttäjäkillan ominaisuusbonus tasolla 1: +1 ketteryys."},
    {"guildStem":"Viihdyttäjä","level":1,"kind":"skill","target":"pikajuoksu","stat":null,"amount":5,"perLevel":false,"source":"Viihdyttäjäkillan tasoetu tasolla 1: +5 pikajuoksu -taitoon"},
    {"guildStem":"Viihdyttäjä","level":2,"kind":"stat","target":"olemus","stat":"O","amount":1,"perLevel":false,"source":"Viihdyttäjäkillan ominaisuustaso tasolla 2: +1 olemus."},
    {"guildStem":"Viihdyttäjä","level":2,"kind":"skill","target":"havainnointi","stat":null,"amount":1,"perLevel":true,"source":"Viihdyttäjäkillan tasoetu tasolla 2: +1*taso havainnointi -taitoon."},
    {"guildStem":"Taikuri","level":1,"kind":"stat","target":"olemus","stat":"O","amount":1,"perLevel":false,"source":"Taikurikillan ominaisuusbonus tasolla 1: +1 olemus."},
    {"guildStem":"Taikuri","level":1,"kind":"skill","target":"ensiapu","stat":null,"amount":5,"perLevel":false,"source":"Taikurikillan tasoetu tasolla 1: +5 ensiapu -taitoon."}
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
    {"id":"w-quarterstaff","skillId":"sk-ase-1-quarterstaff","name":"Quarterstaff","ob":89,"table":"","note":"ase +15M","fumble":3,"special":"","kind":"melee","canParry":true,"blocks":[]},
    {"id":"w-aseeton-heitto","skillId":"sk-aseeton-taistelu-heitto","name":"Aseeton — heitto","ob":63,"table":"","note":"","fumble":null,"special":"","kind":"unarmed","canParry":true,"blocks":[]},
    {"id":"w-aseeton-lyönti","skillId":"sk-aseeton-taistelu-lyönti","name":"Aseeton — lyönti","ob":48,"table":"","note":"","fumble":null,"special":"","kind":"unarmed","canParry":true,"blocks":[]},
    {"id":"w-suunnatut-taiat","skillId":"sk-suunnatut-taiat","name":"Suunnatut taiat","ob":43,"table":"","note":"ei parrya","fumble":null,"special":"","kind":"directed","canParry":false,"blocks":[]}
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
    {"id":"sk-ajan-taju","name":"Ajan taju","display":"Ajan taju","category":"Havannointi","ranks":2,"classes":"Va/M","cost":"1/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":2,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":29,"total":29,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-havannointi","name":"Havannointi","display":"Havannointi","category":"Havannointi","ranks":12,"classes":"Va/Va/P","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":12,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":84,"total":84,"breakdown":[{"label":"Tasot","value":54},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":6}]},
    {"id":"sk-jälkien-lukeminen","name":"Jälkien lukeminen","display":"Jälkien lukeminen","category":"Havannointi","ranks":0,"classes":"Va/P","cost":"2/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-2,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-suuntavaisto","name":"Suuntavaisto","display":"Suuntavaisto","category":"Havannointi","ranks":1,"classes":"Va/P","cost":"1/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":1,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":28,"total":28,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-liikkeet-hyppy","name":"Liikkeet - hyppy","display":"Liikkeet - hyppy","category":"Keskittyminen","ranks":0,"classes":"O/I","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-6,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-laskeutuminen","name":"Liikkeet - laskeutuminen","display":"Liikkeet - laskeutuminen","category":"Keskittyminen","ranks":0,"classes":"O/I","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-6,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-nopea-aseen-veto","name":"Liikkeet - nopea aseen veto","display":"Liikkeet - nopea aseen veto","category":"Keskittyminen","ranks":0,"classes":"O/I","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-6,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-nopeus","name":"Liikkeet - nopeus","display":"Liikkeet - nopeus","category":"Keskittyminen","ranks":6,"classes":"O/I","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":49,"total":49,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-tasapaino","name":"Liikkeet - tasapaino","display":"Liikkeet - tasapaino","category":"Keskittyminen","ranks":0,"classes":"O/I","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-6,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-liikkeet-voima","name":"Liikkeet - voima","display":"Liikkeet - voima","category":"Keskittyminen","ranks":1,"classes":"O/I","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":1,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":24,"total":24,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-meditoiva-nukkuminen","name":"Meditoiva nukkuminen","display":"Meditoiva nukkuminen","category":"Keskittyminen","ranks":0,"classes":"I/Va","cost":"2/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-11,"total":-11,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":14}]},
    {"id":"sk-raivonta","name":"Raivonta","display":"Raivonta","category":"Keskittyminen","ranks":0,"classes":"E/I","cost":"3/7","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-22,"total":-22,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":3}]},
    {"id":"sk-huuliltaluku","name":"Huuliltaluku","display":"Huuliltaluku","category":"Kielet","ranks":1,"classes":"Va/P","cost":"1/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":1,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":42,"total":42,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":23},{"label":"Taso","value":14}]},
    {"id":"sk-kauppa","name":"Kauppa","display":"Kauppa","category":"Kielet","ranks":0,"classes":"P/E","cost":"2/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":2,"total":2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":13},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-1-suullinen-midland","name":"Kieli 1 - suullinen Midland","display":"Midland — puhe","category":"Kielet","ranks":8,"classes":"M","cost":"1/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":8,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":66,"total":66,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-1-kirjallinen-midland","name":"Kieli 1 - kirjallinen Midland","display":"Midland — kirjoitus","category":"Kielet","ranks":8,"classes":"M","cost":"1/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":8,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":66,"total":66,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-2-suullinen-dhara","name":"Kieli 2 - suullinen D'Hara","display":"D'Hara — puhe","category":"Kielet","ranks":7,"classes":"M","cost":"1/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":7,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":61,"total":61,"breakdown":[{"label":"Tasot","value":35},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-2-kirjallinen-dhara","name":"Kieli 2 - kirjallinen D'Hara","display":"D'Hara — kirjoitus","category":"Kielet","ranks":6,"classes":"M","cost":"1/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":1,"plannedDp":0,"planned":[{"rank":7,"dp":0,"paidEarlier":true}]},"sheetTotal":56,"total":56,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-3-suullinen-uusi-maailma","name":"Kieli 3 - suullinen Uusi maailma","display":"Uusi maailma — puhe","category":"Kielet","ranks":4,"classes":"M","cost":"1/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":4,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":46,"total":46,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-3-kirjallinen-uusi-maailma","name":"Kieli 3 - kirjallinen Uusi maailma","display":"Uusi maailma — kirjoitus","category":"Kielet","ranks":0,"classes":"M","cost":"1/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":1,"total":1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-4-suullinen-kieli-4","name":"Kieli 4 - suullinen Kieli 4","display":"Kieli 4 — puhe","category":"Kielet","ranks":0,"classes":"M","cost":"1/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":1,"total":1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-kieli-4-kirjallinen-kieli-4","name":"Kieli 4 - kirjallinen Kieli 4","display":"Kieli 4 — kirjoitus","category":"Kielet","ranks":0,"classes":"M","cost":"1/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":1,"total":1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-laulaminen","name":"Laulaminen","display":"Laulaminen","category":"Kielet","ranks":12,"classes":"O/E","cost":"1/2","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":12,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":89,"total":89,"breakdown":[{"label":"Tasot","value":54},{"label":"Ominaisuudet","value":21},{"label":"Taso","value":14}]},
    {"id":"sk-matkiminen","name":"Matkiminen","display":"Matkiminen","category":"Kielet","ranks":6,"classes":"Va/I","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":58,"total":58,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":14},{"label":"Taso","value":14}]},
    {"id":"sk-merkinanto","name":"Merkinanto","display":"Merkinanto","category":"Kielet","ranks":2,"classes":"M/I","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":2,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":31,"total":31,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":7},{"label":"Taso","value":14}]},
    {"id":"sk-musiikki","name":"Musiikki","display":"Musiikki","category":"Kielet","ranks":6,"classes":"K/E","cost":"1/2","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":58,"total":58,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":14},{"label":"Taso","value":14}]},
    {"id":"sk-puhetaito","name":"Puhetaito","display":"Puhetaito","category":"Kielet","ranks":10,"classes":"E/O","cost":"1/2","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":10,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":85,"total":85,"breakdown":[{"label":"Tasot","value":50},{"label":"Ominaisuudet","value":21},{"label":"Taso","value":14}]},
    {"id":"sk-tarinointi","name":"Tarinointi","display":"Tarinointi","category":"Kielet","ranks":12,"classes":"O/M","cost":"1/3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":12,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":92,"total":92,"breakdown":[{"label":"Tasot","value":54},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":14}]},
    {"id":"sk-alamaailmatieto","name":"Alamaailmatieto","display":"Alamaailmatieto","category":"Magia","ranks":0,"classes":"M/P","cost":"3/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-esineet-riimut","name":"Esineet (+riimut)","display":"Esineet (+riimut)","category":"Magia","ranks":3,"classes":"E/Va","cost":"3/5","itemBonus":0,"miscBonus":5,"grid":{"slots":25,"ranks":3,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":36,"total":36,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":16},{"label":"Muu","value":5}]},
    {"id":"sk-lista-1-sense-mastery-50","name":"Lista 1 - Sense Mastery (50)","display":"Sense Mastery","category":"Magia","ranks":2,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":2,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":32,"total":32,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-2-speed-50","name":"Lista 2 - Speed (50)","display":"Speed","category":"Magia","ranks":3,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":3,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":37,"total":37,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-3-movement-50","name":"Lista 3 - Movement (50)","display":"Movement","category":"Magia","ranks":6,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":52,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-4-cloaking-50","name":"Lista 4 - Cloaking (50)","display":"Cloaking","category":"Magia","ranks":6,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":52,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-5-attack-avoidance-50","name":"Lista 5 - Attack Avoidance (50)","display":"Attack Avoidance","category":"Magia","ranks":3,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":3,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":37,"total":37,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-6-sound-control-50","name":"Lista 6 - Sound Control (50)","display":"Sound Control","category":"Magia","ranks":6,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":52,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-7-controlling-songs-50","name":"Lista 7 - Controlling Songs (50)","display":"Controlling Songs","category":"Magia","ranks":6,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":52,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-8-sound-projection-50","name":"Lista 8 - Sound Projection (50)","display":"Sound Projection","category":"Magia","ranks":6,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":52,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-9-light-molding-50","name":"Lista 9 - Light Molding (50)","display":"Light Molding","category":"Magia","ranks":6,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":52,"total":52,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-10-lores-50","name":"Lista 10 - Lores (50)","display":"Lores","category":"Magia","ranks":2,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":2,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":32,"total":32,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-11","name":"Lista 11 -","display":"Lista 11 -","category":"Magia","ranks":0,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-3,"total":-3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-lista-12","name":"Lista 12 -","display":"Lista 12 -","category":"Magia","ranks":0,"classes":"O/Va/E","cost":"2/2/3/*","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-3,"total":-3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-maagiset-eläimet-tieto","name":"Maagiset eläimet -tieto","display":"Maagiset eläimet -tieto","category":"Magia","ranks":0,"classes":"O/Va/E/M","cost":"3/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-5,"total":-5,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":20}]},
    {"id":"sk-suunnatut-taiat","name":"Suunnatut taiat","display":"Suunnatut taiat","category":"Magia","ranks":4,"classes":"K","cost":"3/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":4,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":43,"total":43,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-diplomatia","name":"Diplomatia","display":"Diplomatia","category":"Sosiaaliset","ranks":8,"classes":"O/M","cost":"1/3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":8,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":85,"total":85,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":21}]},
    {"id":"sk-johtaminen","name":"Johtaminen","display":"Johtaminen","category":"Sosiaaliset","ranks":8,"classes":"O/P","cost":"1/3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":8,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":89,"total":89,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":28},{"label":"Taso","value":21}]},
    {"id":"sk-kuulustelu","name":"Kuulustelu","display":"Kuulustelu","category":"Sosiaaliset","ranks":8,"classes":"P/K","cost":"1/3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":8,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":83,"total":83,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":22},{"label":"Taso","value":21}]},
    {"id":"sk-lahjonta","name":"Lahjonta","display":"Lahjonta","category":"Sosiaaliset","ranks":5,"classes":"O/P","cost":"1/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":5,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":74,"total":74,"breakdown":[{"label":"Tasot","value":25},{"label":"Ominaisuudet","value":28},{"label":"Taso","value":21}]},
    {"id":"sk-pikapuhe","name":"Pikapuhe","display":"Pikapuhe","category":"Sosiaaliset","ranks":8,"classes":"O","cost":"1/3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":8,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":97,"total":97,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":36},{"label":"Taso","value":21}]},
    {"id":"sk-viettely","name":"Viettely","display":"Viettely","category":"Sosiaaliset","ranks":7,"classes":"E/O","cost":"1/3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":7,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":77,"total":77,"breakdown":[{"label":"Tasot","value":35},{"label":"Ominaisuudet","value":21},{"label":"Taso","value":21}]},
    {"id":"sk-aseeton-taistelu-lyönti","name":"Aseeton taistelu - lyönti","display":"Aseeton taistelu - lyönti","category":"Taistelu","ranks":8,"classes":"Vo","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":8,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":48,"total":48,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":8}]},
    {"id":"sk-aseeton-taistelu-heitto","name":"Aseeton taistelu - heitto","display":"Aseeton taistelu - heitto","category":"Taistelu","ranks":8,"classes":"Vo","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":8,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":63,"total":63,"breakdown":[{"label":"Tasot","value":40},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-ase-1-quarterstaff","name":"Ase 1 - Quarterstaff","display":"Quarterstaff","category":"Taistelu","ranks":13,"classes":"Vo/N/K","cost":"3/6","itemBonus":15,"miscBonus":0,"grid":{"slots":25,"ranks":13,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":89,"total":89,"breakdown":[{"label":"Tasot","value":56},{"label":"Ominaisuudet","value":18},{"label":"Esine","value":15}]},
    {"id":"sk-haarniska","name":"Haarniska","display":"Haarniska","category":"Taistelu","ranks":0,"classes":"Vo/T","cost":"8","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-18,"total":-18,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-piiritysaseet","name":"Piiritysaseet","display":"Piiritysaseet","category":"Taistelu","ranks":0,"classes":"Va/K","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":0,"total":0,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":25}]},
    {"id":"sk-sodanjohto","name":"Sodanjohto","display":"Sodanjohto","category":"Taistelu","ranks":0,"classes":"I/O","cost":"3/7","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-6,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-tyrmäyssieto","name":"Tyrmäyssieto","display":"Tyrmäyssieto","category":"Taistelu","ranks":2,"classes":"I","cost":"2/7","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":2,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":11,"total":11,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":1}]},
    {"id":"sk-tähtäys","name":"Tähtäys","display":"Tähtäys","category":"Taistelu","ranks":0,"classes":"K/P","cost":"5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-3,"total":-3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-väijytys","name":"Väijytys","display":"Väijytys","category":"Taistelu","ranks":0,"classes":"N/K","cost":"5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-1,"total":-1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":24}]},
    {"id":"sk-ensiapu","name":"Ensiapu","display":"Ensiapu","category":"Taiteet","ranks":2,"classes":"I/E","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":2,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":27,"total":27,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":3},{"label":"Taso","value":14}]},
    {"id":"sk-kokkaus","name":"Kokkaus","display":"Kokkaus","category":"Taiteet","ranks":1,"classes":"P/K","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":1,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":41,"total":41,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":22},{"label":"Taso","value":14}]},
    {"id":"sk-käsityö","name":"Käsityö","display":"Käsityö","category":"Taiteet","ranks":6,"classes":"K/I","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":56,"total":56,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":14}]},
    {"id":"sk-näyttely","name":"Näyttely","display":"Näyttely","category":"Taiteet","ranks":7,"classes":"O/E","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":7,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":70,"total":70,"breakdown":[{"label":"Tasot","value":35},{"label":"Ominaisuudet","value":21},{"label":"Taso","value":14}]},
    {"id":"sk-seppä","name":"Seppä","display":"Seppä","category":"Taiteet","ranks":0,"classes":"Vo/K","cost":"3/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":5,"total":5,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16},{"label":"Taso","value":14}]},
    {"id":"sk-toisapu","name":"Toisapu","display":"Toisapu","category":"Taiteet","ranks":0,"classes":"I/E/Va","cost":"3/7","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":11,"total":11,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":22},{"label":"Taso","value":14}]},
    {"id":"sk-arkkitehtuuri","name":"Arkkitehtuuri","display":"Arkkitehtuuri","category":"Tieteet","ranks":0,"classes":"M/P","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-eläintieto","name":"Eläintieto","display":"Eläintieto","category":"Tieteet","ranks":0,"classes":"M/P","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-hallinto","name":"Hallinto","display":"Hallinto","category":"Tieteet","ranks":1,"classes":"P/O","cost":"1/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":1,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":33,"total":33,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":28}]},
    {"id":"sk-historia-westland","name":"Historia Westland","display":"Historia Westland","category":"Tieteet","ranks":0,"classes":"M/I","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-18,"total":-18,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-historia-midland","name":"Historia Midland","display":"Historia Midland","category":"Tieteet","ranks":5,"classes":"M/I","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":5,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":32,"total":32,"breakdown":[{"label":"Tasot","value":25},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-historia-dhara","name":"Historia D'Hara","display":"Historia D'Hara","category":"Tieteet","ranks":3,"classes":"M/I","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":3,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":22,"total":22,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-historia-uusi-maailma","name":"Historia Uusi maailma","display":"Historia Uusi maailma","category":"Tieteet","ranks":0,"classes":"M/I","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-18,"total":-18,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":7}]},
    {"id":"sk-kartoitus","name":"Kartoitus","display":"Kartoitus","category":"Tieteet","ranks":0,"classes":"M/P","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-kasvitieto","name":"Kasvitieto","display":"Kasvitieto","category":"Tieteet","ranks":0,"classes":"M/P","cost":"2/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-kauppatieto","name":"Kauppatieto","display":"Kauppatieto","category":"Tieteet","ranks":0,"classes":"M/P","cost":"1/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-kivitieto","name":"Kivitieto","display":"Kivitieto","category":"Tieteet","ranks":0,"classes":"M/P","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-lakitieto","name":"Lakitieto","display":"Lakitieto","category":"Tieteet","ranks":0,"classes":"M/P","cost":"1/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-matematiikka","name":"Matematiikka","display":"Matematiikka","category":"Tieteet","ranks":2,"classes":"M/P","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":2,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":26,"total":26,"breakdown":[{"label":"Tasot","value":10},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-metallitieto","name":"Metallitieto","display":"Metallitieto","category":"Tieteet","ranks":0,"classes":"M/P","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-navigointi","name":"Navigointi","display":"Navigointi","category":"Tieteet","ranks":0,"classes":"P/Va","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-2,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-piiritys","name":"Piiritys","display":"Piiritys","category":"Tieteet","ranks":0,"classes":"P/Va","cost":"2/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-2,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-sodankäynti","name":"Sodankäynti","display":"Sodankäynti","category":"Tieteet","ranks":0,"classes":"O/P","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":3,"total":3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":28}]},
    {"id":"sk-sääennustus","name":"Sääennustus","display":"Sääennustus","category":"Tieteet","ranks":0,"classes":"Va/E","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":6,"total":6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":31}]},
    {"id":"sk-eläinten-käsittely-koulutus","name":"Eläinten käsittely/koulutus","display":"Eläinten käsittely/koulutus","category":"Ulkoilu","ranks":0,"classes":"E/O","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-4,"total":-4,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":21}]},
    {"id":"sk-erätaidot","name":"Erätaidot","display":"Erätaidot","category":"Ulkoilu","ranks":0,"classes":"K/I","cost":"3/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-13,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12}]},
    {"id":"sk-jäljitys","name":"Jäljitys","display":"Jäljitys","category":"Ulkoilu","ranks":0,"classes":"Va/P","cost":"3/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-2,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-kaivaminen","name":"Kaivaminen","display":"Kaivaminen","category":"Ulkoilu","ranks":0,"classes":"P/Va","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-2,"total":-2,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":23}]},
    {"id":"sk-keräily","name":"Keräily","display":"Keräily","category":"Ulkoilu","ranks":0,"classes":"Va/M","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-6,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":19}]},
    {"id":"sk-nyljentä","name":"Nyljentä","display":"Nyljentä","category":"Ulkoilu","ranks":0,"classes":"K/Va","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":0,"total":0,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":25}]},
    {"id":"sk-ratsastus","name":"Ratsastus","display":"Ratsastus","category":"Ulkoilu","ranks":5,"classes":"E/K","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":5,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":39,"total":39,"breakdown":[{"label":"Tasot","value":25},{"label":"Ominaisuudet","value":14}]},
    {"id":"sk-suunnistus","name":"Suunnistus","display":"Suunnistus","category":"Ulkoilu","ranks":0,"classes":"P/I","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-14,"total":-14,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":11}]},
    {"id":"sk-tähtitiede","name":"Tähtitiede","display":"Tähtitiede","category":"Ulkoilu","ranks":0,"classes":"M","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-13,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12}]},
    {"id":"sk-akrobatia","name":"Akrobatia","display":"Akrobatia","category":"Urheilu","ranks":3,"classes":"K/N","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":3,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":46,"total":46,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":7}]},
    {"id":"sk-heittely","name":"Heittely","display":"Heittely","category":"Urheilu","ranks":6,"classes":"K","cost":"1/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":60,"total":60,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":23},{"label":"Taso","value":7}]},
    {"id":"sk-hiihto","name":"Hiihto","display":"Hiihto","category":"Urheilu","ranks":0,"classes":"T","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-13,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":5},{"label":"Taso","value":7}]},
    {"id":"sk-kestävyysjuoksu","name":"Kestävyysjuoksu","display":"Kestävyysjuoksu","category":"Urheilu","ranks":0,"classes":"T","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-13,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":5},{"label":"Taso","value":7}]},
    {"id":"sk-kiipeily","name":"Kiipeily","display":"Kiipeily","category":"Urheilu","ranks":4,"classes":"K","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":4,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":50,"total":50,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":23},{"label":"Taso","value":7}]},
    {"id":"sk-köydelläkävely","name":"Köydelläkävely","display":"Köydelläkävely","category":"Urheilu","ranks":0,"classes":"K/I","cost":"4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-6,"total":-6,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":12},{"label":"Taso","value":7}]},
    {"id":"sk-pikajuoksu","name":"Pikajuoksu","display":"Pikajuoksu","category":"Urheilu","ranks":5,"classes":"K/N","cost":"1/4","itemBonus":0,"miscBonus":5,"grid":{"slots":25,"ranks":5,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":61,"total":61,"breakdown":[{"label":"Tasot","value":25},{"label":"Ominaisuudet","value":24},{"label":"Taso","value":7},{"label":"Muu","value":5}]},
    {"id":"sk-purjehdus","name":"Purjehdus","display":"Purjehdus","category":"Urheilu","ranks":0,"classes":"K/Va","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":7,"total":7,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":25},{"label":"Taso","value":7}]},
    {"id":"sk-soutu","name":"Soutu","display":"Soutu","category":"Urheilu","ranks":0,"classes":"Vo/I","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-13,"total":-13,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":5},{"label":"Taso","value":7}]},
    {"id":"sk-tanssi","name":"Tanssi","display":"Tanssi","category":"Urheilu","ranks":6,"classes":"K/Va","cost":"1/3","itemBonus":0,"miscBonus":5,"grid":{"slots":25,"ranks":6,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":67,"total":67,"breakdown":[{"label":"Tasot","value":30},{"label":"Ominaisuudet","value":25},{"label":"Taso","value":7},{"label":"Muu","value":5}]},
    {"id":"sk-uinti","name":"Uinti","display":"Uinti","category":"Urheilu","ranks":3,"classes":"T","cost":"2/6","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":3,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":27,"total":27,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":5},{"label":"Taso","value":7}]},
    {"id":"sk-ansan-poisto","name":"Ansan poisto","display":"Ansan poisto","category":"Vehkeily","ranks":0,"classes":"Va/K","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":0,"total":0,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":25}]},
    {"id":"sk-ansojen-teko","name":"Ansojen teko","display":"Ansojen teko","category":"Vehkeily","ranks":0,"classes":"P/O","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":3,"total":3,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":28}]},
    {"id":"sk-hiivi","name":"Hiivi","display":"Hiivi","category":"Vehkeily","ranks":4,"classes":"K/I","cost":"2/7","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":4,"pending":0,"plannedDp":0,"planned":[]},"compound":"Hiivi/piileskele","sheetTotal":32,"total":32,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":12}],"note":"Lomakkeella: Hiivi/piileskele 32/21"},
    {"id":"sk-piileskele","name":"Piileskele","display":"Piileskele","category":"Vehkeily","ranks":4,"classes":"K/I","cost":"2/7","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":4,"pending":0,"plannedDp":0,"planned":[]},"compound":"Hiivi/piileskele","sheetTotal":21,"total":21,"breakdown":[],"note":"Lomakkeella: Hiivi/piileskele 32/21"},
    {"id":"sk-köydenkäsittely","name":"Köydenkäsittely","display":"Köydenkäsittely","category":"Vehkeily","ranks":3,"classes":"M/K","cost":"2/5","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":3,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":33,"total":33,"breakdown":[{"label":"Tasot","value":15},{"label":"Ominaisuudet","value":18}]},
    {"id":"sk-naamiointi","name":"Naamiointi","display":"Naamiointi","category":"Vehkeily","ranks":4,"classes":"E/Va","cost":"2/7","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":4,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":36,"total":36,"breakdown":[{"label":"Tasot","value":20},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-piilottaminen","name":"Piilottaminen","display":"Piilottaminen","category":"Vehkeily","ranks":0,"classes":"E/Va","cost":"2/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-9,"total":-9,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":16}]},
    {"id":"sk-taskuvarkaus","name":"Taskuvarkaus","display":"Taskuvarkaus","category":"Vehkeily","ranks":0,"classes":"K/N","cost":"2/4","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-1,"total":-1,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":24}]},
    {"id":"sk-tiirikointi","name":"Tiirikointi","display":"Tiirikointi","category":"Vehkeily","ranks":1,"classes":"P/K","cost":"3/7","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":1,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":27,"total":27,"breakdown":[{"label":"Tasot","value":5},{"label":"Ominaisuudet","value":22}]},
    {"id":"sk-väärentäminen","name":"Väärentäminen","display":"Väärentäminen","category":"Vehkeily","ranks":0,"classes":"I/P","cost":"3","itemBonus":0,"miscBonus":0,"grid":{"slots":25,"ranks":0,"pending":0,"plannedDp":0,"planned":[]},"sheetTotal":-14,"total":-14,"breakdown":[{"label":"Tasot","value":-25},{"label":"Ominaisuudet","value":11}]}
  ],

  /* Loitsujen vaikutukset Sheetin Spell bonus -välilehdeltä. */
  spellBonuses: [
    {"id":"sb-shield-i-2","spell":"Shield I","list":"Attack Avoidance","type":"db","target":"melee+missile","value":25,"scope":"lasting","defaultOn":true,"note":"kahden käden aseella maksaa *2"},
    {"id":"sb-bladeturn-i-3","spell":"Bladeturn I","list":"Attack Avoidance","type":"db","target":"melee","value":100,"scope":"once","defaultOn":true,"note":""},
    {"id":"sb-deflect-i-4","spell":"Deflect I","list":"Attack Avoidance","type":"db","target":"missile","value":100,"scope":"once","defaultOn":true,"note":""},
    {"id":"sb-turn-missile-5","spell":"Turn missile","list":"Attack Avoidance","type":"db","target":"missile","value":20,"scope":"once","defaultOn":true,"note":""},
    {"id":"sb-turn-blade-6","spell":"Turn blade","list":"Attack Avoidance","type":"db","target":"melee","value":20,"scope":"lasting","defaultOn":true,"note":""},
    {"id":"sb-blur-7","spell":"Blur","list":"Cloaking","type":"db","target":"kaikki","value":10,"scope":"lasting","defaultOn":true,"note":""},
    {"id":"sb-shadow-8","spell":"Shadow","list":"Cloaking","type":"skill","target":"hiivi","value":25,"scope":"lasting","defaultOn":true,"note":""},
    {"id":"sb-shadow-9","spell":"Shadow","list":"Cloaking","type":"skill","target":"piileskele","value":75,"scope":"lasting","defaultOn":true,"note":""},
    {"id":"sb-quiet-i-10","spell":"Quiet I","list":"Sound Control","type":"skill","target":"hiivi","value":25,"scope":"lasting","defaultOn":true,"note":""},
    {"id":"sb-silence-i-11","spell":"Silence I","list":"Sound Control","type":"skill","target":"hiivi","value":25,"scope":"lasting","defaultOn":true,"note":""},
    {"id":"sb-sly-ears-12","spell":"Sly ears","list":"Sense Mastery","type":"skill","target":"havainnointi","value":50,"scope":"lasting","defaultOn":true,"note":"vain kuulo"},
    {"id":"sb-sly-ears-13","spell":"Sly ears","list":"Sense Mastery","type":"skill","target":"havainnointi","value":25,"scope":"lasting","defaultOn":false,"note":"kuulo yhdistettynä muihin aisteihin"},
    {"id":"sb-shock-bolt-14","spell":"Shock Bolt","list":"Light Molding","type":"attack","target":"","value":0,"scope":"once","defaultOn":true,"note":"suunnattu taika"}
  ],

  /* Bonustaulukot Sheetin Rules-välilehdeltä. */
  rules: {
    "statBonus": [
      {
        "from": 103,
        "to": 103,
        "value": 45
      },
      {
        "from": 102,
        "to": 102,
        "value": 40
      },
      {
        "from": 101,
        "to": 101,
        "value": 35
      },
      {
        "from": 100,
        "to": 100,
        "value": 30
      },
      {
        "from": 99,
        "to": 99,
        "value": 28
      },
      {
        "from": 98,
        "to": 98,
        "value": 26
      },
      {
        "from": 97,
        "to": 97,
        "value": 24
      },
      {
        "from": 96,
        "to": 96,
        "value": 22
      },
      {
        "from": 95,
        "to": 95,
        "value": 20
      },
      {
        "from": 94,
        "to": 94,
        "value": 19
      },
      {
        "from": 93,
        "to": 93,
        "value": 17
      },
      {
        "from": 92,
        "to": 92,
        "value": 15
      },
      {
        "from": 91,
        "to": 91,
        "value": 13
      },
      {
        "from": 90,
        "to": 90,
        "value": 12
      },
      {
        "from": 88,
        "to": 89,
        "value": 11
      },
      {
        "from": 86,
        "to": 87,
        "value": 10
      },
      {
        "from": 84,
        "to": 85,
        "value": 9
      },
      {
        "from": 82,
        "to": 83,
        "value": 8
      },
      {
        "from": 80,
        "to": 81,
        "value": 7
      },
      {
        "from": 76,
        "to": 79,
        "value": 6
      },
      {
        "from": 72,
        "to": 75,
        "value": 5
      },
      {
        "from": 68,
        "to": 71,
        "value": 4
      },
      {
        "from": 64,
        "to": 67,
        "value": 3
      },
      {
        "from": 60,
        "to": 63,
        "value": 2
      },
      {
        "from": 55,
        "to": 59,
        "value": 1
      },
      {
        "from": 46,
        "to": 54,
        "value": 0
      },
      {
        "from": 40,
        "to": 45,
        "value": -1
      },
      {
        "from": 36,
        "to": 39,
        "value": -2
      },
      {
        "from": 32,
        "to": 35,
        "value": -3
      },
      {
        "from": 28,
        "to": 31,
        "value": -4
      },
      {
        "from": 24,
        "to": 27,
        "value": -6
      },
      {
        "from": 20,
        "to": 23,
        "value": -8
      },
      {
        "from": 16,
        "to": 19,
        "value": -9
      },
      {
        "from": 12,
        "to": 15,
        "value": -10
      },
      {
        "from": 10,
        "to": 11,
        "value": -11
      },
      {
        "from": 9,
        "to": 9,
        "value": -13
      },
      {
        "from": 8,
        "to": 8,
        "value": -15
      },
      {
        "from": 7,
        "to": 7,
        "value": -17
      },
      {
        "from": 6,
        "to": 6,
        "value": -19
      },
      {
        "from": 5,
        "to": 5,
        "value": -21
      },
      {
        "from": 4,
        "to": 4,
        "value": -23
      },
      {
        "from": 3,
        "to": 3,
        "value": -25
      },
      {
        "from": 2,
        "to": 2,
        "value": -27
      },
      {
        "from": 1,
        "to": 1,
        "value": -30
      }
    ],
    "devPoints": [
      {
        "from": 103,
        "to": 103,
        "value": 15.8
      },
      {
        "from": 102,
        "to": 102,
        "value": 15.4
      },
      {
        "from": 101,
        "to": 101,
        "value": 15
      },
      {
        "from": 100,
        "to": 100,
        "value": 14.8
      },
      {
        "from": 99,
        "to": 99,
        "value": 14.6
      },
      {
        "from": 98,
        "to": 98,
        "value": 14.4
      },
      {
        "from": 97,
        "to": 97,
        "value": 14.2
      },
      {
        "from": 96,
        "to": 96,
        "value": 14
      },
      {
        "from": 95,
        "to": 95,
        "value": 13.8
      },
      {
        "from": 94,
        "to": 94,
        "value": 13.6
      },
      {
        "from": 93,
        "to": 93,
        "value": 13.4
      },
      {
        "from": 92,
        "to": 92,
        "value": 13.2
      },
      {
        "from": 91,
        "to": 91,
        "value": 13
      },
      {
        "from": 90,
        "to": 90,
        "value": 12.8
      },
      {
        "from": 88,
        "to": 89,
        "value": 12.6
      },
      {
        "from": 86,
        "to": 87,
        "value": 12.4
      },
      {
        "from": 84,
        "to": 85,
        "value": 12.2
      },
      {
        "from": 82,
        "to": 83,
        "value": 12
      },
      {
        "from": 80,
        "to": 81,
        "value": 11.7
      },
      {
        "from": 76,
        "to": 79,
        "value": 11.4
      },
      {
        "from": 72,
        "to": 75,
        "value": 11.1
      },
      {
        "from": 68,
        "to": 71,
        "value": 10.8
      },
      {
        "from": 64,
        "to": 67,
        "value": 10.5
      },
      {
        "from": 60,
        "to": 63,
        "value": 10.2
      },
      {
        "from": 55,
        "to": 59,
        "value": 9.9
      },
      {
        "from": 46,
        "to": 54,
        "value": 9.6
      },
      {
        "from": 40,
        "to": 45,
        "value": 9.3
      },
      {
        "from": 36,
        "to": 39,
        "value": 9
      },
      {
        "from": 32,
        "to": 35,
        "value": 8.5
      },
      {
        "from": 28,
        "to": 31,
        "value": 8
      },
      {
        "from": 24,
        "to": 27,
        "value": 7.5
      },
      {
        "from": 20,
        "to": 23,
        "value": 7
      },
      {
        "from": 16,
        "to": 19,
        "value": 6.5
      },
      {
        "from": 12,
        "to": 15,
        "value": 6
      },
      {
        "from": 10,
        "to": 11,
        "value": 5.5
      },
      {
        "from": 9,
        "to": 9,
        "value": 5
      },
      {
        "from": 8,
        "to": 8,
        "value": 4.5
      },
      {
        "from": 7,
        "to": 7,
        "value": 4
      },
      {
        "from": 6,
        "to": 6,
        "value": 3.5
      },
      {
        "from": 5,
        "to": 5,
        "value": 3
      },
      {
        "from": 4,
        "to": 4,
        "value": 2.5
      },
      {
        "from": 3,
        "to": 3,
        "value": 2
      },
      {
        "from": 2,
        "to": 2,
        "value": 1.5
      },
      {
        "from": 1,
        "to": 1,
        "value": 1
      }
    ],
    "powerPoints": [
      {
        "from": 103,
        "to": 103,
        "value": 4.6
      },
      {
        "from": 102,
        "to": 102,
        "value": 4.4
      },
      {
        "from": 101,
        "to": 101,
        "value": 4.2
      },
      {
        "from": 100,
        "to": 100,
        "value": 4.1
      },
      {
        "from": 99,
        "to": 99,
        "value": 4
      },
      {
        "from": 98,
        "to": 98,
        "value": 3.9
      },
      {
        "from": 97,
        "to": 97,
        "value": 3.8
      },
      {
        "from": 96,
        "to": 96,
        "value": 3.7
      },
      {
        "from": 95,
        "to": 95,
        "value": 3.6
      },
      {
        "from": 94,
        "to": 94,
        "value": 3.5
      },
      {
        "from": 93,
        "to": 93,
        "value": 3.4
      },
      {
        "from": 92,
        "to": 92,
        "value": 3.3
      },
      {
        "from": 91,
        "to": 91,
        "value": 3.2
      },
      {
        "from": 90,
        "to": 90,
        "value": 3.1
      },
      {
        "from": 88,
        "to": 89,
        "value": 3
      },
      {
        "from": 86,
        "to": 87,
        "value": 2.9
      },
      {
        "from": 84,
        "to": 85,
        "value": 2.8
      },
      {
        "from": 82,
        "to": 83,
        "value": 2.7
      },
      {
        "from": 80,
        "to": 81,
        "value": 2.6
      },
      {
        "from": 76,
        "to": 79,
        "value": 2.5
      },
      {
        "from": 72,
        "to": 75,
        "value": 2.4
      },
      {
        "from": 68,
        "to": 71,
        "value": 2.3
      },
      {
        "from": 64,
        "to": 67,
        "value": 2.2
      },
      {
        "from": 60,
        "to": 63,
        "value": 2.1
      },
      {
        "from": 55,
        "to": 59,
        "value": 2
      },
      {
        "from": 46,
        "to": 54,
        "value": 1.9
      },
      {
        "from": 40,
        "to": 45,
        "value": 1.8
      },
      {
        "from": 36,
        "to": 39,
        "value": 1.7
      },
      {
        "from": 32,
        "to": 35,
        "value": 1.6
      },
      {
        "from": 28,
        "to": 31,
        "value": 1.5
      },
      {
        "from": 24,
        "to": 27,
        "value": 1.4
      },
      {
        "from": 20,
        "to": 23,
        "value": 1.3
      },
      {
        "from": 16,
        "to": 19,
        "value": 1.2
      },
      {
        "from": 12,
        "to": 15,
        "value": 1.1
      },
      {
        "from": 10,
        "to": 11,
        "value": 1
      },
      {
        "from": 9,
        "to": 9,
        "value": 0.9
      },
      {
        "from": 8,
        "to": 8,
        "value": 0.8
      },
      {
        "from": 7,
        "to": 7,
        "value": 0.7
      },
      {
        "from": 6,
        "to": 6,
        "value": 0.6
      },
      {
        "from": 5,
        "to": 5,
        "value": 0.5
      },
      {
        "from": 4,
        "to": 4,
        "value": 0.4
      },
      {
        "from": 3,
        "to": 3,
        "value": 0.3
      },
      {
        "from": 2,
        "to": 2,
        "value": 0.2
      },
      {
        "from": 1,
        "to": 1,
        "value": 0.1
      }
    ],
    "levelBonus": {
      "Havannointi": 0,
      "Keskittyminen": 0,
      "Kielet": 2,
      "Magia": 0,
      "Sosiaaliset": 3,
      "Taistelu": 0,
      "Taiteet": 2,
      "Tieteet": 0,
      "Ulkoilu": 0,
      "Urheilu": 1,
      "Vehkeily": 0
    }
  },

  /* Lomakkeessa ei ole näitä — ne ovat appissa kertyvää dataa. */
  resists: [],
  inventory: [],
  money: {}
};
