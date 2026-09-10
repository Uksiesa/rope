# Totuuden Miekka — RoleMaster-kampanjatyökalu

Mobiiliin tehty PWA pelisession apuvälineeksi. Ei käännösvaiheita, ei riippuvuuksia
— pelkkää HTML/CSS/JS, joka toimii sellaisenaan GitHub Pagesissa ja asennettuna
iPhonen kotinäytölle.

**Hahmo: Ballarion**, taso 7 Laulaja. Data luetaan suoraan olemassa olevasta
hahmolomakkeesta Google Sheetsissä; `js/seed-data.js` on sama data pakastettuna
offline-käyttöä varten. Lomakkeen luku on kuvattu tiedostossa
[docs/lomakkeen-luku.md](docs/lomakkeen-luku.md).

## Viisi näkymää

| Välilehti | Sisältö |
|---|---|
| **Taistelu** | Osumapisteet, taistelukierrokset ja tilavaikutukset (tainnutus laskee alas, verenvuoto vähentää hp:tä kierroksen lopussa), aseen OB jaettuna hyökkäykseen ja parryyn, DB:n komponentit togglattavina, heittolaskuri |
| **Matka** | Kampanjakalenteri, kuunkierto, matkapäivät, muona, rahat neljänä kolikkotyyppinä, kielten opiskelutunnit ja päivä päivältä täyttyvä päiväkirja |
| **Teot** | Taidon bonus + käsin syötetty heitto. Haku, kategoriasuodattimet ja puhehaku |
| **Taika** | Voimapisteet (toimivat kuten osumapisteet) ja loitsut **taikalistoittain** ryhmiteltynä, listan heittobonus otsikossa. Loitsiminen vähentää pisteet; listan tason ylittävät loitsut näkyvät lukittuina |
| **Hahmo** | Hahmon kuva, ominaisuudet, killat, aseet, taidot, varusteet kantopaikoittain, tausta ja datan hallinta |

## Käyttö kehityksessä

```bash
python -m http.server 8123
```

Avaa `http://localhost:8123`. (Pelkkä `index.html` tiedostona ei riitä — service
worker ja fetch vaativat http-palvelimen.)

## Julkaisu GitHub Pagesiin

```bash
git init
git add .
git commit -m "Totuuden Miekka: mockup"
git branch -M main
git remote add origin https://github.com/<käyttäjä>/<repo>.git
git push -u origin main
```

Sen jälkeen GitHubissa: **Settings → Pages → Source: Deploy from a branch →
main / (root)**. Osoite on `https://<käyttäjä>.github.io/<repo>/`.

## Asennus iPhonelle

Avaa osoite Safarissa → jakonappi → **Lisää Koti-valikkoon**. Appi avautuu
kokoruututilassa ilman selainpalkkeja ja toimii offline (service worker
välimuistittaa tiedostot, hahmodata tallentuu localStorageen).

Kun julkaiset muutoksia, kasvata **sekä** `sw.js`:n `CACHE`-numeroa **että**
`index.html`:n `?v=`-parametreja. Edellinen hoitaa service workerin välimuistin,
jälkimmäinen selaimen oman HTTP-välimuistin — ilman jälkimmäistä puhelin voi
näyttää vanhaa koodia.

## Mitä säädetään mistäkin

| Asia | Tiedosto |
|---|---|
| Kalenterin kuukaudet, aloituspäivä, kuunkierron pituus | `js/config.js` → `calendar`, `moon` |
| Kolikkotyypit ja vaihtokurssi | `js/config.js` → `coins`, `coinRatio` |
| Muonan lähtömäärä ja varoitusraja | `js/config.js` → `food` |
| Kielten tuntitavoitteet | appissa, Matka-välilehden "Tavoite"-nappi |
| Varusteiden kantopaikat | `js/config.js` → `slots` |
| Tilavaikutusten pikavalinnat | `js/config.js` → `combat.effectPresets` |
| Datalähde (seed ↔ sheets) | `js/config.js` → `data.source` |
| Sheetin id ja välilehtien gid:t | `js/config.js` → `data.sheets` |
| Offline-lähtötiedot | `js/seed-data.js` (generoitu, ei muokata käsin) |
| Ulkoasu | `css/style.css` |
| Hahmon kuva | tallenna `img/hahmo.jpg` (ks. `img/LUEMINUT.txt`) |

## Kolme datakerrosta

| Kerros | Sisältö | Elinkaari |
|---|---|---|
| **Hahmodata** | ominaisuudet, taidot, aseet, DB, loitsulistat, killat, kielet | Vain luku Sheetistä, välimuistitetaan offline-käyttöön |
| **Session data** | osuma- ja voimapisteet, kierros, tilavaikutukset, DB-togglet | Yksi peli-ilta, "Aloita uusi sessio" nollaa |
| **Kertyvä data** | matkapäivät, muona, rahat, kielten opiskelutunnit ja tavoitteet, päiväkirja, varusteet ja kantopaikat | Säilyy sessioiden yli, viedään takaisin Sheetiin |

Ero on koko datamallin ydin: Sheetin päivitys ei nollaa kertynyttä dataa, eikä
uuden session aloitus hukkaa kerättyjä kielitunteja tai rahoja. Yksityiskohdat ja
Sheetiin kirjoittava Apps Script: [docs/kertyva-data.md](docs/kertyva-data.md).

Mikään ei mene ulkopuoliselle palvelimelle Sheetin lukua ja valinnaista kertyvän
datan vientiä lukuun ottamatta.

## Selaintuki

Kaikki toimii Safarissa ja Chromessa. Puhehaku (Teot-välilehden mikrofoni) käyttää
Web Speech API:a: se toimii Safarissa iOS 14.5+ ja Chromessa, ja vaatii verkkoyhteyden
sekä mikrofoniluvan. Jos se ei ole käytettävissä, nappi näkyy himmennettynä ja taidot
haetaan hakukentästä normaalisti.
