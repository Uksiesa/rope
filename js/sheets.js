/* Google Sheets -luku.

   Hahmolomake on ihmisluettava taulukko, ei litteä datataulukko, joten tiedot
   etsitään otsikkotekstien perusteella ("Character Name", "Defensive bonus",
   "SPELL LISTS", "Killat", ...). Rivien lisääminen lomakkeen sisään ei riko
   parseria; vain otsikoiden nimeäminen uusiksi rikkoo.

   Osoite: https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>
   Tämä on raakadump: se säilyttää tyhjät solut ja rivit sellaisenaan, toisin kuin
   gviz-rajapinta, joka päättelee sarakkeille tyypin ja pudottaa poikkeavat solut
   (esim. "Spoken"-otsikon numerosarakkeen keskeltä). CORS on sallittu, joten luku
   onnistuu GitHub Pagesista ilman API-avainta.

   Välilehden gid löytyy Sheetsin osoiterivistä, kun kyseinen välilehti on auki:
   .../edit#gid=761231743 */

const Sheets = {

  csvUrl(gid) {
    const cfg = CONFIG.data.sheets;
    if (!cfg.spreadsheetId) throw new Error('CONFIG.data.sheets.spreadsheetId puuttuu');
    return 'https://docs.google.com/spreadsheets/d/' + cfg.spreadsheetId +
           '/export?format=csv&gid=' + gid;
  },

  async fetchGrid(gid, label) {
    const res = await fetch(this.csvUrl(gid), { cache: 'no-store' });
    if (!res.ok) throw new Error((label || gid) + ': HTTP ' + res.status);
    return parseCsv(await res.text());
  },

  async fetchCharacter() {
    const gids = CONFIG.data.sheets.gids;
    const [character, skills] = await Promise.all([
      this.fetchGrid(gids.character, 'Character'),
      this.fetchGrid(gids.skills, 'Skills')
    ]);
    return parseCharacterSheet(character, skills);
  },

  /* ---------- Kertyvän datan kirjoitus ----------
     CSV-luku on vain luku. Kirjoitus vaatii Apps Script -web appin,
     jonka osoite laitetaan CONFIG.data.sheets.writeUrl -kenttään.
     Skriptin koodi: docs/kertyva-data.md. */

  canWrite() { return !!CONFIG.data.sheets.writeUrl; },

  async pushDurable(payload) {
    const url = CONFIG.data.sheets.writeUrl;
    if (!url) throw new Error('CONFIG.data.sheets.writeUrl puuttuu');
    // text/plain välttää CORS-esitarkistuksen, jota Apps Script ei käsittele.
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ token: CONFIG.data.sheets.writeToken || '' }, payload))
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    let out = null;
    try { out = JSON.parse(text); } catch (e) { /* Apps Script voi palauttaa HTML:ää */ }
    if (out && out.ok === false) throw new Error(out.error || 'Skripti palautti virheen');
    return out;
  },

  async pullDurable() {
    const gid = CONFIG.data.sheets.gids.durable;
    if (!gid) throw new Error('CONFIG.data.sheets.gids.durable puuttuu');
    const rows = await this.fetchGrid(gid, 'Durable');
    const row = rows.find(r => norm(r[0]) === 'json');
    if (!row) throw new Error('Durable-välilehdeltä ei löytynyt json-riviä');
    return JSON.parse(row[1] || '{}');
  }
};

/* ================= CSV ================= */

/** RFC4180-tyylinen CSV-jäsennin. Tyhjät rivit säilytetään, koska
    lomakkeen rakenne perustuu riviväleihin. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/* ================= Ruudukon apufunktiot ================= */

function cellAt(grid, r, c) {
  const row = grid[r];
  if (!row || c < 0 || row[c] === undefined || row[c] === null) return '';
  return String(row[c]).replace(/\s+/g, ' ').trim();
}

/** Etsii solun, jonka teksti vastaa otsikkoa. Palauttaa { r, c } tai null. */
function findLabel(grid, label, fromRow) {
  const want = norm(label);
  for (let r = fromRow || 0; r < grid.length; r++) {
    const row = grid[r] || [];
    for (let c = 0; c < row.length; c++) {
      if (norm(cellAt(grid, r, c)) === want) return { r: r, c: c };
    }
  }
  return null;
}

/** Etsii otsikon vain yhdeltä riviltä. */
function findInRow(grid, r, label, fromCol) {
  const want = norm(label);
  const row = grid[r] || [];
  for (let c = fromCol || 0; c < row.length; c++) {
    if (norm(cellAt(grid, r, c)) === want) return c;
  }
  return -1;
}

/** Ensimmäinen ei-tyhjä solu otsikon oikealla puolella. */
function valueRight(grid, r, c, maxSpan) {
  const span = maxSpan || 6;
  for (let i = c + 1; i <= c + span; i++) {
    const v = cellAt(grid, r, i);
    if (v) return v;
  }
  return '';
}

function labelValue(grid, label) {
  const hit = findLabel(grid, label);
  return hit ? valueRight(grid, hit.r, hit.c) : '';
}

const asNum = v => {
  const text = String(v)
    .replace(/[\s\u00a0]/g, '')                                  // välilyönnit, myös sitova
    .replace(/[\u2212\u2013\u2014\u2010\u2011\uff0d]/g, '-')       // typografinen miinus ja ajatusviivat
    .replace(',', '.')
    .replace(/[^\d.\-]/g, '');
  const n = parseFloat(text);
  return Number.isFinite(n) ? n : 0;
};
const hasNum = v => String(v).trim() !== '' && /\d/.test(String(v));

/** Lomakkeen taitonimet ovat kirjanpitomuotoisia ("Lista 6 - Sound Control (50)").
    Näytölle riisutaan järjestysnumerot ja luokittelevat etuliitteet pois; alkuperäinen
    nimi säilyy kentässä name ja näkyy taidon tiedoissa. */
function skillDisplayName(name) {
  let m;
  if ((m = name.match(/^Lista\s*\d+\s*-\s*(.+?)\s*(?:\(\d+\))?\s*$/i))) return m[1];
  if ((m = name.match(/^Ase\s*\d+\s*-\s*(.+)$/i))) return m[1].trim();
  if ((m = name.match(/^Kieli\s*\d+\s*-\s*(suullinen|kirjallinen)\s+(.+)$/i))) {
    return m[2].trim() + ' — ' + (/kirjallinen/i.test(m[1]) ? 'kirjoitus' : 'puhe');
  }
  return name;
}

/** Lomakkeen taitonimet ovat kirjanpitomuotoisia ("Lista 6 - Sound Control (50)").
    Näytölle riisutaan järjestysnumerot ja luokittelevat etuliitteet pois; alkuperäinen
    nimi säilyy kentässä name ja näkyy taidon tiedoissa. */
function skillDisplayName(name) {
  let m;
  if ((m = name.match(/^Lista\s*\d+\s*-\s*(.+?)\s*(?:\(\d+\))?\s*$/i))) return m[1];
  if ((m = name.match(/^Ase\s*\d+\s*-\s*(.+)$/i))) return m[1].trim();
  if ((m = name.match(/^Kieli\s*\d+\s*-\s*(suullinen|kirjallinen)\s+(.+)$/i))) {
    return m[2].trim() + ' — ' + (/kirjallinen/i.test(m[1]) ? 'kirjoitus' : 'puhe');
  }
  return name;
}

function slug(s) {
  return norm(s).replace(/[^a-z0-9åäö]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

/* ================= Hahmolomakkeen jäsennys ================= */

function parseCharacterSheet(g, sg) {
  const skillData = parseSkillsGrid(sg);
  const spellListNames = skillData.spellLists.map(l => l.name);

  const stats = parseStats(g);
  const statBonus = code => {
    const s = stats.find(x => norm(x.code) === norm(code));
    return s ? s.bonus : 0;
  };

  const armor = parseArmor(g);
  const spells = parseSpellLists(g, spellListNames);

  // Loitsulistan bonus tulee Magia-taidoista ("Lista 6 - Sound Control (50)")
  const listsWithSpells = skillData.spellLists.map(l => Object.assign({}, l, {
    spellCount: spells.filter(sp => norm(sp.list) === norm(l.name)).length,
    knownCount: spells.filter(sp => norm(sp.list) === norm(l.name) && sp.known).length
  }));

  return {
    meta: {
      name: labelValue(g, 'Character Name') || 'Hahmo',
      profession: labelValue(g, 'Profession'),
      culture: labelValue(g, 'Place of Origin'),
      race: '',
      sex: labelValue(g, 'Sex'),
      height: labelValue(g, 'Height'),
      weight: labelValue(g, 'Weight'),
      level: asNum(labelValue(g, 'Level')),
      exp: asNum(labelValue(g, 'Experience')),
      player: '',
      realm: '',
      age: '',
      hair: '',
      eyes: '',
      bio: '',
      notes: parseMisc(g)
    },

    vitals: {
      hitsMax: asNum(labelValue(g, 'Base hits')),
      ppMax: parseMagicPoints(g)
    },

    stats: stats,
    guilds: parseGuilds(g),
    languages: parseLanguages(g),

    skills: skillData.skills,
    spellLists: listsWithSpells,
    spells: spells,

    weapons: buildWeapons(g, skillData.skills),
    defense: buildDefense(armor, statBonus('N')),
    armor: armor,

    // Näitä ei ole lomakkeessa — hoidetaan appissa kertyvänä datana.
    resists: [],
    inventory: [],
    money: {}
  };
}

/* ---------- STATS ---------- */

function parseStats(g) {
  const head = findLabel(g, 'STATS');
  if (!head) return [];
  const sub = head.r + 1;
  const cAbbr = findInRow(g, head.r, 'Abbr.');
  const cTemp = findInRow(g, head.r, 'Temp.');
  const cPot = findInRow(g, head.r, 'Pot.');
  const cNormal = findInRow(g, sub, 'Normal');
  const cExtra = findInRow(g, sub, 'Extra');
  const cTotal = findInRow(g, sub, 'Total');

  const out = [];
  for (let r = sub + 1; r < g.length; r++) {
    const name = cellAt(g, r, head.c);
    if (!name) break;
    const code = cellAt(g, r, cAbbr);
    if (!code) continue;
    out.push({
      code: code,
      name: statNameFi(name, code),
      english: name,
      temp: asNum(cellAt(g, r, cTemp)),
      pot: asNum(cellAt(g, r, cPot)),
      bonusNormal: asNum(cellAt(g, r, cNormal)),
      bonusExtra: asNum(cellAt(g, r, cExtra)),
      bonus: asNum(cellAt(g, r, cTotal))
    });
  }
  return out;
}

/** Lomakkeen ominaisuusnimet ovat englanniksi, lyhenteet suomeksi. */
function statNameFi(english, code) {
  const map = {
    'constitution': 'Terveys', 'agility': 'Ketteryys', 'self-discipline': 'Itsekuri',
    'memory': 'Muisti', 'reasoning': 'Päättely', 'strength': 'Voima',
    'quickness': 'Nopeus', 'presence': 'Olemus', 'intuition': 'Vaisto',
    'empathy': 'Empatia', 'appearance': 'Ulkonäkö'
  };
  return map[norm(english)] || english || code;
}

/** Magic pts. -lohkon "Total"-sarakkeen ainoa luku. */
function parseMagicPoints(g) {
  const head = findLabel(g, 'Magic pts.');
  if (!head) return 0;
  const cTotal = findInRow(g, head.r + 1, 'Total', head.c);
  if (cTotal < 0) return 0;
  for (let r = head.r + 2; r < Math.min(g.length, head.r + 20); r++) {
    const v = cellAt(g, r, cTotal);
    if (hasNum(v)) return asNum(v);
  }
  return 0;
}

/* ---------- Killat ---------- */

function parseGuilds(g) {
  const head = findLabel(g, 'Killat');
  if (!head) return [];
  const out = [];
  for (let r = head.r + 1; r < g.length; r++) {
    const name = cellAt(g, r, head.c);
    if (!name) break;
    out.push({
      name: name,
      level: asNum(cellAt(g, r, head.c + 1)),
      rank: '', since: '', note: ''
    });
  }
  return out;
}

/* ---------- Kielet ---------- */

function parseLanguages(g) {
  const head = findLabel(g, 'Kielet');
  if (!head) return [];
  let cSpoken = findInRow(g, head.r, 'Spoken');
  const cWritten = findInRow(g, head.r, 'Written');
  if (cWritten < 0) return [];
  if (cSpoken < 0) cSpoken = cWritten - 1;

  const out = [];
  for (let r = head.r + 1; r < g.length; r++) {
    const name = cellAt(g, r, head.c);
    if (!name) break;
    const spokenRaw = cellAt(g, r, cSpoken);
    const writtenRaw = cellAt(g, r, cWritten);
    const note = valueRight(g, r, cWritten, 3);

    out.push({
      name: name,
      spoken: rankOf(spokenRaw),
      written: rankOf(writtenRaw),
      study: buildStudy(spokenRaw, writtenRaw, note)
    });
  }
  return out;
}

/** "6->7" tarkoittaa että taso 6 on saavutettu ja 7 on työn alla. */
function rankOf(raw) {
  const m = String(raw).match(/(-?\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Rakentaa opiskelutavoitteen lomakkeen merkinnästä.
    Esim. written "6->7" + huomio "14 pv -> 112 h opiskelua (kirj.)" */
function buildStudy(spokenRaw, writtenRaw, note) {
  const arrow = /->|→/;
  let track = null, raw = '';
  if (arrow.test(writtenRaw)) { track = 'written'; raw = writtenRaw; }
  else if (arrow.test(spokenRaw)) { track = 'spoken'; raw = spokenRaw; }
  if (!track && !note) return null;
  if (!track) track = /kirj/i.test(note) ? 'written' : 'spoken';

  const nums = String(raw).match(/(-?\d+)\s*(?:->|→)\s*(-?\d+)/);
  const hours = String(note).match(/(\d+)\s*h/i);

  return {
    track: track,
    from: nums ? parseInt(nums[1], 10) : null,
    to: nums ? parseInt(nums[2], 10) : null,
    hoursNeeded: hours ? parseInt(hours[1], 10) : 0,
    note: note || ''
  };
}

/* ---------- Panssari ja puolustus ---------- */

function parseArmor(g) {
  return {
    type: labelValue(g, 'Armor type'),
    db: asNum(labelValue(g, 'Defensive bonus')),
    shield: labelValue(g, 'Shield'),
    helm: labelValue(g, 'Helm'),
    armGreaves: labelValue(g, 'Arm greaves'),
    legGreaves: labelValue(g, 'Leg greaves')
  };
}

/** Lomake antaa DB:n yhtenä lukuna. Nopeusbonus on siitä se osa, joka tulee
    ominaisuudesta; loput on varusteiden osuus. Näin komponentit saa erikseen
    kytkettyä pois kesken taistelun. */
function buildDefense(armor, quBonus) {
  const out = [];
  if (quBonus) {
    out.push({ id: 'd-qu', name: 'Nopeusbonus (N)', value: quBonus,
               toggleable: false, on: true, note: 'Aina mukana' });
  }
  const gear = armor.db - quBonus;
  if (gear) {
    out.push({ id: 'd-armor', name: 'Haarniska ' + (armor.type || ''), value: gear,
               toggleable: true, on: true, note: 'Lomakkeen DB ' + armor.db + ' − nopeusbonus' });
  }
  [['d-shield', 'Kilpi', armor.shield], ['d-helm', 'Kypärä', armor.helm],
   ['d-arm', 'Käsisuojat', armor.armGreaves], ['d-leg', 'Jalkasuojat', armor.legGreaves]]
    .forEach(p => {
      if (hasNum(p[2])) {
        out.push({ id: p[0], name: p[1], value: asNum(p[2]), toggleable: true, on: true, note: '' });
      }
    });
  return out;
}

/* ---------- Aseet ---------- */

function buildWeapons(g, skills) {
  const table = findLabel(g, 'WEAPONS');
  const info = {};
  if (table) {
    const hr = table.r + 1;
    const cName = findInRow(g, hr, 'Weapon');
    const cBonus = findInRow(g, hr, 'Bonus');
    const cFumble = findInRow(g, hr, 'Fumble');
    const cRange = findInRow(g, hr, 'Range');
    const cSpecial = findInRow(g, hr, 'Special');
    for (let r = hr + 1; r < g.length; r++) {
      const name = cellAt(g, r, cName);
      if (!name) break;
      info[norm(name)] = {
        bonus: cellAt(g, r, cBonus),
        fumble: cellAt(g, r, cFumble),
        range: cellAt(g, r, cRange),
        special: cellAt(g, r, cSpecial)
      };
    }
  }

  const out = [];
  skills.forEach(sk => {
    const weaponMatch = sk.name.match(/^Ase\s*\d*\s*-\s*(.+)$/i);
    const unarmed = /^Aseeton taistelu\s*-\s*(.+)$/i.exec(sk.name);
    const directed = /^Suunnatut taiat$/i.test(sk.name);
    if (!weaponMatch && !unarmed && !directed) return;

    const name = weaponMatch ? weaponMatch[1] : (unarmed ? 'Aseeton — ' + unarmed[1] : 'Suunnatut taiat');
    const extra = info[norm(name)] || {};
    const parts = [];
    if (extra.bonus) parts.push('ase ' + extra.bonus);
    if (extra.fumble) parts.push('fumble ' + extra.fumble);
    if (extra.range) parts.push('kantama ' + extra.range);
    if (extra.special) parts.push(extra.special);
    if (directed) parts.push('ei parrya');

    out.push({
      id: 'w-' + slug(name),
      name: name,
      ob: sk.total,
      table: '',
      note: parts.join(' · '),
      canParry: !directed,
      blocks: []
    });
  });
  return out.sort((a, b) => b.ob - a.ob);
}

/* ---------- Loitsulistat ---------- */

/** SPELL LISTS -lohko on kaksi peräkkäistä palstaryhmää: osa listoista alkaa
    vasta lohkon puolivälissä. Listan otsikko tunnistetaan siitä, että solun
    teksti on jokin Magia-taidoista tunnettu listan nimi. Loitsun taso on
    rivin etäisyys otsikkorivistä. */
function parseSpellLists(g, listNames) {
  const head = findLabel(g, 'SPELL LISTS');
  if (!head) return [];
  const known = {};
  listNames.forEach(n => { known[norm(n)] = n; });

  const stop = findLabel(g, 'MISCELLANEOUS');
  const lastRow = stop ? stop.r : g.length;

  const active = {};   // sarake -> { name, headerRow }
  const spells = [];

  for (let r = head.r + 1; r < lastRow; r++) {
    const row = g[r] || [];
    for (let c = 0; c < row.length; c++) {
      const raw = cellAt(g, r, c);
      if (!raw) continue;
      if (/^-?[\d,.]+$/.test(raw)) continue;            // tasosarakkeiden numerot

      if (known[norm(raw)]) {                            // listan otsikko
        active[c] = { name: known[norm(raw)], headerRow: r };
        continue;
      }
      const list = active[c];
      if (!list) continue;                               // ei kuulu mihinkään listaan

      const paren = /^\((.*)\)$/.exec(raw);
      const name = paren ? paren[1].trim() : raw;
      const level = r - list.headerRow;

      spells.push({
        id: 'sp-' + slug(list.name) + '-' + level,
        name: name,
        list: list.name,
        level: level,
        pp: level,                                        // RM: kustannus = loitsun taso
        known: !paren,                                    // sulut = taso ei vielä hallussa
        range: '', duration: '', area: '', note: ''
      });
    }
  }
  return spells;
}

/* ---------- Muuta ---------- */

function parseMisc(g) {
  const head = findLabel(g, 'MISCELLANEOUS');
  if (!head) return [];
  const out = [];
  for (let r = head.r + 1; r < g.length; r++) {
    const label = cellAt(g, r, head.c);
    if (!label) continue;
    const value = valueRight(g, r, head.c, 3);
    if (value) out.push({ label: label, value: value });
  }
  return out;
}

/* ================= Taitovälilehden jäsennys ================= */

function parseSkillsGrid(g) {
  const head = findLabel(g, 'Skill/Capability');
  if (!head) return { skills: [], spellLists: [] };
  const sub = head.r + 1;

  const cTotal = findInRow(g, sub, 'Total');
  const cClasses = findInRow(g, head.r, 'Classes');
  const cRanks = findInRow(g, sub, 'Current');
  const cTarget = findInRow(g, sub, 'Target');
  const cRank = findInRow(g, sub, 'Rank');
  const cStat = findInRow(g, sub, 'Stat');
  const cLevel = findInRow(g, sub, 'Level');
  const cItem = findInRow(g, sub, 'Item');
  const cMisc = findInRow(g, sub, 'Misc.');

  const skills = [];
  const spellLists = [];
  let category = 'Muut';

  for (let r = sub + 1; r < g.length; r++) {
    const name = cellAt(g, r, head.c);
    if (!name || name.charAt(0) === '#') continue;

    // Kategoriarivillä on vain nimi. Lomakkeessa on yksittäisiä irrallisia
    // bonuslukuja kategoriariveilläkin, joten ne eivät kelpaa tunnisteeksi.
    const isSkill = [cTotal, cRanks, cClasses].some(c => cellAt(g, r, c) !== '');
    if (!isSkill) { category = name; continue; }

    const parts = [
      { label: 'Tasot', value: asNum(cellAt(g, r, cRank)) },
      { label: 'Ominaisuudet', value: asNum(cellAt(g, r, cStat)) },
      { label: 'Taso', value: asNum(cellAt(g, r, cLevel)) },
      { label: 'Esine', value: asNum(cellAt(g, r, cItem)) },
      { label: 'Muu', value: asNum(cellAt(g, r, cMisc)) }
    ];
    const totalRaw = cellAt(g, r, cTotal);
    const total = hasNum(totalRaw) ? asNum(totalRaw) : parts.reduce((s, p) => s + p.value, 0);

    // Yhdistelmätaito, esim. "Hiivi/piileskele" bonuksella "32/21": kaksi eri
    // heittoa saman rivin takana. Jaetaan omiksi taidoikseen, jotta kummankin
    // bonus on suoraan käytettävissä.
    const nameParts = name.split('/').map(x => x.trim()).filter(Boolean);
    const totalParts = totalRaw.split('/').map(x => x.trim()).filter(Boolean);
    const isCompound = nameParts.length > 1 && nameParts.length === totalParts.length;

    const ranks = asNum(cellAt(g, r, cRanks));
    const skill = {
      id: 'sk-' + slug(name),
      name: name,
      display: skillDisplayName(name),
      category: category,
      ranks: ranks,
      total: total,
      breakdown: parts.filter(p => p.value !== 0)
    };

    if (isCompound) {
      nameParts.forEach((part, i) => {
        const label = part.charAt(0).toUpperCase() + part.slice(1);
        const sub = asNum(totalParts[i]);
        skills.push({
          id: 'sk-' + slug(label),
          name: label,
          display: label,
          category: category,
          ranks: ranks,
          total: sub,
          // Erittely on rivillä yhteinen, joten se näytetään vain jos se täsmää.
          breakdown: parts.reduce((sum, p) => sum + p.value, 0) === sub
            ? parts.filter(p => p.value !== 0) : [],
          note: 'Lomakkeella: ' + name + ' ' + totalRaw
        });
      });
    } else {
      skills.push(skill);
    }

    // "Lista 6 - Sound Control (50)" -> loitsulista, jonka bonus on taidon bonus
    const lm = name.match(/^Lista\s*\d+\s*-\s*(.+?)\s*(?:\(\d+\))?\s*$/i);
    if (lm && lm[1]) {
      spellLists.push({
        id: 'sl-' + slug(lm[1]),
        name: lm[1],
        bonus: total,
        ranks: skill.ranks,
        skillId: skill.id
      });
    }
  }

  return { skills: skills, spellLists: spellLists };
}
