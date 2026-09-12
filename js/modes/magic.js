/* TAIKA-näkymä: voimapisteet ja loitsut taikalistoittain ryhmiteltynä.
   Listan sisällä loitsut ovat tasojärjestyksessä, kuten RoleMasterin listoissa.
   Voimapisteet toimivat kuten osumapisteet taistelunäkymässä: yksi nykyarvo,
   jota kasvatetaan ja vähennetään käsin tai loitsimalla. */

const Magic = {

  closedLists: [],    // suljetut listaryhmät (vain näkymän tila)
  search: '',

  init() {
    $('#view-magic').addEventListener('click', e => {
      const b = e.target.closest('button[data-pp]');
      if (!b) return;
      haptic();
      const max = Store.character.vitals.ppMax;
      Store.update(s => {
        s.ppCur = b.dataset.pp === 'full' ? max : clamp(s.ppCur + parseInt(b.dataset.pp, 10), 0, max);
      });
    });

    $('#spellSearch').addEventListener('input', e => {
      this.search = e.target.value;
      this.renderList();
    });

    $('#spellLevels').addEventListener('click', e => {
      const head = e.target.closest('.skillgroup-head');
      if (head) {
        const list = head.dataset.list;
        const i = this.closedLists.indexOf(list);
        if (i >= 0) this.closedLists.splice(i, 1); else this.closedLists.push(list);
        this.renderList();
        return;
      }
      const row = e.target.closest('li[data-spell]');
      if (!row) return;
      haptic();
      this.select(row.dataset.spell);
    });

    $('#btnCast').addEventListener('click', () => this.cast());

    $('#activeSpells').addEventListener('click', e => {
      const b = e.target.closest('button[data-deactivate]');
      if (!b) return;
      haptic();
      this.deactivate(b.dataset.deactivate);
      toast('Loitsu poistettu aktiivisista.');
    });
  },

  spells() { return (Store.character && Store.character.spells) || []; },

  /** Listan taitobonus ja tasot Magia-taidoista. */
  listInfo(name) {
    const lists = (Store.character && Store.character.spellLists) || [];
    return lists.find(l => norm(l.name) === norm(name)) || null;
  },

  selected() { return this.spells().find(s => s.id === Store.session.spellId) || null; },

  select(id) {
    Store.update(s => { s.spellId = id; });
    $('#spellCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  cast() {
    const sp = this.selected();
    if (!sp) return;
    if (!sp.known) {
      toast(sp.list + ' -listan taso ei vielä riitä tähän loitsuun.');
      return;
    }
    if (Store.session.ppCur < sp.pp) {
      toast('Voimapisteet eivät riitä (' + Store.session.ppCur + ' / ' + sp.pp + ').');
      return;
    }
    // Ilman ajastinta uudelleenloitsiminen ei tuo mitään, joten vahinkoklikkaus
    // ei saa viedä voimapisteitä.
    if (Rules.spellHasEffect(Store.character, sp.name) &&
        (Store.session.activeSpells || []).some(a => norm(a.spell) === norm(sp.name))) {
      toast(sp.name + ' on jo aktiivisena. Poista se ensin, jos haluat loitsia uudelleen.');
      return;
    }
    haptic();
    Store.update(s => { s.ppCur = clamp(s.ppCur - sp.pp, 0, Store.character.vitals.ppMax); });

    // Kestovaikutteinen loitsu jää seurattavaksi, kunnes pelaaja poistaa sen.
    const lasting = Rules.spellHasEffect(Store.character, sp.name);
    if (lasting) this.activate(sp.name);

    toast(sp.name + ' loitsittu — ' + sp.pp + ' pp, jäljellä ' + Store.session.ppCur +
          (lasting ? '. Lisätty aktiivisiin.' : '.'));
  },

  /* ---------------- Aktiiviset loitsut ----------------
     Ei ajastinta: loitsu jää listalle kunnes pelaaja poistaa sen. Vaikutukset
     luetaan Sheetin loitsuvälilehdeltä ja ne huomioidaan Taistelu- ja
     Teot-näkymissä niin kauan kuin loitsu on listalla. */

  activate(spellName) {
    // Sama loitsu ei mene listalle kahdesti: vahinkoklikkaus kaksinkertaistaisi
    // muuten bonuksen huomaamatta.
    const already = (Store.session.activeSpells || [])
      .find(a => norm(a.spell) === norm(spellName));
    if (already) return already;

    const entry = {
      id: 'ac' + Date.now() + Math.floor(Math.random() * 1000),
      spell: spellName,
      at: new Date().toISOString(),
      round: Store.session.round
    };
    Store.update(s => { s.activeSpells.push(entry); });
    return entry;
  },

  deactivate(id) {
    Store.update(s => {
      s.activeSpells = s.activeSpells.filter(a => a.id !== id);
    });
  },

  renderActive() {
    const c = Store.character;
    const list = $('#activeSpells');
    const active = Store.session.activeSpells || [];
    list.innerHTML = '';

    $('#activeCount').textContent = active.length ? active.length + ' voimassa' : 'ei yhtään';

    if (!active.length) {
      list.appendChild(el('li', { class: 'empty',
        text: 'Loitsittu kestovaikutus ilmestyy tähän.' }));
      return;
    }

    active.forEach(a => {
      const rows = Rules.spellBonusRows(c, a.spell).filter(b => b.type !== 'attack');
      const effects = rows.map(b => {
        const what = b.type === 'db' ? Rules.scopeLabel(b) : b.target;
        return signed(b.value) + ' ' + what + (b.note ? ' (' + b.note + ')' : '');
      });

      list.appendChild(el('li', { class: 'active-spell' }, [
        el('div', { class: 'as-main' }, [
          el('span', { class: 'as-name', text: a.spell }),
          el('span', { class: 'as-effect', text: effects.length
            ? effects.join(' · ')
            : 'ei kirjattua vaikutusta loitsuvälilehdellä' })
        ]),
        el('button', { class: 'coin-btn remove', 'data-deactivate': a.id, text: '✕' })
      ]));
    });
  },

  render() {
    const c = Store.character, s = Store.session;
    const max = c.vitals.ppMax, cur = clamp(s.ppCur, 0, max);
    const ratio = max ? cur / max : 0;

    $('#ppCur').textContent = cur;
    $('#ppMax').textContent = max;
    const fill = $('#ppFill');
    fill.style.width = (ratio * 100) + '%';
    fill.className = 'hp-fill pp' +
      (ratio <= CONFIG.magic.ppDanger ? ' danger' : ratio <= CONFIG.magic.ppWarn ? ' warn' : '');

    const usable = this.spells().filter(sp => sp.known);
    const affordable = usable.filter(sp => sp.pp <= cur).length;
    $('#ppNote').textContent = max === 0
      ? 'Hahmolla ei ole voimapisteitä.'
      : cur === 0 ? 'Voimapisteet lopussa — ei loitsuja.'
      : affordable + ' / ' + usable.length + ' osatusta loitsusta käytettävissä.';

    this.renderActive();
    this.renderSelected();
    this.renderList();
  },

  renderSelected() {
    const card = $('#spellCard');
    const sp = this.selected();
    if (!sp) { card.classList.add('hidden'); return; }
    card.classList.remove('hidden');

    const info = this.listInfo(sp.list);
    card.classList.toggle('locked', !sp.known);

    $('#spellName').textContent = sp.name;
    $('#spellMeta').textContent = [sp.list, 'listan taso ' + sp.level].filter(Boolean).join(' · ');
    $('#spellCost').textContent = sp.pp + ' pp';

    const kv = $('#spellDetails');
    kv.innerHTML = '';
    const rows = [];
    if (info) {
      rows.push(['Listan bonus', signed(info.bonus)]);
      rows.push(['Osattu listasta', info.ranks + ' tasoa']);
    }
    [['Kantama', sp.range], ['Kesto', sp.duration], ['Vaikutusalue', sp.area]]
      .forEach(p => { if (p[1]) rows.push(p); });
    rows.forEach(p => kv.appendChild(el('li', {}, [el('span', { text: p[0] }), el('b', { text: p[1] })])));

    $('#spellNote').textContent = sp.known
      ? (sp.note || '')
      : 'Ei vielä osattavissa: ' + sp.list + ' -listaa on kehitetty ' +
        (info ? info.ranks : '?') + ' tasoa, tämä loitsu on tasolla ' + sp.level + '.';

    const btn = $('#btnCast');
    const enough = Store.session.ppCur >= sp.pp;
    btn.disabled = !enough || !sp.known;
    btn.textContent = !sp.known ? 'Listan taso ei riitä'
      : enough ? 'Loitsi (−' + sp.pp + ' pp)' : 'Ei tarpeeksi voimapisteitä';
  },

  renderList() {
    const box = $('#spellLevels');
    const q = norm(this.search);
    const all = this.spells();
    const hits = q
      ? all.filter(sp => norm(sp.name).includes(q) || norm(sp.list).includes(q) || norm(sp.note).includes(q))
      : all;

    box.innerHTML = '';
    $('#spellListTitle').textContent = 'Loitsut (' + hits.length + ')';

    if (!hits.length) {
      box.appendChild(el('div', { class: 'empty', text: 'Ei osumia.' }));
      return;
    }

    const lists = [];
    hits.forEach(sp => {
      const key = sp.list || 'Muut loitsut';
      if (!lists.includes(key)) lists.push(key);
    });

    const cur = Store.session.ppCur;

    lists.forEach(list => {
      const items = hits
        .filter(sp => (sp.list || 'Muut loitsut') === list)
        .sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name, 'fi'));
      const open = q ? true : !this.closedLists.includes(list);
      const info = this.listInfo(list);
      const knownCount = items.filter(sp => sp.known).length;
      const meta = (info ? 'bonus ' + signed(info.bonus) + ' · ' : '') +
                   knownCount + '/' + items.length + ' osattu';

      box.appendChild(el('div', { class: 'skillgroup' + (open ? ' open' : '') }, [
        el('div', { class: 'skillgroup-head', 'data-list': list }, [
          el('span', { class: 'sg-name', text: list }),
          el('span', { class: 'sg-meta', text: meta }),
          el('span', { class: 'sg-chev', text: '⌄' })
        ]),
        el('ul', { class: 'skillgroup-body spell-body' }, items.map(sp =>
          el('li', {
            class: 'spell-row' + (Store.session.spellId === sp.id ? ' active' : '') +
                   (!sp.known ? ' locked' : (sp.pp > cur ? ' unaffordable' : '')),
            'data-spell': sp.id
          }, [
            el('span', { class: 'spell-level', text: String(sp.level) }),
            el('div', { class: 'spell-main' }, [
              el('span', { class: 'spell-name', text: sp.name }),
              el('span', { class: 'spell-sub', text: sp.known
                ? [sp.duration, sp.range].filter(Boolean).join(' · ')
                : 'ei vielä osattavissa' })
            ]),
            el('b', { class: 'spell-pp', text: sp.known ? sp.pp + ' pp' : '🔒' })
          ])
        ))
      ]));
    });
  }
};
