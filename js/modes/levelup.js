/* SEURAAVA TASO — oma näkymä, johon pääsee vain Hahmo-välilehden napista.
   Ei alapalkissa, koska tasonnosto tehdään pelisessioiden välissä, ei kesken pelin.

   Suunnitelma luetaan Sheetsin taitoruudukosta: numero ruudussa = sille tasolle
   käytetyt kehityspisteet, X = aiemmin maksettu taso joka odottaa opiskelua.
   "Nosta tasoa" kirjaa uudet tasot ja ominaisuusarvot appin kertyvään dataan,
   koska appi ei kirjoita Sheetiin. Yhteenveto viedään Sheetiin Hahmo-välilehden
   "Vie Sheetiin" -toiminnolla, ja kun lomake on päivitetty, päällekirjoitus
   kuittautuu pois. */

const LevelUp = {

  init() {
    $('#btnLevelUp').addEventListener('click', () => {
      haptic();
      App.show('levelup');
    });
    $('#btnLevelUpBack').addEventListener('click', () => {
      haptic();
      App.show('sheet');
    });

    $('#btnFetchPlan').addEventListener('click', async () => {
      if (CONFIG.data.source !== 'sheets') {
        toast('Lähtötietotilassa suunnitelma tulee tiedostosta js/seed-data.js.');
        return;
      }
      const btn = $('#btnFetchPlan');
      btn.disabled = true;
      btn.textContent = 'Haetaan…';
      await App.refresh({});
      btn.disabled = false;
      btn.textContent = 'Hae suunnitelma Sheetsistä';
      const plan = Rules.levelUpPlan(Store.character);
      toast(plan.buys.length
        ? plan.buys.length + ' taitoa suunnitelmassa, ' + plan.spent + ' kehityspistettä.'
        : 'Sheetsin ruudukossa ei ole merkittyjä kehityspisteitä.');
    });

    $('#btnDoLevelUp').addEventListener('click', () => this.apply());

    $('#btnUndoLevelUp').addEventListener('click', () => {
      if (!confirm('Kumotaanko tasonnosto? Tasot ja ominaisuusarvot palautuvat lomakkeen mukaisiksi.')) return;
      Store.updateDurable(d => { d.levelUp = null; });
      Store.recompute();
      toast('Tasonnosto kumottu.');
    });
  },

  /* ---------------- Tasonnoston toteutus ---------------- */

  apply() {
    const c = Store.character;
    const plan = Rules.levelUpPlan(c);

    if (!plan.buys.length && !confirm('Suunnitelmassa ei ole ostoja. Nostetaanko taso silti?')) return;
    if (plan.left < 0 && !confirm('Suunnitelma ylittää kehityspisteet ' + Math.abs(plan.left) +
        ' pisteellä. Jatketaanko silti?')) return;

    // Ominaisuuksien uudet arvot lomakkeelta
    const stats = {};
    let invalid = null;
    $$('#statEdit .stat-edit-row').forEach(row => {
      const code = row.dataset.code;
      const temp = numOf(row.querySelector('input[data-field=temp]'), null);
      const pot = numOf(row.querySelector('input[data-field=pot]'), null);
      if (!Number.isFinite(temp) || !Number.isFinite(pot)) { invalid = code; return; }
      // Osalla ominaisuuksista (esim. Ulkonäkö) ei ole POT-arvoa lomakkeessa,
      // joten vertailu tehdään vain kun potentiaali on annettu.
      if (pot > 0 && temp > pot) invalid = invalid || (code + ': TEMP suurempi kuin POT');
      stats[code] = { temp: temp, pot: pot };
    });
    if (invalid) { toast('Tarkista ominaisuusarvot (' + invalid + ').'); return; }

    const ranks = {};
    plan.buys.forEach(b => { ranks[b.id] = b.ranksAfter; });

    const nextLevel = c.meta.level + 1;
    if (!confirm('Nostetaanko taso ' + nextLevel + '? ' + plan.buys.length +
                 ' taitoa nousee ja kaikki bonukset lasketaan uudelleen.')) return;

    haptic();
    Store.updateDurable(d => {
      d.levelUp = {
        level: nextLevel,
        ranks: ranks,
        stats: stats,
        at: new Date().toISOString(),
        spent: plan.spent
      };
    });
    Store.recompute();
    toast('Taso ' + nextLevel + '. Muista viedä muutokset Sheetiin.');
  },

  /* ---------------- Piirto ---------------- */

  render() {
    const c = Store.character;
    if (!c) return;
    const d = Store.durable;
    const plan = Rules.levelUpPlan(c);
    const applied = d.levelUp;

    $('#levelUpTitle').textContent = 'Taso ' + c.meta.level + ' → ' + (c.meta.level + 1);
    $('#nextLevelNum').textContent = String(c.meta.level + 1);

    /* --- Banneri kun tasonnosto on tehty mutta ei viety --- */
    const banner = $('#levelUpBanner');
    if (applied) {
      banner.className = 'status-banner freed';
      banner.innerHTML = '<b>TASO ' + applied.level + ' NOSTETTU APPISSA</b>' +
        '<span>Vie muutokset Sheetiin Hahmo-välilehdeltä. Lomake on yhä tasolla ' +
        (Store.raw ? Store.raw.meta.level : '—') + '.</span>';
    } else {
      banner.className = 'status-banner hidden';
      banner.innerHTML = '';
    }
    $('#btnUndoLevelUp').classList.toggle('hidden', !applied);
    $('#btnDoLevelUp').disabled = !!applied;

    /* --- Kehityspisteet --- */
    $('#dpLeft').textContent = plan.left;
    const pct = plan.available ? clamp(plan.spent / plan.available * 100, 0, 100) : 0;
    const fill = $('#dpFill');
    fill.style.width = pct + '%';
    fill.classList.toggle('over', plan.left < 0);

    const kv = $('#dpKv');
    kv.innerHTML = '';
    [['Käytettävissä', plan.available], ['Suunniteltu', plan.spent], ['Jäljellä', plan.left]]
      .forEach(p => kv.appendChild(el('li', {}, [
        el('span', { text: p[0] }), el('b', { text: String(p[1]) })
      ])));
    (c.devPoints ? c.devPoints.perStat : []).forEach(s => {
      kv.appendChild(el('li', { class: 'dp-stat' }, [
        el('span', { text: s.code + (s.computed ? '' : ' (lomakkeelta)') }),
        el('b', { text: String(s.value) })
      ]));
    });

    /* --- Suunnitellut ostot --- */
    const list = $('#planList');
    list.innerHTML = '';
    $('#planCount').textContent = plan.buys.length
      ? plan.buys.length + ' taitoa · ' + plan.spent + ' kp'
      : 'ei ostoja';

    if (!plan.buys.length) {
      list.appendChild(el('li', { class: 'empty',
        text: 'Merkitse Sheetsin taitoruudukkoon kehityspisteet numerona, ja hae suunnitelma.' }));
    }
    plan.buys.forEach(b => {
      list.appendChild(el('li', { class: 'plan-row' }, [
        el('div', { class: 'plan-main' }, [
          el('span', { class: 'plan-name', text: b.name }),
          el('span', { class: 'plan-sub', text: b.category + (b.cost ? ' · hinta ' + b.cost : '') })
        ]),
        el('div', { class: 'plan-nums' }, [
          el('span', { class: 'plan-ranks', text: b.ranksNow + ' → ' + b.ranksAfter + ' tasoa' }),
          el('span', { class: 'plan-bonus' }, [
            el('span', { class: 'pb-old', text: signed(b.bonusNow) }),
            el('b', { text: signed(b.bonusAfter) })
          ])
        ]),
        el('span', { class: 'plan-dp', text: b.dp + ' kp' })
      ]));
    });

    /* --- Odottavat --- */
    $('#pendingCard').classList.toggle('hidden', !plan.pending.length);
    const pl = $('#pendingList');
    pl.innerHTML = '';
    plan.pending.forEach(p => {
      pl.appendChild(el('li', { class: 'plan-row' }, [
        el('div', { class: 'plan-main' }, [
          el('span', { class: 'plan-name', text: p.name }),
          el('span', { class: 'plan-sub', text: 'taso ' + p.rank + ' maksettu, odottaa opiskelua' })
        ]),
        el('span', { class: 'plan-dp', text: '⏳' })
      ]));
    });

    this.renderStatEdit(c, applied);
  },

  /** Ominaisuuksien uudet TEMP/POT-arvot. Kentät säilyttävät käyttäjän syötteen
      uudelleenpiirron yli, jotta täyttäminen ei nollaudu kesken. */
  renderStatEdit(c, applied) {
    const box = $('#statEdit');
    const existing = {};
    $$('#statEdit .stat-edit-row').forEach(row => {
      existing[row.dataset.code] = {
        temp: row.querySelector('input[data-field=temp]').value,
        pot: row.querySelector('input[data-field=pot]').value
      };
    });

    box.innerHTML = '';
    c.stats.forEach(st => {
      const prev = existing[st.code] || {};
      box.appendChild(el('div', { class: 'stat-edit-row', 'data-code': st.code }, [
        el('span', { class: 'se-code', text: st.code }),
        el('span', { class: 'se-name', text: st.name }),
        el('input', {
          type: 'number', inputmode: 'numeric', class: 'mini-input', 'data-field': 'temp',
          value: prev.temp !== undefined && prev.temp !== '' ? prev.temp : String(st.temp),
          disabled: applied ? '' : null
        }),
        el('input', {
          type: 'number', inputmode: 'numeric', class: 'mini-input', 'data-field': 'pot',
          value: prev.pot !== undefined && prev.pot !== '' ? prev.pot : String(st.pot),
          disabled: applied ? '' : null
        }),
        el('span', { class: 'se-bonus', text: signed(st.bonus) })
      ]));
    });
  }
};
