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
| **Hahmo** | Hahmon kuva, ominaisuudet, killat, aseet, taidot, varusteet kantopaikoittain, tausta ja datan hallinta. Täältä pääsee myös **Seuraava taso** -näkymään |

**Seuraava taso** on oma näkymänsä Hahmo-välilehden napin takana — ei alapalkissa,
koska tasonnosto tehdään sessioiden välissä. Se lukee Sheetsin taitoruudukkoon
merkityn kehityspistesuunnitelman, näyttää bonukset ennen ja jälkeen, ja
"Nosta tasoa" laskee kaiken uudelleen uusilla ominaisuusarvoilla.
| **Matka** | Kampanjakalenteri, kuunkierto, matkapäivät, muona, rahat neljänä kolikkotyyppinä, kielten opiskelutunnit ja päivä päivältä täyttyvä päiväkirja |
| **Teot** | Taidon bonus + käsin syötetty heitto. Haku, kategoriasuodattimet ja puhehaku |
| **Taistelu** | Osumapisteet, taistelukierrokset ja tilavaikutukset (tainnutus laskee alas, verenvuoto vähentää hp:tä kierroksen lopussa), aseen OB jaettuna hyökkäykseen ja parryyn, DB:n komponentit togglattavina, heittolaskuri |
| **Taika** | Voimapisteet, **aktiiviset loitsut** ja loitsut taikalistoittain ryhmiteltynä. Loitsiminen vähentää pisteet ja kestovaikutteinen loitsu jää aktiivisten listalle, jolloin sen bonus lasketaan mukaan Taistelu- ja Teot-näkymissä |

**Negatiivinen modi**: modikentän vieressä on etumerkkinappi (+/−), koska iPhonen
numeronäppäimistössä ei ole miinusmerkkiä. Napin voi painaa ennen tai jälkeen luvun
kirjoittamisen, ja punainen − tarkoittaa että modi vähennetään (esim. haavojen
aiheuttama toimintakyvyn heikkeneminen).

**Avoin heitto**: kun heität 96+ tai 05−, heittokentän alle ilmestyy korostettu
"+ avoin heitto" -nappi. Se siirtää heiton ketjuun ja tyhjentää kentän seuraavaa
varten; appi laskee suunnan (korkea lisätään, matala vähennetään) ja näyttää
ketjun auki: `97 + 96 = 193`. Rajat säädetään `js/config.js` → `openEnded`.

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
| Varustelista | `js/inventory-data.js`; kantopaikat vaihdetaan appissa |
| Kielten tuntitavoitteet | appissa, Matka-välilehden "Tavoite"-nappi |
| Avoimen heiton rajat | `js/config.js` → `openEnded` |
| Bonustaulukot | Sheetin `Rules`-välilehti, oletukset `js/config.js` → `rules` |
| Loitsujen vaikutukset | Sheetin `Spell bonus` -välilehti, ks. [docs/loitsut.md](docs/loitsut.md) |
| Oletusfumble | `js/config.js` → `rules.defaultFumble` |
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

**Loitsut vaikuttavat heittoihin.** Aktiivisen loitsun bonus lasketaan mukaan
puolustukseen ja taitoheittoihin, ja yksittäisen heiton kohdalla sen voi kytkeä
pois. Loitsuhyökkäykset ovat asevalikossa ja veloittavat voimapisteet samasta
poolista. Aseilla on omat fumble-rajansa. Kaikki tämä: [docs/loitsut.md](docs/loitsut.md).

**Hahmodata on raakasyötteitä.** Sheet kertoo ominaisuusarvot, taitojen tasot,
kiltatasot sekä esine- ja erikoisbonukset; appi laskee niistä taitobonukset,
aseiden OB:n, puolustuksen, voimapisteet ja kehityspisteet. Kaavat ja Rules-
välilehden rakenne: [docs/bonuslaskenta.md](docs/bonuslaskenta.md).

Mikään ei mene ulkopuoliselle palvelimelle Sheetin lukua ja valinnaista kertyvän
datan vientiä lukuun ottamatta.

## Selaintuki

Kaikki toimii Safarissa ja Chromessa. Puhehaku (Teot-välilehden mikrofoni) käyttää
Web Speech API:a: se toimii Safarissa iOS 14.5+ ja Chromessa, ja vaatii verkkoyhteyden
sekä mikrofoniluvan. Jos se ei ole käytettävissä, nappi näkyy himmennettynä ja taidot
haetaan hakukentästä normaalisti.
