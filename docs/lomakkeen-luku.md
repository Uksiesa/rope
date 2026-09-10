# Miten appi lukee hahmolomaketta

Lomake on ihmisluettava *Character Record*, ei litteä datataulukko. Appi ei siis
vaadi omaa rakennetta, vaan `js/sheets.js` etsii tiedot **otsikkotekstien**
perusteella. Käytännössä: voit lisätä rivejä, siirtää lohkoja ja täyttää soluja
vapaasti, kunhan otsikkosanat pysyvät ennallaan.

Nykyinen lomake: `Ballarion`, kaksi välilehteä.

| Välilehti | gid | Sisältö |
|---|---|---|
| `Character` | 1754872422 | perustiedot, killat, kielet, STATS, panssari, aseet, loitsulistat, MISCELLANEOUS |
| `Skills or capabilities` | 761231743 | kaikki taidot bonuksineen |

gid löytyy osoiterivistä, kun välilehti on auki: `.../edit#gid=761231743`.
Ne asetetaan tiedostoon `js/config.js` → `CONFIG.data.sheets.gids`.

## Osoite ja oikeudet

```
https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>
```

Tämä on raakadump, joka säilyttää tyhjät solut ja rivit sellaisenaan. Jakoasetus:
**Kuka tahansa, jolla on linkki → Katselija**.

> Miksi ei `gviz/tq?tqx=out:csv`: gviz päättelee jokaiselle sarakkeelle tyypin ja
> pudottaa siihen sopimattomat solut. Tässä lomakkeessa se hukkasi mm. `Spoken`-
> otsikon sekä `Sex`-, `Height`- ja `Weight`-arvot, koska ne ovat numerosarakkeiden
> keskellä. `export?format=csv` ei tee tyyppipäättelyä.

## Character-välilehti

Otsikot, joita parseri etsii. Arvo luetaan **otsikon oikealta puolelta**
ensimmäisestä ei-tyhjästä solusta.

| Otsikko | Käyttö appissa |
|---|---|
| `Character Name` | hahmon nimi |
| `Profession`, `Place of Origin`, `Sex`, `Height`, `Weight` | hahmolomakkeen tausta |
| `Level`, `Experience` | taso ja kokemuspisteet |
| `Base hits` | osumapisteiden maksimi |
| `Defensive bonus`, `Armor type`, `Shield`, `Helm`, `Arm greaves`, `Leg greaves` | puolustus |

**`Killat`** — otsikon alla nimi ja taso vierekkäin, kunnes tulee tyhjä rivi:

| Killat | Taso |
|---|---|
| Viihdyttäjät | 2 |
| Taikurit | 1 |

**`Kielet`** — samalla rivillä olevat `Spoken` ja `Written` määrittävät sarakkeet:

| Kielet | | Spoken | Written | |
|---|---|---|---|---|
| Midland | | 8 | 8 | |
| D'Hara | | 7 | `6->7` | `14 pv -> 112 h opiskelua (kirj.)` |

Muoto `6->7` tarkoittaa, että taso 6 on saavutettu ja 7 on työn alla. Viereisestä
huomiosta poimitaan tuntitavoite (`112 h`) ja se, kumpaa raitaa se koskee
(`kirj.` → kirjoitus). Tavoite on appissa muokattavissa, koska se kasvaa tason
mukana.

**`STATS`** — sarakkeet tunnistetaan otsikoista `Abbr.`, `Temp.`, `Pot.` ja
alariviltä `Normal`, `Extra`, `Total`. Lyhenteet ovat suomalaiset (T, K, I, M, P,
Vo, N, O, Va, E, AP); englanninkieliset nimet käännetään näytölle.

**`Magic pts.`** — voimapisteiden maksimi luetaan tämän lohkon `Total`-sarakkeesta.
Haku alkaa vasta `Magic pts.` -sarakkeesta, koska ominaisuustaulukossa on oma
`Total` samalla rivillä.

**`WEAPONS`** — otsikkorivin `Weapon`, `Bonus`, `Fumble`, `Range`, `Special`.
Aseen **OB ei tule tästä taulukosta** vaan vastaavasta taidosta
(`Ase 1 - Quarterstaff` → OB 89); taulukosta otetaan vain lisätiedot
(ase +15M, fumble 03).

**`SPELL LISTS`** — kaksi peräkkäistä palstaryhmää: osa listoista alkaa vasta
lohkon puolivälistä. Parseri tunnistaa listan otsikon siitä, että solun teksti on
jokin Magia-taidoista löytyvä listan nimi (`Lista 6 - Sound Control (50)` →
`Sound Control`). **Loitsun taso on rivin etäisyys otsikkorivistä**, joten tyhjät
tasot toimivat oikein.

Sulkeissa oleva loitsu, esim. `(Cloaking Sphere I)`, tulkitaan tasoksi jota
listan kehitys ei vielä kata → appi näyttää sen lukittuna eikä anna loitsia sitä.
Tämä täsmää lomakkeen kanssa: Cloaking-listaa on kehitetty 6 tasoa, ja tasot 1–6
ovat ilman sulkuja.

**`MISCELLANEOUS`** — kaikki otsikon alla olevat nimi/arvo-parit (Kirjastokortit,
Muuta) näytetään hahmolomakkeen Tausta-osiossa sellaisenaan.

## Skills or capabilities -välilehti

Otsikkorivi tunnistetaan solusta `Skill/Capability`; sen alta luetaan sarakkeet:

| Otsikko | Merkitys |
|---|---|
| `Total` (Bonuses-lohko) | taidon kokonaisbonus |
| `Current` (Levels-lohko) | hankitut tasot |
| `Rank`, `Stat`, `Level`, `Item`, `Misc.` | bonuksen erittely, näkyy taidon alla |
| `Classes`, `Cost` | luetaan, mutta ei näytetä appissa |

- **Kategoriat** tunnistetaan riveistä, joilla on vain nimi (Havannointi,
  Keskittyminen, Kielet, Magia, Sosiaaliset, Taistelu, Taiteet, Tieteet, Ulkoilu,
  Urheilu, Vehkeily). Yksittäinen irrallinen luku kategoriarivillä ei häiritse.
- Jos `Total` on tyhjä, bonus lasketaan erittelyn summana.
- **Negatiiviset bonukset**: lomake käyttää typografista miinusta (U+2212), ei
  tavallista tavuviivaa. Parseri normalisoi sen ja muut ajatusviivat, joten esim.
  Haarniska −18 luetaan oikein negatiivisena.
- **Yhdistelmätaidot**: jos sekä nimessä että bonuksessa on sama määrä
  kauttaviivalla erotettuja osia (`Hiivi/piileskele` → `32/21`), taito jaetaan
  erillisiksi taidoiksi (Hiivi +32, Piileskele +21). Alkuperäinen merkintä näkyy
  taidon tiedoissa. Pelkkä nimen kauttaviiva ei jaa taitoa
  (`Eläinten käsittely/koulutus` pysyy yhtenä).
- **Näyttönimet**: lomakkeen kirjanpitonimistä riisutaan järjestysnumerot appin
  listoihin — `Lista 6 - Sound Control (50)` → `Sound Control`,
  `Ase 1 - Quarterstaff` → `Quarterstaff`,
  `Kieli 2 - kirjallinen D'Hara` → `D'Hara — kirjoitus`. Alkuperäinen nimi säilyy
  kentässä `name` ja näkyy taidon tiedoissa, joten lomakkeen rivin löytää aina.
- Rivit joiden nimi alkaa `#` (esim. `#N/A`) ohitetaan.
- `Lista N - <nimi> (50)` -taidot muodostavat loitsulistat: taidon bonus on listan
  heittobonus ja `Current` kertoo montako tasoa listaa on kehitetty.
- `Ase N - <nimi>`, `Aseeton taistelu - <nimi>` ja `Suunnatut taiat` muodostavat
  Taistelu-välilehden asevalikon. Suunnatuilla taioilla ei ole parrya.

## Mitä lomakkeessa ei ole

Varusteet, rahat, muona ja vastustusheitot puuttuvat lomakkeesta. Ne hoidetaan
appissa kertyvänä datana (ks. [kertyva-data.md](kertyva-data.md)); vastustusheittojen
kortti piilotetaan automaattisesti, kun dataa ei ole.

## Lähtötiedot ilman verkkoa

`js/seed-data.js` on generoitu **samalla parserilla** samasta lomakkeesta. Appi
näyttää sen heti käynnistyessään ja hakee tuoreen datan taustalla, joten se toimii
myös offline. Tiedostoa ei muokata käsin — päivitä lomake Sheetsissä ja paina ⟳.
