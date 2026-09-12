# Bonuslaskenta

Sheet sisältää **raakasyötteet**, appi laskee kaikki johdetut luvut. Käytännössä
lomakkeeseen kirjataan vain se mitä pelissä tapahtuu — ominaisuusarvot, taitojen
tasot, kiltatasot sekä esine- ja erikoisbonukset — ja attack, defense, taitobonukset,
voimapisteet ja kehityspisteet syntyvät niistä `js/rules.js`:ssä.

## Kaavat

Nämä on johdettu Ballarionin lomakkeesta ja todennettu sitä vastaan.

| Osa | Kaava |
|---|---|
| **Tasobonus** | 0 tasoa = −25 · tasot 1–10 = +5/taso · 11–20 = +2/taso · 21–30 = +1/taso |
| **Ominaisuusbonus taidolle** | `Classes`-sarakkeen ominaisuuksien bonusten **keskiarvo**, puolikkaat ylöspäin. `Va/Va/P` = (26+26+20)/3 = 24 |
| **Ammatin tasobonus** | kategoriakohtainen kerroin × hahmon taso. Laulaja: Sosiaaliset 3, Kielet 2, Taiteet 2, Urheilu 1 |
| **Taidon kokonaisbonus** | tasobonus + ominaisuusbonus + ammatin tasobonus + esine + muu |
| **Ominaisuusbonus** | taulukkohaku (TEMP) + kiltatasojen tuottama lisä |
| **Puolustus (DB)** | nopeusbonus + varusteiden osuus |
| **Voimapisteet** | kolmen realmi-ominaisuuden pistekeskiarvo × taso |
| **Osumapisteet** | 30 + kestävyysbonus + taso × tasokerroin. Kerroin riippuu ammatista ja voi vaihdella tason mukaan; Laulajalla se on aina 2. Kestävyysbonus on kokonaisbonus, eli `Extra`-sarake mukaan lukien: 30 + 5 + 7 × 2 = 49 |
| **Kehityspisteet** | viiden kehitysominaisuuden taulukkoarvojen summa |
| **Aseen OB** | vastaavan taidon kokonaisbonus |
| **Loitsulistan bonus** | vastaavan `Lista N -` -taidon kokonaisbonus |

Taulukkohakuja (ominaisuusbonus, kehityspisteet, voimapisteet) ei voi johtaa datasta,
joten ne tulevat Sheetin **Rules**-välilehdeltä.

## Rules-välilehti

Välilehti `Rules` (gid `1135503206`) on tiedostossa `js/config.js` →
`CONFIG.data.sheets.gids.rules`. Lohkot tunnistetaan otsikkoteksteistä, joten
sarakkeiden ja rivien sijainnilla ei ole väliä.

**Väliaikataulukot** — yksi otsikkorivi, jossa on `Alkaen` ja `Asti` sekä yksi tai
useampi arvosarake. Kaikki kolme taulukkoa voivat olla samalla rivillä, kuten
nykyisessä lomakkeessa:

```
Alkaen  Asti  STATS BONUS  DEV POINTS  POWER POINTS
103     103   +45          15,8        4,6
102     102   +40          15,4        4,4
...
46      54    0            9,6         1,9
...
1       1     −30          1           0,1
```

Sarakeotsikot tunnistetaan sekä englanniksi että suomeksi (`STATS BONUS` /
`STAT BONUS` / `Ominaisuusbonus`, `DEV POINTS` / `Kehityspisteet`,
`POWER POINTS` / `Voimapisteet`). Typografinen miinus ja desimaalipilkku
käsitellään oikein. Kukin taulukko voi myös olla omana lohkonaan.

**Taitoluokkien tasobonus** — otsikko `TAITOLUOKKIEN BONUS`, sen alla rivi jossa
on `Taitoluokat` ja yksi tai useampi bonussarake. Käytetään `Yhteensä`-saraketta
jos se on, muuten viimeistä numerosaraketta:

```
TAITOLUOKKIEN BONUS
Taitoluokat   Hahmoluokka: Laulaja   Hahmon lisäbonus   Yhteensä
Kielet        2                      0                  2
Sosiaaliset   1                      2                  3
Taiteet       2                      0                  2
Urheilu       1                      0                  1
```

Luku kerrotaan hahmon tasolla: Sosiaaliset 3 × taso 7 = +21.

**Osumapisteiden tasokerroin** on valinnainen lohko `HITS` (tai `OSUMAPISTEET`),
sarakkeet `Alkaen`, `Asti`, `Kerroin` — tässä `Alkaen`/`Asti` ovat hahmon tasoja,
jolloin kerroin voi vaihdella tason mukaan. Ilman lohkoa käytetään
`CONFIG.rules.hitsPerLevel`-oletusta (Laulaja: 2 kaikilla tasoilla).

**Kiltabonukset** ovat valinnaisia (otsikko `GUILD BONUS` tai `KILTABONUS`,
sarakkeet `Kilta`, `Taso`, `Ominaisuus`, `Bonus`). Jos lohkoa ei ole — kuten nyt —
ominaisuuksien lisäbonus luetaan lomakkeen `Extra`-sarakkeesta sellaisenaan.

Jos Rules-välilehteä ei saada luettua, käytetään `CONFIG.rules`-oletuksia. Taulukot
tallentuvat myös `js/seed-data.js`:ään, joten offline-käytössä laskenta on sama.

## Kiltojen tasoedut

Lomakkeen `MISCELLANEOUS` > `Muuta` -kenttä kuvaa kiltaedut vapaana tekstinä, yksi
per rivi. Appi jäsentää ne säännöiksi, jotta ne päivittyvät hahmon tason ja
kiltatason mukana:

```
Viihdyttäjäkillan ominaisuusbonus tasolla 1: +1 ketteryys.
Viihdyttäjäkillan tasoetu tasolla 1: +5 pikajuoksu -taitoon
Viihdyttäjäkillan tasoetu tasolla 2: +1*taso havainnointi -taitoon.
Taikurikillan tasoetu tasolla 1: +5 ensiapu -taitoon.
```

Tunnistettava muoto on `<Kilta>killan <tasoetu|ominaisuusbonus|ominaisuustaso>
tasolla N: +X[*taso] <kohde>[ -taitoon]`. Kiltanimi tunnistetaan vartalosta
(`Viihdyttäjä` → `Viihdyttäjät`), ja taidon nimi sumealla vertailulla, joten
`havainnointi` löytää lomakkeen rivin `Havannointi`. Rivit jotka eivät vastaa
muotoa — kuten kameleonttisuden lihasta saatu bonus — ohitetaan; ne kuuluvat
taitorivin `Misc`-sarakkeeseen.

**`Misc`-solu on määräävä, `Muuta` vain selittää sen** — yhtä poikkeusta lukuun
ottamatta:

| Edun laji | Mistä se tulee | Esimerkki |
|---|---|---|
| **Kiinteä** | lomakkeen `Misc`-solusta, kirjataan käsin | Taikurit 1: +5 ensiapu |
| **Tasoon sidottu** | appi laskee `Level`-osuuteen | Viihdyttäjät 2: +1×taso havainnointi |

Jako on siinä, että tasoon sidottu etu muuttuu joka tasolla — sen kirjaaminen
käsin vanhentuisi heti, kuten kävikin (lomakkeessa oli +6 vielä tasolla 7).
Kiinteä etu taas pysyy paikallaan, joten `Misc`-solu riittää.

Jos kiinteä sääntö ja `Misc`-solu ovat ristiriidassa, se raportoidaan punaisella
Bonuslaskenta-kortissa: *"Muuta-kenttä lupaa +5, Misc-solussa on +0 — kirjaa se
Misc-soluun"*. Näin sama bonus ei tule lasketuksi kahteen kertaan eikä katoa.

Sääntö tunnistetaan vain jos hahmon kiltataso on vähintään säännön taso.

**Ominaisuusbonuksia ei lasketa säännöistä**, vaan ne luetaan lomakkeen
`Extra`-sarakkeesta. Syy: Extra sisältää muutakin kuin kiltaetuja (Ballarionilla
Terveys +5 ja Voima +5, joille ei ole sääntöä), joten laskeminen pelkistä
kiltasäännöistä hukkaisi ne.

## Kun lomake ei kerro tarpeeksi

Kaksi asiaa ei ole johdettavissa lomakkeen soluista, joten ne ovat
`js/config.js` → `CONFIG.rules`:

**`classesOverride`** — taidot joiden `Classes`-solu ei kerro oikeaa
ominaisuutta. Aseettoman taistelun riveillä on lomakkeessa identtiset solut
(`Vo`, `-`, `K`), vaikka lyönti käyttää Voimaa ja heitto Ketteryyttä:

```js
classesOverride: {
  'Aseeton taistelu - lyönti': 'Vo',
  'Aseeton taistelu - heitto': 'K'
}
```

**`sheetErrors`** — taidot joissa lomakkeen oma luku tiedetään virheelliseksi.
Laskennan tulos on oikea, ja poikkeama näytetään himmennettynä eikä se jää
vaatimaan huomiota:

```js
sheetErrors: ['Toisapu', 'Sääennustus']
```

## Tasoruudukko on suunnittelupinta

`Skills`-välilehden ruudukko (`-- SKILL RANKS --`) on sekä nykytila että seuraavan
tason suunnitelma:

| Merkki | Tulkinta |
|---|---|
| `*` | hankittu taso — näiden määrä on taidon tasoluku |
| numero | tälle tasolle käytetyt kehityspisteet (suunnitelma) |
| `X` | kehityspisteet maksettu aiemmin, taso odottaa opiskelua (esim. kieli) |
| `O` | vapaa paikka |

Ruudukossa on tyhjiä välisarakkeita; tason numero on solun järjestysluku
ei-tyhjien solujen joukossa. Rivillä on 25 paikkaa (10 + 10 + 5).

## Seuraava taso -näkymä

Oma näkymänsä, johon pääsee **vain Hahmo-välilehden napista** — ei alapalkissa,
koska tasonnosto tehdään sessioiden välissä eikä kesken pelin.

1. **Hae suunnitelma Sheetsistä** lukee ruudukkoon merkityt kehityspisteet.
2. Näkymä listaa ostot: tasot ennen ja jälkeen, bonus ennen ja jälkeen, hinta.
   `X`-merkinnät näkyvät erikseen "odottaa opiskelua" -listana eivätkä nouse.
3. **Nosta tasoa** kysyy ominaisuuksien uudet TEMP/POT-arvot ja laskee kaiken
   uudelleen: ominaisuusbonukset, taitobonukset, aseiden OB, puolustuksen,
   voimapisteet ja kehityspisteet.

Appi ei kirjoita Sheetiin, joten tasonnosto tallentuu **kertyvään dataan
päällekirjoituksena**. Hahmo-välilehden vienti sisältää yhteenvedon:

```
TASONNOSTO
uusi taso        8
kehityspisteet   7
taito: Kiipeily  6 tasoa
taito: Laulaminen 13 tasoa
ominaisuus: N    98 / 98
```

Kun lomake on päivitetty ja data haettu ⟳:llä, kumoa päällekirjoitus
"Kumoa tasonnosto" -napista.

## Vertailu lomakkeeseen

Lomakkeen omat lasketut sarakkeet on jätetty paikalleen tarkoituksella. Hahmo-
välilehden **Bonuslaskenta**-kortti kertoo, montako taitoa laskettiin
raakasyötteistä ja mitkä poikkeavat lomakkeen luvusta. Tyhjä poikkeamalista
tarkoittaa, että kaavat vastaavat lomaketta täsmälleen.

Osumapisteet, voimapisteet, kehityspisteet, puolustus, aseiden OB ja kaikki
ominaisuusbonukset täsmäävät lomakkeeseen. Taidoista **111/113 lasketaan**, ja
huomioitavaa on kolmea lajia:

| Taito | Laskettu | Lomake | Laji |
|---|---|---|---|
| Havannointi | 85 | 84 | appi laskee kiltaedun +1×taso = +7; lomakkeen `Level`-solussa on yhä +6 tasolta 6 |
| Ensiapu | Misc +0 | sääntö +5 | **ristiriita** — kiinteä kiltaetu puuttuu `Misc`-solusta |
| Toisapu | 0 | 11 | tunnettu lomakevirhe |
| Sääennustus | −9 | 6 | tunnettu lomakevirhe |

Kaksi yhdistelmätaidon puolikasta (Hiivi / Piileskele) käyttää lomakkeen arvoa:
rivillä on kaksi bonusta mutta vain yksi tasoruudukko ja yksi `Classes`-solu,
joten puolikkaita ei voi laskea erikseen. Jos haluat ne laskettaviksi, jaa rivi
sheetissä kahdeksi.
