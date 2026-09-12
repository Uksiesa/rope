/* TAISTELU-näkymä: osumapisteet, kierrokset ja tilavaikutukset,
   OB-pooli hyökkäys/parry-jaolla, DB-komponentit ja heittolaskuri. */

const Battle = {

  justFreed: false,   // näytetään "voit toimia taas" seuraavaan toimintoon asti
  lastCast: null,     // viimeisin loitsinta tällä kierroksella
  chain: [],          // avoimen heiton osaheitot, viimeisin on syöttökentässä

  init() {
    $('#weaponSelect').addEventListener('change', e => {
      Store.update(s => { s.weaponId = e.target.value; });
    });

    $('#splitSlider').addEventListener('input', e => {
      Store.update(s => { s.splitPct = parseInt(e.target.value, 10) || 0; });
    });

    $('#splitQuick').addEventListener('click', e => {
      const b = e.target.closest('button[data-split]');
      if (!b) return;
      haptic();
      Store.update(s => { s.splitPct = parseInt(b.dataset.split, 10); });
    });

    $('#view-battle').addEventListener('click', e => {
      const b = e.target.closest('button[data-hp]');
      if (!b) return;
      haptic();
      const max = Store.character.vitals.hitsMax;
      Store.update(s => {
        s.hpCur = b.dataset.hp === 'full' ? max : clamp(s.hpCur + parseInt(b.dataset.hp, 10), 0, max);
      });
    });

    $('#dbComponents').addEventListener('change', e => {
      const cb = e.target.closest('input[type=checkbox]');
      if (!cb) return;
      haptic();
      Store.update(s => {
        const id = cb.dataset.id;
        const i = s.defenseOff.indexOf(id);
        if (cb.checked) { if (i >= 0) s.defenseOff.splice(i, 1); }
        else if (i < 0) s.defenseOff.push(id);
      });
    });

    /* --- Kierrokset --- */
    $('#btnNextRound').addEventListener('click', () => this.nextRound());
    $('#btnPrevRound').addEventListener('click', () => {
      haptic();
      this.justFreed = false;
      Store.update(s => {
        s.round = Math.max(1, s.round - 1);
        s.effects.forEach(x => { if (x.type === 'stun') x.rounds += 1; });
      });
      toast('Kierros peruttu. Osumapisteitä ei palautettu automaattisesti.');
    });
    $('#btnResetRounds').addEventListener('click', () => {
      haptic();
      this.justFreed = false;
      Store.update(s => { s.round = 1; s.effects = []; });
      toast('Uusi taistelu — kierros 1, vaikutukset poistettu.');
    });

    /* --- Vaikutusten lisäys --- */
    $('.effect-add').addEventListener('click', e => {
      const b = e.target.closest('button[data-add]');
      if (!b) return;
      haptic();
      if (b.dataset.add === 'stun') {
        const rounds = Math.max(1, numOf($('#stunRounds'), 1));
        this.addEffect({ type: 'stun', name: 'Tainnutus', rounds: rounds });
      } else {
        const per = Math.max(1, numOf($('#bleedAmount'), 1));
        this.addEffect({ type: 'bleed', name: 'Verenvuoto', perRound: per });
      }
    });

    $('#effectPresets').addEventListener('click', e => {
      const b = e.target.closest('button[data-preset]');
      if (!b) return;
      haptic();
      const p = CONFIG.combat.effectPresets[parseInt(b.dataset.preset, 10)];
      this.addEffect(Object.assign({}, p));
    });

    $('#effectList').addEventListener('click', e => {
      const b = e.target.closest('button[data-effect]');
      if (!b) return;
      haptic();
      const id = b.dataset.effect, act = b.dataset.act;
      Store.update(s => {
        const i = s.effects.findIndex(x => x.id === id);
        if (i < 0) return;
        if (act === 'remove') s.effects.splice(i, 1);
        else if (act === 'plus') {
          if (s.effects[i].type === 'stun') s.effects[i].rounds += 1;
          else s.effects[i].perRound += 1;
        } else if (act === 'minus') {
          if (s.effects[i].type === 'stun') s.effects[i].rounds = Math.max(1, s.effects[i].rounds - 1);
          else s.effects[i].perRound = Math.max(1, s.effects[i].perRound - 1);
        }
      });
    });

    ['#battleRoll', '#battleMod'].forEach(sel => $(sel).addEventListener('input', () => this.renderRoll()));
    $('#rollTarget').addEventListener('change', () => this.renderRoll());
    $('#btnCastAttack').addEventListener('click', () => this.castAttack());

    $('#battleChain').addEventListener('click', e => {
      if (!e.target.closest('button[data-addroll]')) return;
      const v = numOf($('#battleRoll'), null);
      if (!Number.isFinite(v)) return;
      haptic();
      this.chain.push(v);
      $('#battleRoll').value = '';
      this.renderRoll();
      $('#battleRoll').focus();
    });

    $('#battleClear').addEventListener('click', () => {
      this.chain = [];
      $('#battleRoll').value = '';
      $('#battleMod').value = '';
      this.renderRoll();
      $('#battleRoll').focus();
    });
  },

  /** Loitsuhyökkäys: voimapisteet veloitetaan samasta poolista kuin Taika-
      näkymässä, ja loitsinta kirjataan näkyviin. Hyökkäysheitto tehdään
      normaalisti, koska suunnattu taika ratkaistaan d100-heitolla. */
  castAttack() {
    const st = this.state();
    if (!st.isSpell) return;
    const sp = st.weapon.spell;
    const s = Store.session;
    if (s.ppCur < sp.pp) { toast('Voimapisteet eivät riitä.'); return; }

    haptic();
    Store.update(x => {
      x.ppCur = clamp(x.ppCur - sp.pp, 0, Store.character.vitals.ppMax);
    });
    this.lastCast = 'Loitsittu kierroksella ' + s.round + ' · −' + sp.pp + ' pp · jäljellä ' + s.ppCur;
    this.render();
    toast(sp.name + ' loitsittu — ' + sp.pp + ' pp, jäljellä ' + s.ppCur + '.');
  },

  /* ---------------- Tilavaikutukset ---------------- */

  addEffect(spec) {
    const eff = {
      id: 'e' + Date.now() + Math.floor(Math.random() * 1000),
      type: spec.type,
      name: spec.name || (spec.type === 'stun' ? 'Tainnutus' : 'Verenvuoto'),
      rounds: spec.type === 'stun' ? Math.max(1, spec.rounds || 1) : null,
      perRound: spec.type === 'bleed' ? Math.max(1, spec.perRound || 1) : 0
    };
    this.justFreed = false;
    Store.update(s => { s.effects.push(eff); });
    toast(eff.type === 'stun'
      ? eff.name + ': ' + eff.rounds + ' kierrosta'
      : eff.name + ': −' + eff.perRound + ' hp/kierros');
  },

  /** Kierroksen päätös: verenvuoto vähentää hp:n, tainnutus tikittää alas. */
  nextRound() {
    haptic();
    const max = Store.character.vitals.hitsMax;
    let bleed = 0;
    const freed = [];

    Store.update(s => {
      bleed = s.effects.filter(x => x.type === 'bleed').reduce((sum, x) => sum + x.perRound, 0);
      if (bleed) s.hpCur = clamp(s.hpCur - bleed, 0, max);

      s.effects.forEach(x => {
        if (x.type !== 'stun') return;
        x.rounds -= 1;
        if (x.rounds <= 0) freed.push(x.name);
      });
      s.effects = s.effects.filter(x => x.type !== 'stun' || x.rounds > 0);
      s.round += 1;
    });
    this.lastCast = null;

    this.justFreed = freed.length > 0;
    this.render();

    const parts = [];
    if (bleed) parts.push('verenvuoto −' + bleed + ' hp');
    if (freed.length) parts.push(freed.join(', ') + ' päättyi — voit toimia');
    toast('Kierros ' + Store.session.round + (parts.length ? ': ' + parts.join(', ') : ''));
  },

  /* ---------------- Laskenta ---------------- */

  /** Aseet ja loitsuhyökkäykset samassa valikossa. Loitsun OB tulee
      Suunnatut taiat -taidosta, koska se on sen hyökkäysbonus. */
  attackOptions() {
    const c = Store.character;
    const directed = (c.weapons || []).find(w => w.kind === 'directed');
    const spells = Rules.attackSpells(c).map(a => ({
      id: a.id,
      name: a.name,
      ob: directed ? directed.ob : 0,
      note: [a.list, a.pp + ' pp', a.note].filter(Boolean).join(' · '),
      fumble: null,
      kind: 'spell',
      canParry: false,
      blocks: [],
      spell: a
    }));
    return (c.weapons || []).concat(spells);
  },

  state() {
    const c = Store.character, s = Store.session;
    const options = this.attackOptions();
    const weapon = options.find(w => w.id === s.weaponId) || options[0] ||
                   { ob: 0, name: '—', blocks: [] };
    const canParry = weapon.canParry !== false;
    const blocked = weapon.blocks || [];

    const pool = weapon.ob;
    const pct = canParry ? clamp(s.splitPct, 0, 100) : 0;
    const parry = Math.round(pool * pct / 100);
    const attack = pool - parry;

    // Aktiivisten loitsujen puolustusvaikutukset tulevat mukaan komponentteina,
    // jolloin ne voi kytkeä pois kuten kilven tai panssarin.
    const all = c.defense.concat(Rules.activeDbComponents(c, s.activeSpells));
    const components = all.map(d => {
      const isBlocked = blocked.includes(d.id);
      const off = s.defenseOff.includes(d.id);
      return Object.assign({}, d, {
        blocked: isBlocked,
        active: !isBlocked && (!d.toggleable || !off)
      });
    });
    const dbBase = components.filter(x => x.active).reduce((sum, x) => sum + x.value, 0);

    const stuns = s.effects.filter(x => x.type === 'stun');
    const bleeds = s.effects.filter(x => x.type === 'bleed');

    return {
      options, weapon, canParry, pool, pct, parry, attack, components,
      isSpell: weapon.kind === 'spell',
      fumble: Rules.fumbleFor(weapon),
      dbBase, dbTotal: dbBase + parry,
      stuns, bleeds,
      stunRounds: stuns.reduce((mx, x) => Math.max(mx, x.rounds), 0),
      bleedPerRound: bleeds.reduce((sum, x) => sum + x.perRound, 0)
    };
  },

  /* ---------------- Piirto ---------------- */

  render() {
    const c = Store.character, s = Store.session;
    const st = this.state();

    /* --- Tilabanneri --- */
    const banner = $('#statusBanner');
    if (st.stunRounds > 0) {
      banner.className = 'status-banner stunned';
      banner.innerHTML = '<b>' + (st.stuns[0].name || 'Tainnutettu').toUpperCase() + '</b>' +
        '<span>' + st.stunRounds + ' kierrosta jäljellä — et voi toimia</span>';
    } else if (this.justFreed) {
      banner.className = 'status-banner freed';
      banner.innerHTML = '<b>VOIT TOIMIA TAAS</b><span>Tainnutus päättyi</span>';
    } else if (st.bleedPerRound > 0) {
      banner.className = 'status-banner bleeding';
      banner.innerHTML = '<b>VERENVUOTO</b><span>−' + st.bleedPerRound + ' hp jokaisen kierroksen lopussa</span>';
    } else {
      banner.className = 'status-banner hidden';
      banner.innerHTML = '';
    }

    /* --- Osumapisteet --- */
    const max = c.vitals.hitsMax, cur = clamp(s.hpCur, 0, max);
    const ratio = max ? cur / max : 0;
    $('#hpCur').textContent = cur;
    $('#hpMax').textContent = max;
    const fill = $('#hpFill');
    fill.style.width = (ratio * 100) + '%';
    fill.className = 'hp-fill' + (ratio <= CONFIG.combat.hpDanger ? ' danger' : ratio <= CONFIG.combat.hpWarn ? ' warn' : '');
    $('#hpPenalty').textContent =
      cur <= 0 ? 'Tajuton — osumapisteet lopussa.' :
      st.bleedPerRound && cur / st.bleedPerRound <= 5 ? 'Verenvuoto tappaa ' + Math.ceil(cur / st.bleedPerRound) + ' kierroksessa.' :
      ratio <= CONFIG.combat.hpDanger ? 'Vakavasti haavoittunut (' + Math.round(ratio * 100) + ' %).' :
      ratio <= CONFIG.combat.hpWarn ? 'Haavoittunut (' + Math.round(ratio * 100) + ' %).' :
      'Taistelukunnossa.';

    /* --- Kierros ja vaikutukset --- */
    $('#roundNum').textContent = s.round;

    const el2 = $('#effectList');
    el2.innerHTML = '';
    if (!s.effects.length) {
      el2.appendChild(el('li', { class: 'empty', text: 'Ei aktiivisia vaikutuksia.' }));
    } else {
      s.effects.forEach(x => {
        el2.appendChild(el('li', { class: 'effect ' + x.type }, [
          el('span', { class: 'eff-dot' }),
          el('div', { class: 'eff-main' }, [
            el('span', { class: 'eff-name', text: x.name }),
            el('span', { class: 'eff-meta', text: x.type === 'stun'
              ? x.rounds + ' kierrosta jäljellä'
              : '−' + x.perRound + ' hp / kierros, kunnes poistetaan' })
          ]),
          el('button', { class: 'coin-btn', 'data-effect': x.id, 'data-act': 'minus', text: '−' }),
          el('button', { class: 'coin-btn', 'data-effect': x.id, 'data-act': 'plus', text: '+' }),
          el('button', { class: 'coin-btn remove', 'data-effect': x.id, 'data-act': 'remove', text: '✕' })
        ]));
      });
    }

    const presets = $('#effectPresets');
    if (!presets.children.length) {
      CONFIG.combat.effectPresets.forEach((p, i) => {
        presets.appendChild(el('button', {
          class: 'chip', 'data-preset': String(i),
          text: p.name + (p.type === 'stun' ? ' ' + p.rounds + ' kr' : ' −' + p.perRound + '/kr')
        }));
      });
    }

    /* --- Ase --- */
    const sel = $('#weaponSelect');
    const stamp = st.options.map(w => w.id + w.ob).join('|');
    if (sel.dataset.filled !== stamp) {
      sel.innerHTML = '';
      st.options.forEach(w => sel.appendChild(el('option', {
        value: w.id,
        text: w.name + ' · OB ' + w.ob + (w.kind === 'spell' ? ' · loitsu' : '')
      })));
      sel.dataset.filled = stamp;
    }
    sel.value = st.weapon.id;

    /* --- Loitsuhyökkäys --- */
    const castRow = $('#spellCastRow');
    castRow.classList.toggle('hidden', !st.isSpell);
    if (st.isSpell) {
      const pp = st.weapon.spell.pp;
      $('#spellCastName').textContent = st.weapon.name;
      $('#spellCastSub').textContent = this.lastCast || (st.weapon.note + ' · voimapisteitä ' + s.ppCur);
      const btn = $('#btnCastAttack');
      btn.disabled = s.ppCur < pp;
      btn.textContent = s.ppCur < pp ? 'Ei tarpeeksi voimapisteitä' : 'Loitsi (−' + pp + ' pp)';
    }

    /* --- Jako --- */
    $('#poolTotal').textContent = st.pool;
    $('#atkValue').textContent = st.attack;
    $('#parryValue').textContent = st.parry;
    const slider = $('#splitSlider');
    slider.value = st.pct;
    slider.step = CONFIG.combat.splitStep;
    slider.disabled = !st.canParry;
    slider.style.setProperty('--pct', st.pct + '%');
    $('#splitQuick').classList.toggle('disabled', !st.canParry);
    $$('#splitQuick button').forEach(b => {
      b.disabled = !st.canParry;
      b.classList.toggle('active', parseInt(b.dataset.split, 10) === st.pct);
    });
    $('.slider-ticks').firstElementChild.textContent =
      st.canParry ? 'kaikki hyökkäykseen' : 'tällä aseella ei parryä';

    /* --- DB-komponentit --- */
    const list = $('#dbComponents');
    list.innerHTML = '';
    st.components.forEach(d => {
      const id = 'db-' + d.id;
      list.appendChild(el('li', { class: 'comp' + (d.active ? '' : ' off') + (d.blocked ? ' blocked' : '') }, [
        el('label', { for: id, class: 'comp-main' }, [
          el('span', { class: 'comp-name', text: d.name }),
          el('span', { class: 'comp-note', text: d.blocked ? 'ei käytössä tällä aseella' : (d.note || '') })
        ]),
        el('span', { class: 'comp-val', text: signed(d.value) }),
        d.toggleable && !d.blocked
          ? el('input', { type: 'checkbox', id: id, class: 'switch', 'data-id': d.id, checked: d.active ? '' : null })
          : el('span', { class: 'comp-lock', text: d.blocked ? '✕' : '🔒' })
      ]));
    });

    $('#dbBase').textContent = signed(st.dbBase);
    $('#dbParry').textContent = signed(st.parry);
    $('#dbTotal').textContent = signed(st.dbTotal);

    this.renderRoll();
  },

  renderRoll() {
    const st = this.state();
    const target = $('#rollTarget').value;
    const base = target === 'attack' ? st.attack : st.dbTotal;
    const baseLabel = target === 'attack' ? 'hyökkäys' : 'DB';

    const pending = numOf($('#battleRoll'), null);
    const rolls = this.chain.concat(Number.isFinite(pending) ? [pending] : []);
    const mod = numOf($('#battleMod'), 0);
    const out = $('#battleTotal').querySelector('b');
    const formula = $('#battleFormula');

    renderRollChain($('#battleChain'), this.chain, pending);

    if (!rolls.length) {
      out.textContent = '—';
      formula.textContent = baseLabel + ' ' + signed(base) + ' — syötä heitto';
      $('#fumbleWarn').classList.add('hidden');
      return;
    }
    const roll = rollChainTotal(rolls);
    out.textContent = fmtNum(roll + base + mod);
    formula.textContent =
      (rolls.length > 1 ? rollChainText(rolls) + ' = ' + fmtNum(roll) : fmtNum(roll)) +
      ' (heitto) ' + signed(base) + ' (' + baseLabel + ')' +
      (mod ? ' ' + signed(mod) + ' (modi)' : '');

    // Fumble katsotaan ensimmäisestä, muokkaamattomasta heitosta.
    const warn = $('#fumbleWarn');
    const isFumble = target === 'attack' && st.fumble > 0 && rolls[0] <= st.fumble;
    warn.classList.toggle('hidden', !isFumble);
    if (isFumble) {
      warn.textContent = 'FUMBLE — ' + st.weapon.name + ', raja ' + st.fumble +
        (st.weapon.fumble ? '' : ' (oletus, ei lomakkeessa)');
    }
  }
};
