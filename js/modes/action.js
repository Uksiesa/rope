/* TEOT-näkymä: taidon bonus + käsin syötetty heitto = tulos.
   Lisänä selaimen puhetunnistus taidon hakemiseen (Safari/Chrome). */

const Action = {

  filter: { text: '', category: null },
  selectedId: null,
  chain: [],          // avoimen heiton osaheitot
  spellOff: {},       // heittokohtaisesti pois kytketyt loitsubonukset
  recognition: null,
  listening: false,

  init() {
    $('#skillSearch').addEventListener('input', e => {
      this.filter.text = e.target.value;
      this.renderList();
    });

    $('#catChips').addEventListener('click', e => {
      const b = e.target.closest('button[data-cat]');
      if (!b) return;
      haptic();
      const cat = b.dataset.cat;
      this.filter.category = (cat === '*' || this.filter.category === cat) ? null : cat;
      this.renderChips();
      this.renderList();
    });

    $('#skillList').addEventListener('click', e => {
      const li = e.target.closest('li[data-id]');
      if (!li) return;
      haptic();
      this.select(li.dataset.id);
    });

    ['#actionRoll', '#actionMod'].forEach(sel =>
      $(sel).addEventListener('input', () => this.renderTotal()));
    bindSignToggle($('#actionModSign'), $('#actionMod'), () => this.renderTotal());

    $('#spellChips').addEventListener('click', e => {
      const b = e.target.closest('button[data-spellkey]');
      if (!b) return;
      haptic();
      const k = b.dataset.spellkey;
      this.spellOff[k] = !this.spellOff[k];
      this.renderSelected();
    });

    $('#actionChain').addEventListener('click', e => {
      if (!e.target.closest('button[data-addroll]')) return;
      const v = numOf($('#actionRoll'), null);
      if (!Number.isFinite(v)) return;
      haptic();
      this.chain.push(v);
      $('#actionRoll').value = '';
      this.renderTotal();
      $('#actionRoll').focus();
    });

    $('#btnMic').addEventListener('click', () => this.toggleMic());
    this.setupSpeech();
  },

  skills() {
    return (Store.character && Store.character.skills) || [];
  },

  categories() {
    const seen = [];
    this.skills().forEach(s => { if (!seen.includes(s.category)) seen.push(s.category); });
    return seen;
  },

  matches() {
    const q = norm(this.filter.text);
    return this.skills().filter(s => {
      if (this.filter.category && s.category !== this.filter.category) return false;
      if (!q) return true;
      return norm(s.display || s.name).includes(q) ||
             norm(s.name).includes(q) ||
             norm(s.category).includes(q);
    });
  },

  select(id) {
    this.selectedId = id;
    Store.update(s => {
      s.recentSkills = [id].concat((s.recentSkills || []).filter(x => x !== id)).slice(0, 5);
    });
    this.chain = [];
    // Loitsubonusten oletustila tulee loitsuvälilehden Oletus-sarakkeesta,
    // ja pelaaja voi poiketa siitä yhtä heittoa varten.
    this.spellOff = {};
    const sk = this.skills().find(x => x.id === id);
    Rules.activeSkillBonuses(Store.character, Store.session.activeSpells, sk)
      .forEach(b => { if (!b.defaultOn) this.spellOff[b.key] = true; });
    $('#actionRoll').value = '';
    resetSign($('#actionModSign'), $('#actionMod'));
    this.renderSelected();
    $('#selectedCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => $('#actionRoll').focus({ preventScroll: true }), 250);
  },

  render() {
    this.renderChips();
    this.renderList();
    this.renderSelected();
  },

  renderChips() {
    const box = $('#catChips');
    box.innerHTML = '';
    box.appendChild(el('button', {
      'data-cat': '*',
      class: 'chip' + (this.filter.category ? '' : ' active'),
      text: 'Kaikki'
    }));
    this.categories().forEach(cat => {
      box.appendChild(el('button', {
        'data-cat': cat,
        class: 'chip' + (this.filter.category === cat ? ' active' : ''),
        text: cat
      }));
    });
  },

  renderList() {
    const ul = $('#skillList');
    ul.innerHTML = '';
    const recentIds = (Store.session.recentSkills || []);
    const hits = this.matches();

    const showRecent = !this.filter.text && !this.filter.category && recentIds.length;
    if (showRecent) {
      ul.appendChild(el('li', { class: 'list-sep', text: 'Viimeksi käytetyt' }));
      recentIds.forEach(id => {
        const s = this.skills().find(x => x.id === id);
        if (s) ul.appendChild(this.skillRow(s));
      });
      ul.appendChild(el('li', { class: 'list-sep', text: 'Kaikki taidot' }));
    }

    if (!hits.length) {
      ul.appendChild(el('li', { class: 'empty', text: 'Ei osumia.' }));
    } else {
      let lastCat = null;
      hits.forEach(s => {
        if (!this.filter.category && s.category !== lastCat) {
          ul.appendChild(el('li', { class: 'list-sep', text: s.category }));
          lastCat = s.category;
        }
        ul.appendChild(this.skillRow(s));
      });
    }
    $('#skillListTitle').textContent = 'Taidot (' + hits.length + ')';
  },

  skillRow(s) {
    return el('li', { class: 'skill-row' + (this.selectedId === s.id ? ' active' : ''), 'data-id': s.id }, [
      el('span', { class: 'skill-name', text: s.display || s.name }),
      el('span', { class: 'skill-ranks', text: s.ranks ? s.ranks + ' r' : '' }),
      el('b', { class: 'skill-bonus', text: signed(s.total) })
    ]);
  },

  renderSelected() {
    const card = $('#selectedCard');
    const s = this.skills().find(x => x.id === this.selectedId);
    if (!s) { card.classList.add('hidden'); return; }
    card.classList.remove('hidden');
    const shown = s.display || s.name;
    $('#selName').textContent = shown;
    $('#selCat').textContent = [
      s.category,
      s.ranks ? s.ranks + ' tasoa' : '',
      s.note || (shown !== s.name ? 'Lomakkeella: ' + s.name : '')
    ].filter(Boolean).join(' · ');
    $('#selBonus').textContent = signed(s.total);

    /* --- Aktiivisten loitsujen vaikutus tähän taitoon --- */
    const chips = $('#spellChips');
    const spellBonuses = Rules.activeSkillBonuses(Store.character, Store.session.activeSpells, s);
    chips.innerHTML = '';
    chips.classList.toggle('hidden', !spellBonuses.length);
    spellBonuses.forEach(b => {
      const on = !this.spellOff[b.key];
      chips.appendChild(el('button', {
        class: 'chip spell-chip' + (on ? ' active' : ''),
        'data-spellkey': b.key,
        text: (on ? '✓ ' : '') + b.spell + ' ' + signed(b.value) + (b.note ? ' · ' + b.note : '')
      }));
    });

    const bd = $('#selBreakdown');
    bd.innerHTML = '';
    (s.breakdown || []).forEach(b => {
      bd.appendChild(el('span', { class: 'bd-item' }, [
        el('span', { class: 'bd-label', text: b.label }),
        el('b', { text: signed(b.value) })
      ]));
    });
    this.renderTotal();
  },

  renderTotal() {
    const s = this.skills().find(x => x.id === this.selectedId);
    if (!s) return;
    const pending = numOf($('#actionRoll'), null);
    const rolls = this.chain.concat(Number.isFinite(pending) ? [pending] : []);
    const mod = modValue($('#actionMod'));
    const spellSum = Rules.activeSkillBonuses(Store.character, Store.session.activeSpells, s)
      .filter(b => !this.spellOff[b.key])
      .reduce((sum, b) => sum + b.value, 0);
    const out = $('#actionTotal').querySelector('b');
    const formula = $('#actionFormula');

    renderRollChain($('#actionChain'), this.chain, pending);

    if (!rolls.length) {
      out.textContent = '—';
      formula.textContent = 'Bonus ' + signed(s.total + spellSum) +
        (spellSum ? ' (loitsut ' + signed(spellSum) + ')' : '') + ' — syötä heitto';
      return;
    }
    const roll = rollChainTotal(rolls);
    out.textContent = fmtNum(roll + s.total + mod + spellSum);
    formula.textContent =
      (rolls.length > 1 ? rollChainText(rolls) + ' = ' + fmtNum(roll) : fmtNum(roll)) +
      ' (heitto) ' + signed(s.total) + ' (' + (s.display || s.name) + ')' +
      (spellSum ? ' ' + signed(spellSum) + ' (loitsut)' : '') +
      (mod ? ' ' + signed(mod) + ' (modi)' : '');
  },

  /* ---------- Puhetunnistus (valinnainen) ---------- */

  setupSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      $('#btnMic').classList.add('unsupported');
      $('#micStatus').textContent = 'Puhehaku ei ole käytettävissä tässä selaimessa.';
      return;
    }
    const rec = new SR();
    rec.lang = CONFIG.speech.lang;
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    rec.onresult = e => {
      const alts = Array.from(e.results[0]).map(a => a.transcript);
      $('#micStatus').textContent = 'Kuultiin: ”' + alts[0] + '”';
      const hit = this.bestSkillMatch(alts);
      if (hit) {
        this.filter.text = '';
        $('#skillSearch').value = '';
        this.renderList();
        this.select(hit.id);
      } else {
        $('#skillSearch').value = alts[0];
        this.filter.text = alts[0];
        this.renderList();
        $('#micStatus').textContent = 'Ei suoraa osumaa — haettiin: ”' + alts[0] + '”';
      }
    };
    rec.onerror = e => {
      $('#micStatus').textContent = e.error === 'not-allowed'
        ? 'Mikrofonin käyttö estetty.'
        : 'Puhetunnistus epäonnistui (' + e.error + ').';
      this.setListening(false);
    };
    rec.onend = () => this.setListening(false);
    this.recognition = rec;
    $('#micStatus').textContent = 'Paina mikrofonia ja sano taidon nimi.';
  },

  bestSkillMatch(alternatives) {
    let best = null, bestScore = 0.45;
    this.skills().forEach(s => {
      alternatives.forEach(alt => {
        const score = Math.max(similarity(alt, s.name), similarity(alt, s.display || s.name));
        if (score > bestScore) { bestScore = score; best = s; }
      });
    });
    return best;
  },

  toggleMic() {
    if (!this.recognition) { toast('Puhehaku ei ole käytettävissä.'); return; }
    if (this.listening) { this.recognition.stop(); return; }
    try {
      this.recognition.start();
      this.setListening(true);
      $('#micStatus').textContent = 'Kuuntelee…';
    } catch (e) {
      this.setListening(false);
    }
  },

  setListening(on) {
    this.listening = on;
    $('#btnMic').classList.toggle('listening', on);
  }
};
