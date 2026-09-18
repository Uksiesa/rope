/* HAHMO-näkymä: hahmolomake luettavassa muodossa, killat, varusteiden
   kantopaikat ja datakerrosten hallinta. Loitsut ovat omassa Taika-näkymässään. */

const SheetView = {

  init() {
    $('#sheetSkills').addEventListener('click', e => {
      const h = e.target.closest('.skillgroup-head');
      if (!h) return;
      h.parentElement.classList.toggle('open');
    });

    /* --- Varusteen kantopaikan vaihto --- */
    $('#invGroups').addEventListener('change', e => {
      const sel = e.target.closest('select[data-item]');
      if (!sel) return;
      const id = sel.dataset.item;
      if (sel.value === '__custom') {
        const now = Store.durable.itemLocations[id] || '';
        const val = prompt('Uusi kantopaikka:', now);
        if (val === null) { this.render(); return; }
        Store.updateDurable(d => { d.itemLocations[id] = val.trim() || now; });
      } else {
        Store.updateDurable(d => { d.itemLocations[id] = sel.value; });
      }
      haptic();
    });

    /* --- Datakerrokset --- */
    $('#btnResetSession').addEventListener('click', () => {
      if (!confirm('Aloitetaanko uusi sessio? Osumapisteet, voimapisteet, kierrokset ja tilavaikutukset nollataan. Kertyvä data säilyy.')) return;
      Store.resetSession();
      toast('Uusi sessio aloitettu.');
    });

    $('#btnResetDurable').addEventListener('click', () => {
      if (!confirm('Nollataanko KERTYVÄ data? Matkapäivät, muona, rahat, kielitunnit, päiväkirja ja kantopaikat menetetään.')) return;
      if (!confirm('Varmasti? Tätä ei voi perua.')) return;
      Store.resetDurable();
      toast('Kertyvä data nollattu.');
    });

    this.initPortrait();

    $('#btnCopyDurable').addEventListener('click', () => this.copyDurable());
    $('#btnPushDurable').addEventListener('click', () => this.pushDurable());
    $('#btnPullDurable').addEventListener('click', () => this.pullDurable());
  },

  /** Kokeillaan configin tiedostonimiä järjestyksessä; ensimmäinen joka latautuu
      jää näkyviin. Klikkaus suurentaa ja pienentää kuvan. */
  initPortrait() {
    const img = $('#heroPortrait');
    if (!img) return;
    const candidates = (CONFIG.portrait || []).slice();

    const tryNext = () => {
      if (!candidates.length) { img.classList.add('hidden'); return; }
      img.src = candidates.shift();
    };
    img.addEventListener('error', tryNext);
    img.addEventListener('load', () => img.classList.remove('hidden'));
    img.addEventListener('click', () => {
      img.classList.toggle('big');
      haptic();
    });
    tryNext();
  },

  /* ---------------- Kertyvän datan vienti ---------------- */

  async copyDurable() {
    const tsv = Store.exportDurableTsv();
    try {
      await navigator.clipboard.writeText(tsv);
      toast('Kertyvä data kopioitu — liitä Sheetiin.');
    } catch (e) {
      prompt('Kopioi tämä ja liitä Sheetiin:', tsv);
    }
  },

  async pushDurable() {
    if (CONFIG.data.source !== 'sheets' || !Sheets.canWrite()) {
      toast('Kirjoitus ei ole käytössä — kopioidaan sen sijaan leikepöydälle.');
      this.copyDurable();
      return;
    }
    const btn = $('#btnPushDurable');
    btn.disabled = true;
    btn.textContent = 'Viedään…';
    try {
      await Sheets.pushDurable(Store.exportDurable());
      Store.markPushed();
      toast('Kertyvä data viety Sheetiin.');
      this.render();
    } catch (err) {
      console.error(err);
      toast('Vienti epäonnistui: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Vie Sheetiin';
    }
  },

  async pullDurable() {
    if (CONFIG.data.source !== 'sheets') { toast('Mockup-tilassa ei ole Sheetiä.'); return; }
    if (!confirm('Haetaanko kertyvä data Sheetistä? Tämän laitteen nykyiset arvot korvataan.')) return;
    try {
      const data = await Sheets.pullDurable();
      Store.updateDurable(d => {
        ['day', 'food'].forEach(k => { if (typeof data[k] === 'number') d[k] = data[k]; });
        if (data.money) Object.assign(d.money, data.money);
        if (data.langHours) d.langHours = data.langHours;
        if (data.langTargets) d.langTargets = data.langTargets;
        if (data.langRanks) d.langRanks = data.langRanks;
        if (data.itemLocations) d.itemLocations = data.itemLocations;
        if (Array.isArray(data.log)) d.log = data.log;
        d.moneyInit = true;
      });
      toast('Kertyvä data haettu Sheetistä.');
    } catch (err) {
      console.error(err);
      toast('Haku epäonnistui: ' + err.message);
    }
  },

  /* ---------------- Piirto ---------------- */

  render() {
    const c = Store.character, s = Store.session, d = Store.durable;
    const m = c.meta;

    $('#sheetName').textContent = m.name;
    $('#sheetSub').textContent = [m.race, m.culture, m.profession, 'taso ' + m.level]
      .filter(Boolean).join(' · ');

    const hpPct = c.vitals.hitsMax ? clamp(s.hpCur / c.vitals.hitsMax, 0, 1) * 100 : 0;
    $('#sheetHpFill').style.width = hpPct + '%';
    $('#sheetHpVal').textContent = s.hpCur + ' / ' + c.vitals.hitsMax;

    if (c.vitals.ppMax > 0) {
      $('#sheetPpRow').classList.remove('hidden');
      $('#sheetPpFill').style.width = (clamp(s.ppCur / c.vitals.ppMax, 0, 1) * 100) + '%';
      $('#sheetPpVal').textContent = s.ppCur + ' / ' + c.vitals.ppMax;
    } else {
      $('#sheetPpRow').classList.add('hidden');
    }

    /* --- Ominaisuudet --- */
    const grid = $('#statGrid');
    grid.innerHTML = '';
    c.stats.forEach(st => {
      grid.appendChild(el('div', { class: 'stat' + (st.bonus >= 10 ? ' high' : '') }, [
        el('div', { class: 'stat-code', text: st.code }),
        el('div', { class: 'stat-bonus', text: signed(st.bonus) }),
        el('div', { class: 'stat-name', text: st.name }),
        el('div', { class: 'stat-temp', text: st.temp + ' / ' + (st.pot || '—') })
      ]));
    });

    /* --- Killat --- */
    const gl2 = $('#guildList');
    gl2.innerHTML = '';
    const guilds = c.guilds || [];
    if (!guilds.length) {
      gl2.appendChild(el('li', { class: 'empty', text: 'Ei kiltajäsenyyksiä.' }));
    }
    const rules = (Store.raw && Store.raw.guildRules) || [];
    guilds.forEach(g => {
      // Killan omat tasoedut, jotka hahmon kiltataso jo avaa
      const own = rules.filter(r => Rules.guildQualifies([g], r));
      const perks = own.map(r => {
        const what = r.kind === 'stat' ? r.target : r.target + ' -taito';
        const howMuch = r.perLevel ? r.amount + '×taso' : signed(r.amount);
        return 'taso ' + r.level + ': ' + howMuch + ' ' + what;
      });
      gl2.appendChild(el('li', { class: 'guild' }, [
        el('div', { class: 'guild-badge', text: g.level ? String(g.level) : '·' }),
        el('div', { class: 'guild-main' }, [
          el('span', { class: 'guild-name', text: g.name }),
          el('span', { class: 'guild-rank', text: [g.rank || ('Taso ' + g.level), g.since ? 'vuodesta ' + g.since : ''].filter(Boolean).join(' · ') }),
          perks.length
            ? el('span', { class: 'guild-note', text: perks.join(' · ') })
            : (g.note ? el('span', { class: 'guild-note', text: g.note }) : el('span'))
        ])
      ]));
    });

    /* --- Vastustusheitot (piilotetaan jos lomakkeessa ei ole niitä) --- */
    $('#rrCard').classList.toggle('hidden', !c.resists.length);
    const rr = $('#rrList');
    rr.innerHTML = '';
    c.resists.forEach(r => {
      rr.appendChild(el('li', { class: 'rr' }, [
        el('span', { text: r.name }),
        el('b', { text: signed(r.value) })
      ]));
    });

    /* --- Aseet ja puolustus --- */
    const gl = $('#combatList');
    gl.innerHTML = '';
    c.weapons.forEach(w => {
      const f = Rules.fumbleFor(w);
      const fumbleText = f ? 'fumble ' + (f < 10 ? '0' + f : f) +
                             (Number.isFinite(w.fumble) && w.fumble > 0 ? '' : ' (oletus)') : '';
      gl.appendChild(el('li', { class: 'gear' }, [
        el('div', { class: 'gear-main' }, [
          el('span', { class: 'gear-name', text: w.name }),
          el('span', { class: 'gear-note', text: [w.table, w.note,
            Rules.isTwoHanded(w) ? 'kahden käden' : '', fumbleText].filter(Boolean).join(' · ') })
        ]),
        el('b', { class: 'gear-val', text: 'OB ' + w.ob })
      ]));
    });
    const dbTotal = c.defense.filter(x => x.on !== false).reduce((sum, x) => sum + x.value, 0);
    gl.appendChild(el('li', { class: 'gear db-row' }, [
      el('div', { class: 'gear-main' }, [
        el('span', { class: 'gear-name', text: 'Puolustus (perus-DB)' }),
        el('span', { class: 'gear-note', text: c.defense.filter(x => x.on !== false).map(x => x.name).join(', ') })
      ]),
      el('b', { class: 'gear-val', text: signed(dbTotal) })
    ]));
    if (c.armor && c.armor.type) {
      gl.appendChild(el('li', { class: 'gear' }, [
        el('div', { class: 'gear-main' }, [
          el('span', { class: 'gear-name', text: 'Panssari' }),
          el('span', { class: 'gear-note', text: c.armor.type })
        ]),
        el('b', { class: 'gear-val', text: '' })
      ]));
    }

    /* --- Taidot --- */
    const box = $('#sheetSkills');
    box.innerHTML = '';
    const cats = [];
    c.skills.forEach(sk => { if (!cats.includes(sk.category)) cats.push(sk.category); });
    cats.forEach((cat, idx) => {
      const items = c.skills.filter(sk => sk.category === cat);
      const best = items.reduce((mx, sk) => Math.max(mx, sk.total), 0);
      box.appendChild(el('div', { class: 'skillgroup' + (idx === 0 ? ' open' : '') }, [
        el('div', { class: 'skillgroup-head' }, [
          el('span', { class: 'sg-name', text: cat }),
          el('span', { class: 'sg-meta', text: items.length + ' taitoa · paras ' + signed(best) }),
          el('span', { class: 'sg-chev', text: '⌄' })
        ]),
        el('ul', { class: 'skillgroup-body' }, items.map(sk =>
          el('li', { class: 'sg-row' }, [
            el('span', { class: 'sg-skill', text: sk.display || sk.name }),
            el('span', { class: 'sg-bar' }, [
              el('span', { class: 'sg-bar-fill', style: 'width:' + clamp(sk.total / 1.2, 0, 100) + '%' })
            ]),
            el('b', { class: 'sg-val', text: signed(sk.total) })
          ])
        ))
      ]));
    });

    /* --- Varusteet kantopaikoittain --- */
    this.renderInventory();

    /* --- Tausta --- */
    $('#bioText').textContent = m.bio || '';
    $('#bioText').classList.toggle('hidden', !m.bio);
    const kv = $('#bioKv');
    kv.innerHTML = '';
    [['Pelaaja', m.player], ['Kokemuspisteet', m.exp ? m.exp.toLocaleString('fi-FI') : ''],
     ['Kotipaikka', m.culture], ['Sukupuoli', m.sex], ['Ikä', m.age],
     ['Pituus', m.height], ['Paino', m.weight], ['Hiukset', m.hair], ['Silmät', m.eyes]]
      .filter(p => p[1]).forEach(p => {
        kv.appendChild(el('li', {}, [el('span', { text: p[0] }), el('b', { text: String(p[1]) })]));
      });

    /* --- Lomakkeen MISCELLANEOUS-osio --- */
    const notes = $('#sheetNotes');
    notes.innerHTML = '';
    (m.notes || []).forEach(n => {
      notes.appendChild(el('div', { class: 'note-block' }, [
        el('div', { class: 'note-label', text: n.label }),
        el('div', { class: 'note-value', text: n.value })
      ]));
    });

    /* --- Datakerrokset --- */
    const fill = (sel, rows) => {
      const ul = $(sel);
      ul.innerHTML = '';
      rows.forEach(p => ul.appendChild(el('li', {}, [
        el('span', { text: p[0] }), el('b', { text: String(p[1]) })
      ])));
    };

    const fetched = Store.fetchedAt();
    const pushed = Store.pushedAt();
    fill('#sourceKv', [
      ['Lähde', CONFIG.data.source === 'sheets' ? 'Google Sheets' : 'Mockup-data (dummy)'],
      ['Haettu', fetched ? new Date(fetched).toLocaleString('fi-FI') : 'ei koskaan'],
      ['Sisältö', c.skills.length + ' taitoa · ' + c.spellLists.length + ' listaa · ' +
                  c.spells.length + ' loitsua · ' + c.weapons.length + ' asetta']
    ]);

    const lowest = CONFIG.coins[CONFIG.coins.length - 1];
    const langTotal = Object.keys(d.langHours).reduce((sum, k) => sum + d.langHours[k], 0);
    fill('#durableKv', [
      ['Matkapäiviä', d.day],
      ['Päiväys', Calendar.format(d.day)],
      ['Muona', d.food],
      ['Rahat', Money.format(d.money)],
      ['Kielitunnit', langTotal + ' h'],
      ['Päiväkirja', d.log.filter(e => !DayLog.isEmpty(e)).length + ' merkintää'],
      ['Tasonnosto', d.levelUp ? 'taso ' + d.levelUp.level + ' odottaa vientiä' : '—'],
      ['Viety Sheetiin', pushed ? new Date(pushed).toLocaleString('fi-FI') : 'ei koskaan']
    ]);

    const diffs = Rules.compare(c);
    const conflicts = diffs.filter(x => x.conflict).length;
    const known = diffs.filter(x => x.knownError).length;
    fill('#rulesKv', [
      ['Laskettu raakasyötteistä', c.skills.filter(s => s.computed).length + ' / ' + c.skills.length + ' taitoa'],
      ['Taulukot', Rules.tables && Store.raw && Store.raw.rules ? 'Sheetin Rules-välilehti' : 'js/config.js -oletukset'],
      ['Selvitettävää', conflicts + (diffs.length - conflicts - known ? ' + ' + (diffs.length - conflicts - known) + ' eroa' : '')],
      ['Tunnettuja lomakevirheitä', known]
    ]);
    const dl = $('#rulesDiffs');
    dl.innerHTML = '';
    diffs.forEach(x => dl.appendChild(el('li', {
      class: 'rr diff-row' + (x.conflict ? ' conflict' : '') + (x.knownError ? ' known' : '')
    }, [
      el('div', { class: 'diff-main' }, [
        el('span', { text: x.name }),
        x.note ? el('span', { class: 'diff-note', text: x.note }) : el('span')
      ]),
      el('b', { text: signed(x.laskettu) + '  (lomake ' + signed(x.lomake) + ')' })
    ])));
    $('#rulesDiffCard').classList.toggle('hidden', !diffs.length);

    fill('#sessionKv', [
      ['Osumapisteet', s.hpCur + ' / ' + c.vitals.hitsMax],
      ['Voimapisteet', s.ppCur + ' / ' + c.vitals.ppMax],
      ['Kierros', s.round],
      ['Tilavaikutuksia', s.effects.length]
    ]);

    $('#btnPushDurable').textContent =
      (CONFIG.data.source === 'sheets' && Sheets.canWrite()) ? 'Vie Sheetiin' : 'Vie (kopioi)';
    $('#btnPullDurable').disabled = CONFIG.data.source !== 'sheets';
  },

  renderInventory() {
    const c = Store.character, d = Store.durable;
    const box = $('#invGroups');
    box.innerHTML = '';

    const locOf = i => d.itemLocations[i.id] !== undefined ? d.itemLocations[i.id] : (i.location || 'Muu');
    const weightOf = i => (i.weight || 0) * (i.qty || 1);
    // Varustelistassa ei ole painoja eikä kaikilla hintoja, joten tyhjät jätetään
    // näyttämättä sen sijaan että rivi täyttyisi nollista. Hinta on pronssia,
    // ja murto-osat näytetään kolikkoina: 2,2 pronssia = 2 pp 2 kup.
    const bronze = CONFIG.coins.findIndex(c => c.key === 'bronze') >= 0
      ? Money.unitOf('bronze') : 1;
    const priceText = i => i.price
      ? 'hinta ' + Money.formatBase(Math.round(i.price * bronze))
      : '';
    const weightText = i => weightOf(i) ? weightOf(i).toFixed(1) + ' kg' : '';

    // Ryhmien järjestys: configin mukaiset ensin, sitten omat lisäykset.
    const groups = [];
    CONFIG.slots.forEach(s => { if (c.inventory.some(i => locOf(i) === s)) groups.push(s); });
    c.inventory.forEach(i => { const l = locOf(i); if (!groups.includes(l)) groups.push(l); });

    let total = 0;
    groups.forEach(slot => {
      const items = c.inventory.filter(i => locOf(i) === slot);
      const slotWeight = items.reduce((sum, i) => sum + weightOf(i), 0);
      total += slotWeight;

      box.appendChild(el('div', { class: 'inv-group' }, [
        el('div', { class: 'inv-group-head' }, [
          el('span', { class: 'ig-name', text: slot || 'Määrittelemätön' }),
          el('span', { class: 'ig-weight',
            text: slotWeight ? slotWeight.toFixed(1) + ' kg' : items.length + ' kpl' })
        ]),
        el('ul', { class: 'inv-list' }, items.map(i => {
          const cur = locOf(i);
          const options = CONFIG.slots.slice();
          if (cur && !options.includes(cur)) options.unshift(cur);
          const select = el('select', { class: 'slot-select', 'data-item': i.id },
            options.map(o => el('option', { value: o, text: o, selected: o === cur ? '' : null }))
              .concat([el('option', { value: '__custom', text: 'Muu…' })]));

          return el('li', { class: 'inv' }, [
            el('span', { class: 'inv-qty', text: (i.qty > 1 ? i.qty + '×' : '') }),
            el('div', { class: 'inv-main' }, [
              el('span', { class: 'inv-name', text: i.name }),
              el('span', { class: 'inv-note',
                text: [i.note, priceText(i), weightText(i)].filter(Boolean).join(' · ') })
            ]),
            select
          ]);
        }))
      ]));
    });

    $('#invWeight').textContent = total
      ? total.toFixed(1) + ' kg'
      : c.inventory.length + ' esinettä';
  }
};
