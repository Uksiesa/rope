# Käyttöloki

Mittaa appin omaa käyttöä, ei pelin tapahtumia. Kysymys on yksi: **onko appi
pelin tiellä?** Siksi ei lasketa painalluksia vaan matkaa toiminnon alusta
tulokseen — näkymän avaus, selaaminen, haku, valinta, heitto.

Data pysyy laitteella (`localStorage`, avain `tm.usage.v1`) eikä kulje mihinkään.
Puskuri on rengas: vanhimmat putoavat pois 3000 tapahtuman jälkeen.

## Mitä kirjataan

| Laji | Milloin | Kentät |
|---|---|---|
| `view` | näkymästä poistuttaessa | kesto, syvin vieritys ruuduissa |
| `search` | hakukenttään kirjoitettaessa | merkkien määrä, osumien määrä |
| `pick` | taidon tai loitsun valinta | miten löytyi, rivinumero, aika näkymän avauksesta |
| `roll` | ensimmäinen heitto | aika valinnasta heittoon |
| `cast` | loitsiminen | loitsu, aika valinnasta |
| `tweak` | toistuva säätö | ase, jako, suodatin, osumapisteet, loitsulista |
| `tap` | muu painallus | kierros, mikrofoni |

`via` kertoo miten valinta löytyi: `haku`, `suodatin`, `viimeksi` vai `lista`.
Tämä ratkaisee, kannattaako listan järjestystä vai hakua parantaa.

## Luvut joita kannattaa seurata

| Luku | Mitä se kertoo | Tavoite |
|---|---|---|
| Avauksesta valintaan | kauanko taidon löytäminen kestää | alle 3 s |
| Valinnasta heittoon | kauanko heiton syöttö kestää | alle 3 s |
| Valinnan rivinumero | kuinka alhaalta listasta valitaan | pieni = järjestys osuu |
| Vieritys ruuduissa | kuinka kaukana tarvittu asia on | alle 2 |
| `tweak`-määrät | mitä säädetään toistuvasti | näkyville ylös |

Yhteenveto on Hahmo-välilehden Käyttöloki-kortissa. "Kopioi loki" antaa koko
lokin sarkainerotettuna taulukkolaskentaan, "Tyhjennä" nollaa sen.

## Miksi erillään päiväkirjasta

Päiväkirja kuvaa **pelimaailmaa** ja viedään Sheetiin. Käyttöloki kuvaa
**työkalua** eikä kuulu kampanjan tietoihin. Siksi oma avain, oma puskuri ja
oma tyhjennys: käyttölokia voi poistaa koska tahansa ilman että kampanjasta
häviää mitään.
