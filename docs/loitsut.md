# Loitsujen vaikutukset

Loitsu ei ole appissa pelkkä nimi ja hinta: kestovaikutteinen loitsu jää
**aktiivisten listalle** ja sen bonus lasketaan mukaan taistelu- ja taitoheittoihin
niin kauan kuin se on voimassa. Vaikutukset tulevat Sheetistä, joten uusi loitsu
tai muuttunut bonus vaatii vain taulukkomuokkauksen.

## Spell bonus -välilehti

Välilehti `Spell bonus` (gid `354842485`) on tiedostossa `js/config.js` →
`CONFIG.data.sheets.gids.spells`. Yksi rivi per vaikutus, koska sama loitsu voi
vaikuttaa kahteen asiaan.

```
SPELL BONUS
Loitsu        Lista             Tyyppi  Kohde           Arvo  Kesto  Oletus  Huomio
Shield I      Attack Avoidance  DB      melee+missile     25  kesto  kyllä
Bladeturn I   Attack Avoidance  DB      melee            100  kerta  kyllä
Deflect I     Attack Avoidance  DB      missile          100  kerta  kyllä
Turn missile  Attack Avoidance  DB      missile           20  kerta  kyllä
Turn blade    Attack Avoidance  DB      melee             50  kesto  kyllä
Blur          Cloaking          DB      kaikki            10  kesto  kyllä
Shadow        Cloaking          taito   Hiivi             25  kesto  kyllä
Shadow        Cloaking          taito   Piileskele        75  kesto  kyllä
Sly ears      Sense Mastery     taito   Havannointi       50  kesto  kyllä   vain kuulo
Sly ears      Sense Mastery     taito   Havannointi       25  kesto  ei      kuulo + muut aistit
Shock Bolt    Light Molding     hyökkäys                   0  kerta  kyllä   suunnattu taika
```

| Sarake | Merkitys |
|---|---|
| `Loitsu` | nimi. Täsmäys lomakkeen loitsulistaan on sumea, joten `Shock Bolt` löytää rivin `Shock Bolt I` |
| `Tyyppi` | `DB` = puolustus · `taito` = lisä nimettyyn taitoon · `hyökkäys` = valittavissa hyökkäystyypiksi |
| `Kohde` | taidolla **taidon nimi kuten Skills-välilehdellä** (`Hiivi`, `Piileskele`); DB:llä `melee`, `missile`, `melee+missile` tai `kaikki` |
| `Arvo` | bonus positiivisena — myös "−25 hyökkääjän heittoon" kirjataan `25`:nä, koska lopputulos on sama kuin DB-lisä |
| `Kesto` | `kesto` = voimassa kunnes poistetaan · `kerta` = yhteen hyökkäykseen |
| `Oletus` | onko bonus päällä heti. `ei` sopii vaihtoehtoisille varianteille (Sly ears) |
| `Huomio` | näkyy bonuksen yhteydessä, esim. `vain kuulo` |

Sarakeotsikot tunnistetaan myös englanniksi (`Spell`, `Type`, `Target`, `Value`,
`Scope`, `Default`, `Note`), ja sijainnilla ei ole väliä.

Taidon nimen täsmäys on sumea, joten `havainnointi` löytää rivin `Havannointi` ja
`piileskeleminen` rivin `Piileskele`. Liian kaukana oleva muoto ei kuitenkaan osu —
`hiipiminen` **ei** löydä taitoa `Hiivi`. Jos kohde jää osumatta, Hahmo-välilehden
Bonuslaskenta-kortti kertoo siitä punaisella, eikä bonus jää hiljaa vaikuttamatta.

## Aktiiviset loitsut

Taika-välilehden ylin kortti. Kun loitsit loitsun, jolla on vaikutusrivejä, se
lisätään listalle automaattisesti. **Ajastinta ei ole** — loitsu poistuu vasta kun
painat ✕. Myös kertakäyttöiset (Bladeturn, Deflect, Turn missile) poistetaan käsin.

Loitsu, jolla ei ole vaikutusrivejä, veloittaa vain voimapisteet eikä jää listalle.

## Mihin vaikutukset menevät

**Taistelu** — `DB`-tyyppiset vaikutukset ilmestyvät puolustuksen komponenttilistaan
kilven ja panssarin rinnalle, ja niitä voi kytkeä pois samalla tavalla. Kohde
näkyy rivillä (`melee ja missile vastaan`), joten oikean valinta tilanteeseen on
helppoa.

**Teot** — taitovaikutukset näkyvät valitun taidon kortissa nappeina, ja ne
lasketaan heiton summaan. Napista bonuksen voi kytkeä pois **yhtä heittoa varten**
ilman että loitsu poistuu aktiivisista: Sly ears antaa +50 pelkkään kuuloon ja +25
kuulon ja muiden aistien yhdistelmään, joten näköhavainnossa molemmat kytketään
pois. Valinta nollautuu kun vaihdat taitoa.

## Loitsuhyökkäykset

`hyökkäys`-tyypin loitsu ilmestyy Taistelu-välilehden asevalikkoon merkinnällä
"loitsu". Sen OB tulee **Suunnatut taiat** -taidosta, koska se on suunnatun taian
hyökkäysbonus, ja hyökkäysheitto tehdään normaalisti (avoin heitto mukaan lukien).

Lisäksi näkyy oma rivinsä, jossa on **Loitsi (−5 pp)** -nappi. Se veloittaa
voimapisteet **samasta poolista kuin Taika-välilehti** ja kirjaa loitsinnan:

```
Loitsittu kierroksella 1 · −5 pp · jäljellä 16
```

Merkintä nollautuu kierroksen vaihtuessa. Parry on pois käytöstä, koska
suunnatulla taialla ei torjuta.

## Fumble

Jokaisella aseella on oma fumble-arvonsa lomakkeen `WEAPONS`-taulukon
`Fumble`-sarakkeessa. **Heitto ≤ arvo on fumble**, ja tarkistus tehdään ketjun
ensimmäisestä, muokkaamattomasta heitosta.

Arvo näkyy hahmolomakkeen aselistassa, ja Taistelu-välilehti varoittaa punaisella
kun hyökkäysheitto alittaa käytössä olevan aseen rajan:

```
FUMBLE — Quarterstaff, raja 3
```

Aseille joita ei ole `WEAPONS`-taulukossa (aseeton taistelu, suunnatut taiat)
käytetään `CONFIG.rules.defaultFumble`-oletusta, joka on **5**. Varoitus kertoo
silloin `(oletus, ei lomakkeessa)`. Kun lisäät rivin taulukkoon, arvo tulee sieltä.
