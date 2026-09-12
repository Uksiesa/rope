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
