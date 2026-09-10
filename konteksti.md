# Konteksti ja päätökset

Projekti: RoleMaster-kampanjan (Sword of Truth -henkinen maailma) apuväline
pelisessioihin. Henkilökohtainen käyttö, yksi hahmo kerrallaan, iPhone.

## Reunaehdot

- Kehitys Windowsilla, käyttö iPhonella → **ei natiivia iOS-appia** (vaatisi Macin).
  Ratkaisu: PWA, joka asennetaan Safarista kotinäytölle.
- Ei build-vaihetta, ei npm-riippuvuuksia. Tiedostot menevät GitHub Pagesiin
  sellaisenaan, jolloin julkaisu on pelkkä `git push`.
- Toimittava offline: pelipaikalla ei voi luottaa verkkoon. Heittolaskenta on
  puhdasta JS:ää, ja hahmodata välimuistitetaan.

## Päätökset (9.9.2026)

**Datalähde: julkaistu / linkillä jaettu Google Sheet, luku gviz-CSV:nä.**
Ei API-avainta eikä OAuth-kirjautumista, CORS toimii GitHub Pagesista suoraan.
Hinta: sheet on teknisesti julkinen linkin takana. Hyväksyttävää, koska sisältö on
kuvitteellisen hahmon tilastoja. Vaihtoehdot (API-avain, Apps Script Web App)
harkittiin ja hylättiin turhana monimutkaisuutena tähän käyttöön.

**Sheet on yksisuuntainen totuus.** Appi ei kirjoita Sheetiin. Tasonnousut ja
kehitys tehdään Sheetissä pelin ulkopuolella, appi vain lukee. Manuaalinen
päivitysnappi, ei jatkuvaa synkronointia.

**Session tiedot erillään hahmodatasta.** Osumapisteet, matkapäivät, muona, rahat,
kielitunnit ja DB-togglet elävät localStoragessa. Näin Sheetin päivitys ei nollaa
kesken sessionia kertynyttä tilaa. Kääntöpuoli: session lopuksi tunnit ja rahat
pitää kirjata Sheetiin käsin, jos ne halutaan säilyttää pysyvästi.

**Taistelu: sekä jaettava pooli että DB:n omat komponentit näkyvissä.**
Aseen OB on pooli, joka jaetaan liukusäätimellä hyökkäykseen ja parryyn. DB:n omat
komponentit (Qu-bonus, kilpi, panssari, maagiset esineet, adrenaliinipuolustus,
maastosuoja) ovat erillinen togglattava lista, ja parry lisätään niiden summaan.
Aseella voi olla `can_parry = ei` (jouset) ja `blocks`-lista komponenteista, jotka
eivät ole käytössä sillä aseella (kilpi jousta käytettäessä).

**Kalenteri konfiguroitava.** Oletus 12 × 30 päivää ja 28 päivän kuunkierto, koska
28 = 4 × 7 pitää kuun vaiheet siisteinä. Kuukausien nimet ja pituudet, aloituspäivä
ja kuun kierron pituus ovat `js/config.js`:ssä; oikea gregoriaaninen kalenteri
saadaan vaihtamalla kuukausitaulukko.

**Rahat: neljä tasoa, 1:10 -suhde.** Kulta → hopea → pronssi → kupari. Kaikki
laskenta tehdään alimman yksikön kokonaislukuina, jolloin pyöristysvirheitä ei tule.
"Vaihda ylöspäin" normalisoi kolikot ja "Maksa" vähentää summan ja antaa vaihtorahat.

**Puhehaku on lisä, ei perusta.** Web Speech API + sumea täsmäys (Sørensen–Dice
kirjainpareilla, kestää suomen taivutusta kohtuullisesti). Jos tunnistusta ei ole
tai osumaa ei löydy, puhuttu teksti menee hakukenttään ja lista suodattuu.

## Päätökset (10.9.2026) — laajennuskierros

**Viides näkymä: Taika.** Loitsut omaan välilehteensä eikä hahmolomakkeelle, koska
loitsulista on pelin aikana toistuvasti tarvittava työkalu, ei taustatietoa.
Voimapisteet toimivat täsmälleen kuten osumapisteet: yksi nykyarvo, jota säädetään
napeilla. Loitsun valinta + "Loitsi" vähentää kustannuksen automaattisesti, mutta
manuaalinen säätö on aina käytettävissä (velhon esineet, poikkeukset, pelinjohtajan
päätökset).

**Tilavaikutukset kierroslaskurin ympärille.** Yksi "Kierros loppuu →" -nappi ajaa
kaiken: verenvuoto vähentää osumapisteet ja tainnutus tikittää alas. Näin kirjanpito
ei jää kesken taistelun. Kaksi tyyppiä riittää:
- **tainnutus** = kierroksia jäljellä, päättyy itsestään ja nostaa näkyvän bannerin
  "voit toimia taas"
- **verenvuoto** = hp/kierros, jatkuu kunnes se poistetaan käsin (parannus, side)

Banneri on tarkoituksella koko näytön levyinen ja vilkkuva: pelitilanteessa
tärkein tieto on "saanko toimia".

**Datakerrokset erotettu kolmeen.** Aiemmin kaikki session tila oli yhdessä
localStorage-avaimessa. Nyt session data (hp, pp, kierros, vaikutukset) ja kertyvä
data (päivät, muona, rahat, kielitunnit, päiväkirja, kantopaikat) ovat erillään.
Perustelu: Sheetin päivitys ei saa nollata kertynyttä dataa, eikä uuden peli-illan
aloitus saa hukata kerättyjä tunteja. Kertyvä data on myös se, joka viedään takaisin
Sheetiin.

**Sheetiin kirjoitus vaatii Apps Scriptin.** gviz-CSV on vain luku, joten kertyvän
datan vienti tehdään pienellä web app -endpointilla (docs/kertyva-data.md).
Endpoint on valinnainen: ilman sitä "Vie Sheetiin" kopioi datan leikepöydälle
sarkainerotettuna, ja se liitetään käsin. Token-tarkistus estää vahinkokirjoitukset
jos osoite vuotaa — se ei ole vakava suojaus, mutta riittää tähän käyttöön.

**Päiväkirja kirjautuu automaattisesti.** Ateriat, opiskelutunnit ja ostokset
menevät sen päivän merkintään, joka on kalenterissa auki. Näin jälkikäteen voi
tarkistaa, vastaako laskuri sitä mitä pelissä oikeasti tapahtui. Päivän peruminen
palauttaa ateriat ja poistaa tyhjän merkinnän.

**Varusteiden kantopaikka on kertyvää dataa.** Sheetin `location` on oletus;
appissa tehty siirto (reppu → kädessä) tallentuu esineen id:n alle. Varusteet
näytetään kantopaikan mukaan ryhmiteltyinä painoineen — siitä näkee heti, mitä on
käsillä ja mitä pitäisi kaivaa repusta.

## Päätökset (10.9.2026) — oikea hahmolomake

**Lomake parsitaan sellaisenaan, sitä ei muuteta.** Hahmolomake on ihmisluettava
Character Record kahdella välilehdellä. Vaihtoehto olisi ollut lisätä sheetiin
kaavoilla täytettävät konelukukelpoiset välilehdet, mutta silloin lomake ja kaavat
pitäisi pitää synkassa. Parseri etsii tiedot otsikkoteksteillä ("Character Name",
"Defensive bonus", "SPELL LISTS"), joten rivien lisääminen ei riko sitä. Yksityiskohdat:
`docs/lomakkeen-luku.md`.

**Luku `export?format=csv&gid=`, ei gviz.** gviz päättelee sarakkeille tyypin ja
pudottaa siihen sopimattomat solut — tässä lomakkeessa se hukkasi `Spoken`-otsikon
sekä `Sex`-, `Height`- ja `Weight`-arvot, koska ne ovat numerosarakkeiden keskellä.
export-osoite on raakadump ja CORS toimii (lopullinen vastaus `Access-Control-Allow-Origin: *`).
Hinta: välilehden gid pitää katsoa osoiterivistä kerran ja laittaa configiin.

**`js/seed-data.js` generoidaan samalla parserilla.** Näin lähtötiedot ja live-luku
eivät voi ajautua erilleen, ja appi toimii offline heti ensimmäisellä avauksella.
Tiedostoa ei muokata käsin.

**Loitsut listoittain, ei tasoittain.** RoleMasterissa loitsulista on se yksikkö,
jota kehitetään ja jolla heitetään, joten listan otsikossa näkyy sen heittobonus
(esim. Sound Control +52) ja loitsut ovat listan sisällä tasojärjestyksessä.

**Sulkeissa oleva loitsu = ei vielä osattavissa.** Lomakkeessa esim.
`(Cloaking Sphere I)`. Tulkinta varmistui datasta: jokaisen listan sulkeettomat
tasot vastaavat täsmälleen listan kehitettyjen tasojen määrää. Appi näyttää ne
lukittuina eikä anna loitsia niitä.

**Kielten opiskelu: kaksi erillistä raitaa ja tasokohtainen tavoite.** Lomakkeessa
puhe ja kirjoitus ovat eri tasoilla (D'Hara 7 / 6→7), joten ne ovat appissa omat
raitansa. Tuntitavoite kasvaa tason mukana eikä sitä voi laskea kaavalla, joten se
annetaan kielikohtaisesti appissa; lomakkeen merkintä ("14 pv -> 112 h opiskelua
(kirj.)") luetaan lähtöarvoksi.

**Aseen OB tulee taidosta, ei WEAPONS-taulukosta.** Taulukon `Bonus` (+15M) on
aseen oma bonus, joka sisältyy jo taidon Item-sarakkeeseen. Suunnatut taiat (+43)
on asevalikossa mukana, mutta ilman parrya.

**DB puretaan komponentteihin laskemalla.** Lomake antaa yhden luvun (34). Siitä
nopeusbonus (24) on ominaisuudesta ja loppu (10) varusteista, mikä täsmää
merkintään "AT5 +10". Näin komponentin voi kytkeä pois kesken taistelun.

**Välimuistin tyhjennys kahdessa paikassa.** `sw.js`:n `CACHE` hoitaa service
workerin, `index.html`:n `?v=` selaimen HTTP-välimuistin. Ilman jälkimmäistä
puhelin näytti vanhaa koodia myös service workerin päivityksen jälkeen.

**Lomakkeen numeromuodot yllättivät kahdesti.** Negatiiviset bonukset käyttävät
typografista miinusta (U+2212), jonka ensimmäinen parseri siivosi pois merkkinä —
41 taitoa näkyi positiivisena. Lisäksi `Hiivi/piileskele` kantaa kahta bonusta
(`32/21`) yhdellä rivillä; se jaetaan nyt kahdeksi taidoksi. Molemmat ovat esimerkki
siitä, että ihmisluettavan lomakkeen parsiminen vaatii datan tarkistamista, ei vain
rakenteen lukemista.

## Vaihe ja seuraavat askeleet

Vaihe 1 (valmis): mockup, jotta UI ja käyttövirta voidaan arvioida.
Vaihe 2 (valmis): oikea hahmolomake luetaan live-tilassa Sheetsistä
(`CONFIG.data.source = 'sheets'`).
Vaihe 3: kertyvän datan kirjoitus takaisin Sheetiin Apps Scriptillä, jos
leikepöytävienti osoittautuu liian työlääksi.

Avoinna:
- Halutaanko heittohistoria (viimeiset 5 heittoa näkyviin)?
- Kriittisten taulukoiden (crit-taulut) pikahaku — pelinjohtajan vai pelaajan työkalu?
- Pitäisikö loitsimisen kirjautua päiväkirjaan, vai riittääkö pelkkä pp-laskuri?
- Tarvitaanko tilavaikutuksille kolmas tyyppi (esim. toimintapistesakko, joka
  vähentää OB:tä kierroksittain)?
- Onko lomakkeen "112 h" tason vaatimus vai jo kertynyt määrä? Appi tulkitsee sen
  vaatimukseksi; arvon voi vaihtaa "Tavoite"-napista.
- Kirjastokortit ovat nyt pelkkää tekstiä Tausta-osiossa — kaivataanko niille
  hakua tai kaupunkikohtaista listaa?
