/* VARUSTELISTA — Ballarionin kantamukset.

   Varusteet eivät ole hahmolomakkeella, joten ne annetaan tässä. Lista on
   appin lähtötieto: kantopaikka (`location`) on vain oletus, ja kun sen
   vaihtaa Hahmo-välilehdellä, valinta tallentuu kertyvään dataan eikä tämä
   tiedosto enää ohita sitä.

   Kentät:
     nro      lähdelistan juokseva numero
     name     esineen nimi
     qty      kappalemäärä, jos esineitä on useampi
     note     tarkenne: taikabonus, tilavuus, pituus, sisältö tms.
     price    hinta pronssikolikkoina (lähdelistan sarake hinta_br)
     weight   paino kiloina, jos tiedossa — lähdelistassa paino puuttuu
     location kantopaikka, ks. CONFIG.slots

   Lisää esine antamalla sille uusi id; vanhoja id:itä ei kannata kierrättää,
   koska kantopaikat on sidottu niihin. */

const INVENTORY_DATA = [
  { id: 'i1',  nro: 1,  name: 'Pehmeä nahkahaarniska AT 5', note: '+10' },
  { id: 'i2',  nro: 2,  name: 'Quarterstaff',               note: '+15M' },
  { id: 'i3',  nro: 3,  name: 'Quarterstaff',               note: '+10M' },
  { id: 'i4',  nro: 4,  name: 'Quarterstaff',               note: '+5M' },
  { id: 'i5',  nro: 5,  name: 'Saappaat' },
  { id: 'i6',  nro: 6,  name: 'Vyö' },
  { id: 'i7',  nro: 7,  name: 'Viitta (vedenpitävä)' },
  { id: 'i8',  nro: 8,  name: 'Vaatteet' },
  { id: 'i9',  nro: 9,  name: 'Luuttu' },
  { id: 'i10', nro: 10, name: 'Kaulahuivi' },
  { id: 'i11', nro: 11, name: 'Makuupussi (kevyt)' },
  { id: 'i12', nro: 12, name: 'Teltta' },
  { id: 'i13', nro: 13, name: 'Huppu' },
  { id: 'i14', nro: 14, name: 'Vesileili' },
  { id: 'i15', nro: 15, name: 'Säkki',            note: 'vetää 25 kg', price: 2.2 },
  { id: 'i16', nro: 16, name: 'Kynttilä',         qty: 10,             price: 3 },
  { id: 'i17', nro: 17, name: 'Paperi',           qty: 20,             price: 9 },
  { id: 'i18', nro: 18, name: 'Sulkakynä',        qty: 9,              price: 0.3 },
  { id: 'i19', nro: 19, name: 'Mustetta',         qty: 2,              price: 1 },
  { id: 'i20', nro: 20, name: 'Tulukset',                              price: 0.9 },
  { id: 'i21', nro: 21, name: 'Sytykkeet',                             price: 0.2 },
  { id: 'i22', nro: 22, name: 'Trail rations',    qty: 14,             price: 1 },
  { id: 'i23', nro: 23, name: 'Ensiapuvarusteet', qty: 2,              price: 2 },
  { id: 'i24', nro: 24, name: 'Lyhty',                                 price: 1 },
  { id: 'i25', nro: 25, name: 'Ruoka',                                 price: 0.5 },
  { id: 'i26', nro: 26, name: 'Öljypullo',        qty: 3,              price: 3 },
  { id: 'i27', nro: 27, name: 'Narua',            note: '20 m' },
  { id: 'i28', nro: 28, name: "D'Haran oppikirja", note: '6 → 8' },
  { id: 'i29', nro: 29, name: 'Leili 1.5 l',      note: 'Flabadin viiniä' },
  { id: 'i30', nro: 30, name: 'Kangasriepuja' },
  { id: 'i31', nro: 31, name: 'Hunajasylinteri' },
  { id: 'i32', nro: 32, name: "Kirja D'Haran historiasta" },
  { id: 'i33', nro: 33, name: 'Risa nahkapussi pillopolulta' },
  { id: 'i34', nro: 34, name: 'Paksumpi takki' },
  { id: 'i35', nro: 35, name: 'Paksummat housut' },
  { id: 'i36', nro: 36, name: 'Paksummat kengät' },
  { id: 'i37', nro: 37, name: 'Raskaampi makuupussi' },
  { id: 'i38', nro: 38, name: 'Hieno esiintymisasu' }
];
