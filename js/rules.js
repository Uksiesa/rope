/* Bonuslaskenta.

   Periaate: Sheet sisältää vain raakasyötteet — ominaisuusarvot, taitojen tasot,
   kiltatasot sekä esine- ja erikoisbonukset. Kaikki johdetut luvut lasketaan tässä.

   Taulukot (ominaisuusbonus, kehityspisteet, voimapisteet, ammatin tasokertoimet,
   kiltabonukset) tulevat Sheetin Rules-välilehdeltä. Jos välilehteä ei ole, käytetään
   CONFIG.rules-oletuksia; jos niistäkään ei löydy arvoa, käytetään lomakkeen omaa
   laskettua lukua. Näin appi ei mene rikki kesken siirtymän.

   Lomakkeen valmiiksi lasketut sarakkeet säilyvät vertailua varten: compare()
   kertoo mitkä luvut poikkeavat, jolloin kaavavirheen huomaa heti. */

const Rules = {

  tables: null,

  /** Ottaa käyttöön taulukot (Sheetin Rules-välilehti tai CONFIG.rules). */
  use(tables) {
    const base = JSON.parse(JSON.stringify(CONFIG.rules || {}));
    this.tables = Object.assign(base, tables || {});
    return this.tables;
  },

  t() { return this.tables || this.use(null); },

  /* ---------------- Taulukkohaut ---------------- */

  /** Väliperustainen haku: [{ from, to, value }]. Palauttaa null jos ei osu. */
  lookup(table, score) {
    if (!Array.isArray(table)) return null;
    for (let i = 0; i < table.length; i++) {
      const row = table[i];
      if (score >= row.from && score <= row.to) return row.value;
    }
    return null;
  },

  statBonusFor(score) { return this.lookup(this.t().statBonus, score); },
  devPointsFor(score) { return this.lookup(this.t().devPoints, score); },
  ppPerLevelFor(score) { return this.lookup(this.t().powerPoints, score); },

  /** Osumapisteiden tasokerroin. Riippuu ammatista ja voi vaihdella tason mukaan. */
  hitsPerLevelFor(level) { return this.lookup(this.t().hitsPerLevel, level); },

  /** Ammatin tasokerroin taitokategorialle. */
  levelMultiplier(category) {
    const map = this.t().levelBonus || {};
    const hit = Object.keys(map).find(k => norm(k) === norm(category));
    return hit ? map[hit] : 0;
  },

  /* ---------------- Perusvakiot ---------------- */

  /** Tasojen tuottama bonus. 0 tasoa on rangaistus, sitten laskeva tuotto. */
  rankBonus(ranks) {
    const steps = this.t().rankProgression || [];
    if (ranks <= 0) return this.t().noRankPenalty;
    let left = ranks, sum = 0;
    for (let i = 0; i < steps.length && left > 0; i++) {
      const take = Math.min(left, steps[i].ranks);
      sum += take * steps[i].perRank;
      left -= take;
    }
    if (left > 0 && steps.length) sum += left * steps[steps.length - 1].perRank;
    return sum;
  },

  /** Taidon ominaisuusbonus: Classes-sarakkeen ominaisuuksien keskiarvo,
      puolikkaat ylöspäin. Esim. "Va/Va/P" = (26+26+20)/3 = 24. */
  statAverage(classes, bonusByCode) {
    const codes = String(classes || '').split('/')
      .map(c => c.trim())
      .filter(c => c && bonusByCode[c] !== undefined);
    if (!codes.length) return null;
    const sum = codes.reduce((s, c) => s + bonusByCode[c], 0);
    return Math.floor(sum / codes.length + 0.5);
  },

  /* ---------------- Kiltojen tasoedut ---------------- */

  /** Onko hahmo kyseisessä killassa vähintään säännön vaatimalla tasolla?
      Säännön kiltanimi on vartalo ("Viihdyttäjä"), lomakkeen nimi taivutettu
      ("Viihdyttäjät"), joten vertailu tehdään alkuosalla. */
  guildQualifies(guilds, rule) {
    const stem = norm(rule.guildStem);
    if (!stem) return false;
    return (guilds || []).some(g => {
      const name = norm(g.name);
      return (name.indexOf(stem) === 0 || stem.indexOf(name.slice(0, 6)) === 0) &&
             g.level >= rule.level;
    });
  },

  /** Kiltaetujen tuottama bonus yhdelle taidolle.
      perLevel = true -> tasoon sidottu etu, jonka appi laskee (menee Level-osuuteen).
      perLevel = false -> kiinteä etu, joka kirjataan lomakkeen Misc-soluun käsin;
      sitä ei lasketa tässä vaan se palautetaan odotusarvona ristiriitatarkistukseen. */
  guildSkillBonus(character, skill, level, perLevelOnly) {
    const rules = (character.guildRules || []).filter(r => r.kind === 'skill');
    let sum = 0;
    rules.forEach(r => {
      if (perLevelOnly !== undefined && r.perLevel !== perLevelOnly) return;
      if (!this.guildQualifies(character.guilds, r)) return;
      if (!this.skillMatches(skill, r.target)) return;
      sum += r.perLevel ? r.amount * level : r.amount;
    });
    return sum;
  },

  /** Lomakkeen Classes-solu ei aina kerro oikeaa ominaisuutta, jolloin taidolle
      on annettu ohitus configissa tai Rules-välilehdellä. */
  classesFor(skill) {
    const map = this.t().classesOverride || {};
    const hit = Object.keys(map).find(k => norm(k) === norm(skill.name) ||
                                           norm(k) === norm(skill.display || ''));
    return hit ? map[hit] : skill.classes;
  },

  /** Säännön taitonimi voi olla eri kirjoitusasussa kuin lomakkeen
      ("havainnointi" vs "Havannointi"), joten sumea vertailu on tarpeen. */
  skillMatches(skill, target) {
    const t = norm(target);
    if (!t) return false;
    if (norm(skill.name) === t || norm(skill.display || '') === t) return true;
    return Math.max(similarity(target, skill.name),
                    similarity(target, skill.display || skill.name)) >= 0.8;
  },
  /* ---------------- Loitsujen vaikutukset ----------------
     Vaikutukset luetaan Sheetin loitsuvälilehdeltä, joten uusi loitsu tai
     muuttunut bonus vaatii vain taulukkomuokkauksen. */

  spellBonusRows(character, spellName) {
    const want = norm(spellName);
    return (character.spellBonuses || []).filter(b => this.spellNameMatches(b.spell, spellName));
  },

  /** Loitsuvälilehden nimi voi olla hieman eri asussa kuin lomakkeen
      loitsulistassa ("Shock Bolt" vs "Shock Bolt I"), joten vertailu on sumea. */
  spellNameMatches(a, b) {
    const x = norm(a), y = norm(b);
    if (!x || !y) return false;
    if (x === y) return true;
    // roomalainen numero lopussa ei erota loitsua
    const strip = v => v.replace(/\s+(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/, '').trim();
    if (strip(x) === strip(y)) return true;
    return similarity(a, b) >= 0.85;
  },

  /** Onko loitsulla vaikutus, jota kannattaa seurata aktiivisena? */
  spellHasEffect(character, spellName) {
    return this.spellBonusRows(character, spellName).some(b => b.type !== 'attack');
  },

  /** Vaikutuksen kohde luettavana tekstinä. */
  scopeLabel(b) {
    const t = norm(b.target);
    const who = (!t || t === 'kaikki') ? 'kaikkia vastaan'
              : t.replace('+', ' ja ') + ' vastaan';
    return who + (b.scope === 'once' ? ' · yksi hyökkäys' : '');
  },

  /** Aktiivisten loitsujen puolustusvaikutukset DB-komponentteina.
      Myös "−25 hyökkääjän heittoon" on tässä positiivisena, koska lopputulos
      on sama kuin DB-lisä. */
  activeDbComponents(character, active) {
    const out = [];
    (active || []).forEach(a => {
      this.spellBonusRows(character, a.spell)
        .filter(b => b.type === 'db')
        .forEach(b => out.push({
          id: 'asp-' + a.id + '-' + b.id,
          name: a.spell + (b.note ? ' (' + b.note + ')' : ''),
          value: b.value,
          toggleable: true,
          on: b.defaultOn,
          note: this.scopeLabel(b),
          fromSpell: true
        }));
    });
    return out;
  },

  /** Aktiivisten loitsujen taitovaikutukset yhdelle taidolle. */
  activeSkillBonuses(character, active, skill) {
    const out = [];
    if (!skill) return out;
    (active || []).forEach(a => {
      this.spellBonusRows(character, a.spell)
        .filter(b => b.type === 'skill' && this.skillMatches(skill, b.target))
        .forEach(b => out.push({
          key: a.id + '|' + b.id,
          spell: a.spell,
          value: b.value,
          note: b.note,
          defaultOn: b.defaultOn
        }));
    });
    return out;
  },

  /** Loitsut jotka ovat valittavissa hyökkäystyypiksi Taistelu-näkymässä. */
  attackSpells(character) {
    return (character.spellBonuses || [])
      .filter(b => b.type === 'attack')
      .map(b => {
        const sp = (character.spells || []).find(s => this.spellNameMatches(s.name, b.spell));
        return {
          id: 'as-' + slug(b.spell),
          name: b.spell,
          list: sp ? sp.list : b.list,
          pp: sp ? sp.pp : 0,
          level: sp ? sp.level : null,
          known: sp ? sp.known : true,
          note: b.note
        };
      });
  },

  /** Onko ase kahden käden ase? Lomakkeen Special-sarake ensin, sitten configin lista. */
  isTwoHanded(weapon) {
    if (!weapon || weapon.kind === 'spell') return false;
    if (/kahden\s*käden|two[\s-]*hand/i.test(weapon.special || '')) return true;
    const list = this.t().twoHandedWeapons || [];
    return list.some(n => norm(n) === norm(weapon.name));
  },

  /** Loitsun todellinen hinta. Loitsuvälilehden Huomio voi sisältää ehdon
      "kahden käden aseella maksaa *2", joka kertoo hinnan kun kahden käden ase
      on käytössä (Taistelu-välilehdellä valittu ase). */
  spellCost(character, spell, weapon) {
    const base = spell ? spell.pp : 0;
    const out = { pp: base, base: base, multiplier: 1, reason: '' };
    if (!spell) return out;
    this.spellBonusRows(character, spell.name).forEach(b => {
      const m = String(b.note || '').match(/kahden\s*käden\s*aseella\s*maksaa\s*[*×x]\s*(\d+)/i);
      if (m && this.isTwoHanded(weapon)) {
        out.multiplier = Math.max(out.multiplier, parseInt(m[1], 10));
        out.reason = 'kahden käden ase: ' + weapon.name;
      }
    });
    out.pp = base * out.multiplier;
    return out;
  },

  /** Aseen fumble-arvo: lomakkeen WEAPONS-taulukko ensin, muuten configin oletus.
      Heitto <= tämä on fumble. */
  fumbleFor(weapon) {
    if (weapon && Number.isFinite(weapon.fumble) && weapon.fumble > 0) return weapon.fumble;
    return this.t().defaultFumble || 0;
  },

  /* ---------------- Koko hahmon laskenta ---------------- */

  /** Palauttaa uuden hahmo-objektin, jonka johdetut luvut on laskettu
      raakasyötteistä. Alkuperäiset lomakkeen luvut säilyvät sheet*-kentissä. */
  compute(character, overrides) {
    const c = JSON.parse(JSON.stringify(character));
    const ov = overrides || {};
    const level = ov.level || c.meta.level;
    c.meta.level = level;

    /* --- Ominaisuudet --- */
    const bonusByCode = {};
    c.stats = c.stats.map(st => {
      const o = (ov.stats && ov.stats[st.code]) || {};
      const temp = Number.isFinite(o.temp) ? o.temp : st.temp;
      const pot = Number.isFinite(o.pot) ? o.pot : st.pot;
      const fromTable = this.statBonusFor(temp);
      const normal = fromTable === null ? st.bonusNormal : fromTable;
      const extra = this.guildStatBonus(c.guilds, st.code, st.bonusExtra);
      const out = Object.assign({}, st, {
        temp: temp,
        pot: pot,
        sheetBonusNormal: st.bonusNormal,
        sheetBonus: st.bonus,
        bonusNormal: normal,
        bonusExtra: extra,
        bonus: normal + extra,
        computed: fromTable !== null
      });
      bonusByCode[out.code] = out.bonus;
      return out;
    });

    /* --- Taidot --- */
    c.skills = c.skills.map(sk => {
      // Yhdistelmätaidon puolikkailla on lomakkeessa eri bonus mutta yhteiset
      // raakasyötteet (yksi tasoruudukko ja yksi Classes-solu), joten niitä ei
      // voi laskea erikseen. Käytetään lomakkeen arvoa ja merkitään se.
      if (sk.compound) return Object.assign({}, sk, { computed: false });

      // Tasonnosto voi korottaa tasoja ennen kuin ne on kirjattu Sheetiin.
      const ranks = (ov.ranks && ov.ranks[sk.id] !== undefined) ? ov.ranks[sk.id] : sk.ranks;
      const rankB = this.rankBonus(ranks);
      const statB = this.statAverage(this.classesFor(sk), bonusByCode);
      // Tasoon sidottu kiltaetu kuuluu Level-osuuteen, koska se muuttuu joka
      // tasolla eikä sitä siksi kirjata käsin lomakkeeseen.
      const guildPerLevel = this.guildSkillBonus(c, sk, level, true);
      const levelB = this.levelMultiplier(sk.category) * level + guildPerLevel;
      const itemB = sk.itemBonus || 0;
      const miscB = sk.miscBonus || 0;
      // Kiltaedut eivät summaudu totaaliin: lomakkeen Misc-sarake on määräävä
      // ja Muuta-kentän säännöt vain selittävät sen. Ristiriidat raportoidaan.
      const classes = this.classesFor(sk);

      // Ilman Classes-saraketta ominaisuusosuutta ei voi laskea; pidetään
      // lomakkeen arvo, jotta taito ei näytä väärää bonusta.
      const sheetStat = (sk.breakdown.find(b => b.label === 'Ominaisuudet') || {}).value || 0;
      const usedStat = statB === null ? sheetStat : statB;

      const total = rankB + usedStat + levelB + itemB + miscB;
      return Object.assign({}, sk, {
        ranks: ranks,
        sheetRanks: sk.ranks,
        classes: classes,
        guildPerLevel: guildPerLevel,
        guildExpected: this.guildSkillBonus(c, sk, level, false),
        total: total,
        computed: statB !== null,
        breakdown: [
          { label: 'Tasot', value: rankB },
          { label: 'Ominaisuudet', value: usedStat },
          { label: 'Taso', value: levelB },
          { label: 'Esine', value: itemB },
          { label: 'Muu', value: miscB }
        ].filter(p => p.value !== 0)
      });
    });

    /* --- Loitsulistojen bonus seuraa taitoja --- */
    c.spellLists = (c.spellLists || []).map(l => {
      const sk = c.skills.find(s => s.id === l.skillId);
      return sk ? Object.assign({}, l, { bonus: sk.total, ranks: sk.ranks }) : l;
    });

    /* --- Aseiden OB seuraa taitoja --- */
    c.weapons = (c.weapons || []).map(w => {
      const sk = c.skills.find(s => s.id === w.skillId);
      return sk ? Object.assign({}, w, { ob: sk.total }) : w;
    });

    /* --- Puolustus: nopeusbonus + varusteet --- */
    const quCode = this.t().settings.quicknessStat;
    const qu = bonusByCode[quCode] || 0;
    c.defense = (c.defense || []).map(d => {
      if (d.id === 'd-qu') return Object.assign({}, d, { value: qu });
      return d;
    });

    /* --- Voimapisteet --- */
    const ppStats = this.t().settings.ppStats || [];
    const ppValues = ppStats
      .map(code => {
        const st = c.stats.find(x => x.code === code);
        return st ? this.ppPerLevelFor(st.temp) : null;
      })
      .filter(v => v !== null);
    if (ppValues.length === ppStats.length && ppStats.length) {
      const avg = ppValues.reduce((s, v) => s + v, 0) / ppValues.length;
      c.vitals = Object.assign({}, c.vitals, {
        sheetPpMax: c.vitals.ppMax,
        ppMax: Math.round(avg * level),
        ppComputed: true
      });
    }

    /* --- Osumapisteet: perusarvo + kestävyysbonus + taso × tasokerroin --- */
    const hitsMult = this.hitsPerLevelFor(level);
    if (hitsMult !== null) {
      const st = c.stats.find(x => x.code === this.t().settings.hitsStat);
      const base = this.t().settings.hitsBase || 0;
      c.vitals = Object.assign({}, c.vitals, {
        sheetHitsMax: c.vitals.hitsMax,
        hitsMax: base + (st ? st.bonus : 0) + level * hitsMult,
        hitsComputed: true
      });
    }

    /* --- Kehityspisteet --- */
    const dpStats = this.t().settings.dpStats || [];
    const dpValues = dpStats.map(code => {
      const st = c.stats.find(x => x.code === code);
      const v = st ? this.devPointsFor(st.temp) : null;
      return { code: code, value: v === null ? (st ? st.devPoints : 0) : v, computed: v !== null };
    });
    c.devPoints = {
      perStat: dpValues,
      total: Math.round(dpValues.reduce((s, d) => s + (d.value || 0), 0) * 10) / 10,
      complete: dpValues.every(d => d.computed)
    };

    return c;
  },

  /** Kiltatasojen tuottama ominaisuusbonus. Jos sääntöjä ei ole, käytetään
      lomakkeen Extra-saraketta sellaisenaan. */
  guildStatBonus(guilds, code, sheetExtra) {
    const rules = this.t().guildBonus;
    if (!Array.isArray(rules) || !rules.length) return sheetExtra || 0;
    return rules.reduce((sum, r) => {
      if (norm(r.stat) !== norm(code)) return sum;
      const g = (guilds || []).find(x => norm(x.name) === norm(r.guild));
      return (g && g.level >= r.level) ? sum + r.bonus : sum;
    }, 0);
  },

  /* ---------------- Tasonnosto ---------------- */

  /** Kokoaa Sheetin tasoruudukkoon merkityn suunnitelman.
      Numero ruudussa = tälle tasolle käytetyt kehityspisteet.
      X = maksettu aiemmin, taso odottaa opiskelua eikä nouse vielä. */
  levelUpPlan(character) {
    const buys = [], pending = [];
    let spent = 0;

    character.skills.forEach(sk => {
      if (!sk.grid || !sk.grid.planned.length) return;
      const paid = sk.grid.planned.filter(p => !p.paidEarlier);
      const waiting = sk.grid.planned.filter(p => p.paidEarlier);

      if (paid.length) {
        const dp = paid.reduce((s, p) => s + p.dp, 0);
        spent += dp;
        const newRanks = sk.ranks + paid.length;
        buys.push({
          id: sk.id,
          name: sk.display || sk.name,
          category: sk.category,
          cost: sk.cost,
          dp: dp,
          ranksNow: sk.ranks,
          ranksAfter: newRanks,
          bonusNow: sk.total,
          bonusAfter: sk.total - this.rankBonus(sk.ranks) + this.rankBonus(newRanks)
        });
      }
      waiting.forEach(p => pending.push({
        id: sk.id,
        name: sk.display || sk.name,
        rank: p.rank
      }));
    });

    const available = character.devPoints ? character.devPoints.total : 0;
    return {
      buys: buys.sort((a, b) => b.dp - a.dp),
      pending: pending,
      spent: Math.round(spent * 10) / 10,
      available: available,
      left: Math.round((available - spent) * 10) / 10
    };
  },

  /* ---------------- Vertailu lomakkeeseen ---------------- */

  /** Kertoo mitkä lasketut luvut poikkeavat lomakkeen omista. Tyhjä lista
      tarkoittaa että kaavat vastaavat lomaketta täsmälleen. */
  compare(computed) {
    const diffs = [];
    computed.stats.forEach(st => {
      if (st.bonusGiven && st.sheetBonus !== undefined && st.bonus !== st.sheetBonus) {
        diffs.push({ kind: 'Ominaisuus', name: st.name, laskettu: st.bonus, lomake: st.sheetBonus });
      }
    });
    // Loitsuvälilehden taitorivi, jonka kohde ei osu mihinkään taitoon, jäisi
    // muuten hiljaa vaikuttamatta. Nostetaan se esiin.
    (computed.spellBonuses || []).forEach(b => {
      if (b.type !== 'skill') return;
      const hit = computed.skills.some(sk => this.skillMatches(sk, b.target));
      if (!hit) {
        diffs.push({
          kind: 'Loitsu',
          name: b.spell,
          laskettu: 0,
          lomake: b.value,
          conflict: true,
          note: 'kohde "' + b.target + '" ei vastaa mitään taitoa — kirjoita nimi kuten Skills-välilehdellä'
        });
      }
    });

    const known = (this.t().sheetErrors || []).map(norm);
    computed.skills.forEach(sk => {
      const nm = sk.display || sk.name;

      // Muuta-kentän kiltasääntö on selitys: sen pitäisi vastata Misc-solua.
      if (sk.guildExpected && sk.guildExpected !== (sk.miscBonus || 0)) {
        diffs.push({
          kind: 'Kiltaetu',
          name: nm,
          laskettu: sk.miscBonus || 0,
          lomake: sk.guildExpected,
          conflict: true,
          note: 'Muuta-kenttä lupaa ' + signed(sk.guildExpected) +
                ', Misc-solussa on ' + signed(sk.miscBonus || 0) + ' — kirjaa se Misc-soluun'
        });
      }

      if (sk.sheetTotal !== undefined && sk.total !== sk.sheetTotal) {
        const isKnown = known.includes(norm(sk.name)) || known.includes(norm(nm));
        diffs.push({
          kind: 'Taito',
          name: nm,
          laskettu: sk.total,
          lomake: sk.sheetTotal,
          knownError: isKnown,
          note: isKnown ? 'lomakkeen luku tiedetään virheelliseksi' : ''
        });
      }
    });
    if (computed.vitals.sheetPpMax !== undefined && computed.vitals.ppMax !== computed.vitals.sheetPpMax) {
      diffs.push({ kind: 'Voimapisteet', name: 'PP', laskettu: computed.vitals.ppMax, lomake: computed.vitals.sheetPpMax });
    }
    if (computed.vitals.sheetHitsMax !== undefined && computed.vitals.hitsMax !== computed.vitals.sheetHitsMax) {
      diffs.push({ kind: 'Osumapisteet', name: 'Hits', laskettu: computed.vitals.hitsMax, lomake: computed.vitals.sheetHitsMax });
    }
    return diffs;
  }
};
