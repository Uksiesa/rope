# Kertyvä data ja sen tallennus

Appin data jakautuu kolmeen kerrokseen. Jako on tarkoituksellinen: Sheetin
päivitys ei saa nollata kesken matkan kertynyttä dataa, eikä uuden pelisession
aloitus saa hukata kerättyjä kielitunteja tai rahoja.

| Kerros | Sisältö | Missä | Elinkaari |
|---|---|---|---|
| **Hahmodata** | ominaisuudet, taidot, aseet, DB-komponentit, loitsulistat, killat, kielten tasot | Google Sheets, välimuisti localStoragessa | Muuttuu vain Sheetissä (tasonnousut) |
| **Session data** | osuma- ja voimapisteet, taistelukierros, tilavaikutukset, DB-togglet, asevalinta | localStorage, `tm.session.v2` | Yksi peli-ilta. "Aloita uusi sessio" nollaa |
| **Kertyvä data** | matkapäivät, kalenteri, muona, rahat, kielten opiskelutunnit ja tuntitavoitteet, päiväkirja, varusteet ja kantopaikat | localStorage, `tm.durable.v2` | Säilyy sessioiden yli. **Tämä viedään Sheetiin** |

Session data on tarkoituksella katoavaa: osumapisteet palautuvat pelin sisäisen
levon myötä eikä niitä ole mielekästä kirjata ylös. Kertyvä data taas kuvaa
kampanjan tilaa, ja se pitää saada talteen.

## Vienti Sheetiin

Hahmo-välilehden "Data ja tallennus" -kortista:

- **Vie Sheetiin** — lähettää kertyvän datan Apps Script -endpointille (ks. alla).
  Jos endpointtia ei ole määritetty, nappi kopioi datan leikepöydälle.
- **Kopioi** — sarkainerotettu teksti leikepöydälle, liitettäväksi käsin Sheetiin.
- **Hae Sheetistä** — lukee aiemmin viedyn datan takaisin. Käytännöllinen jos
  vaihdat laitetta tai selaimen tiedot katoavat. Korvaa laitteen nykyiset arvot.

Ilman Apps Scriptiä sovellus toimii täysin normaalisti — vienti on vain käsityötä.

## Apps Script -endpoint

CSV-luku on vain luku, joten kirjoitus vaatii pienen skriptin taulukon sisään.

1. Avaa Sheet → **Laajennukset → Apps Script**.
2. Korvaa `Code.gs` alla olevalla koodilla ja vaihda `TOKEN`-arvo.
3. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Kopioi `/exec`-osoite kohtaan `CONFIG.data.sheets.writeUrl` ja sama token
   kohtaan `CONFIG.data.sheets.writeToken`.
5. Kun `Durable`-välilehti on syntynyt, ota sen gid osoiterivistä ja laita se
   kohtaan `CONFIG.data.sheets.gids.durable` — vasta silloin "Hae Sheetistä" toimii.

```javascript
const TOKEN = 'vaihda-tama';        // sama arvo kuin js/config.js:ssä
const DURABLE_SHEET = 'Durable';
const LOG_SHEET = 'Log';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.token !== TOKEN) return json({ ok: false, error: 'Väärä token' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1) Kertyvä data avain/arvo-muodossa + koko JSON yhteen soluun
    const sh = sheet(ss, DURABLE_SHEET);
    sh.clear();
    const rows = [
      ['key', 'value'],
      ['json', JSON.stringify(data)],
      ['updatedAt', data.updatedAt || ''],
      ['character', data.character || ''],
      ['day', data.day],
      ['date', data.date || ''],
      ['food', data.food]
    ];
    each(data.money, (k, v) => rows.push(['money:' + k, v]));
    each(data.langHours, (k, v) => rows.push(['lang:' + k, v]));
    each(data.langTargets, (k, v) => rows.push(['langTarget:' + k, v]));
    each(data.langRanks, (k, v) => rows.push(['langRank:' + k, v]));
    each(data.itemLocations, (k, v) => rows.push(['slot:' + k, v]));
    sh.getRange(1, 1, rows.length, 2).setValues(rows);

    // 2) Päiväkirja omalle välilehdelleen
    const lg = sheet(ss, LOG_SHEET);
    lg.clear();
    const log = [['day', 'date', 'meals', 'langHours', 'spentBase', 'notes']];
    (data.log || []).forEach(en => {
      let lang = 0, spent = 0;
      each(en.lang, (k, v) => { lang += v; });
      (en.spend || []).forEach(sp => { spent += sp.base; });
      const notes = (en.spend || []).map(sp => sp.label).filter(String).join('; ');
      log.push([en.day, en.date || '', en.meals === null ? '' : en.meals, lang, spent, notes]);
    });
    lg.getRange(1, 1, log.length, 6).setValues(log);

    return json({ ok: true, rows: rows.length, logRows: log.length - 1 });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function sheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function each(obj, fn) {
  Object.keys(obj || {}).forEach(k => fn(k, obj[k]));
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Huomioita

- `json`-solu sisältää koko kertyvän datan yhtenä merkkijonona, ja "Hae Sheetistä"
  lukee sen. Sheetsin solun raja on 50 000 merkkiä — riittää pitkäänkin kampanjaan,
  mutta jos päiväkirja paisuu, tyhjennä vanhat päivät.
- Avain/arvo-rivit ja `Log`-välilehti ovat ihmisluettavia; niitä voi tarkastella ja
  vertailla siihen mitä pelissä oikeasti tapahtui.
- Skripti kirjoittaa taulukkoon **sinun oikeuksillasi**, joten osoitetta ei kannata
  jakaa. Token suojaa vahingoilta, ei kohdennetulta hyökkäykseltä.
- Jos et halua kirjoitusoikeuksia lainkaan, jätä `writeUrl` tyhjäksi ja käytä
  "Kopioi"-nappia. Toiminnallisuus on muuten identtinen.

## Sheetin päivitys session jälkeen

Suositeltu rutiini peli-illan päätteeksi:

1. Hahmo-välilehti → **Vie Sheetiin** (tai Kopioi + liitä).
2. Tasonnousut ja uudet taidot/loitsut suoraan Sheetiin.
3. Kielten opiskelutunnit: kun taso nousee appissa, päivitä lomakkeen `Kielet`-
   lohkoon uusi taso ja seuraavan tason tuntitavoite.
4. Seuraavan session alussa ⟳ hakee hahmodatan ja **Aloita uusi sessio** nollaa
   osuma- ja voimapisteet.
