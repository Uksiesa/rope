/* MATKA-näkymä: kalenteri, kuunkierto, muona, rahat, kielten opiskelu, päiväkirja.
   Kaikki tämän näkymän data on kertyvää (Store.durable). */

/* ---------- Kalenteri ---------- */

const Calendar = {
  /** Matkapäivä -> kuluneita päiviä aloituspäivästä. Laskuri alkaa ykkösestä:
      matkapäivä 1 on kampanjan aloituspäivä. */
  elapsed(day) { return day - 1; },

  /** Matkapäivä -> { year, monthIndex, month, day } */
  fromIndex(index) {
    const months = CONFIG.calendar.months;
    const yearLength = months.reduce((s, m) => s + m.days, 0);
    const start = CONFIG.calendar.start;

    let dayOfYear = start.day - 1;
    for (let i = 0; i < start.monthIndex; i++) dayOfYear += months[i].days;

    const total = dayOfYear + this.elapsed(index);
    const year = start.year + Math.floor(total / yearLength);
    let rest = ((total % yearLength) + yearLength) % yearLength;

    let mi = 0;
    while (rest >= months[mi].days) { rest -= months[mi].days; mi++; }
    return { year: year, monthIndex: mi, month: months[mi].name, day: rest + 1 };
  },

  /** "14 Kylvökuu 4761" */
  format(index) {
    const d = this.fromIndex(index);
    return d.day + ' ' + d.month + ' ' + d.year;
  },

  /** "14 Kylvökuu" — lyhyt muoto listoihin. */
  formatShort(index) {
    const d = this.fromIndex(index);
    return d.day + '. ' + d.month;
  }
};

const Moon = {
  fraction(index) {
    const c = CONFIG.moon;
    const pos = (((c.startPhase + Calendar.elapsed(index)) % c.cycleDays) + c.cycleDays) % c.cycleDays;
    return pos / c.cycleDays;
  },

  /** Monesko päivä kierrossa, 1 = uusikuu. Vaihenimi kattaa 3–4 päivää, joten
      tämä on se luku jolla kuun tilan näkee päivän tarkkuudella. */
  cycleDay(index) {
    return Math.round(this.fraction(index) * CONFIG.moon.cycleDays) + 1;
  },

  /** Valaistun kiekon osuus 0–1. Kuu kiertää tasaisesti, joten osuus saadaan
      kosinista: uusikuu 0, ensimmäinen neljännes 0,5, täysikuu 1. */
  illumination(index) {
    return (1 - Math.cos(2 * Math.PI * this.fraction(index))) / 2;
  },

  /** Kasvaako vai väheneekö kuu. */
  waxing(index) { return this.fraction(index) < 0.5; },

  /** Lyhyt muoto listoihin: "Vähenevä sirppi 24/28" */
  short(index) {
    return this.phaseName(index) + ' ' + this.cycleDay(index) + '/' + CONFIG.moon.cycleDays;
  },

  phaseName(index) {
    const f = this.fraction(index);
    let best = CONFIG.moon.phases[0], bestD = 1;
    CONFIG.moon.phases.forEach(p => {
      const d = Math.min(Math.abs(f - p.at), 1 - Math.abs(f - p.at));
      if (d < bestD) { bestD = d; best = p; }
    });
    return best.name;
  },

  nextEvents(index) {
    const c = CONFIG.moon;
    const daysTo = targetFraction => {
      for (let i = 0; i <= c.cycleDays; i++) {
        const f = this.fraction(index + i);
        const target = Math.round(targetFraction * c.cycleDays) / c.cycleDays;
        if (Math.abs(f - target) < 0.5 / c.cycleDays) return i;
      }
      return null;
    };
    return { full: daysTo(0.5), newMoon: daysTo(0) };
  },

  svg(index, size) {
    const f = this.fraction(index);
    const theta = 2 * Math.PI * f;
    const R = 50;
    const rx = Math.abs(Math.cos(theta)) * R;
    const waxing = f < 0.5;
    const outerSweep = waxing ? 1 : 0;
    const innerSweep = waxing ? (f < 0.25 ? 0 : 1) : (f < 0.75 ? 0 : 1);

    const path = 'M 50,0 A 50,50 0 0 ' + outerSweep + ' 50,100 ' +
                 'A ' + rx.toFixed(2) + ',50 0 0 ' + innerSweep + ' 50,0 Z';
    return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true">' +
           '<circle cx="50" cy="50" r="49" class="moon-disc"/>' +
           '<path d="' + path + '" class="moon-lit"/>' +
           '<circle cx="50" cy="50" r="49" class="moon-ring"/></svg>';
  }
};

/* ---------- Rahat ---------- */

const Money = {
  toBase(money) {
    const coins = CONFIG.coins, r = CONFIG.coinRatio;
    return coins.reduce((sum, c, i) => sum + (money[c.key] || 0) * Math.pow(r, coins.length - 1 - i), 0);
  },

  fromBase(base) {
    const coins = CONFIG.coins, r = CONFIG.coinRatio;
    const out = {};
    let rest = Math.max(0, Math.round(base));
    coins.forEach((c, i) => {
      const unit = Math.pow(r, coins.length - 1 - i);
      out[c.key] = Math.floor(rest / unit);
      rest -= out[c.key] * unit;
    });
    return out;
  },

  unitOf(key) {
    const coins = CONFIG.coins;
    const i = coins.findIndex(c => c.key === key);
    return Math.pow(CONFIG.coinRatio, coins.length - 1 - i);
  },

  format(money) {
    const parts = CONFIG.coins
      .filter(c => (money[c.key] || 0) !== 0)
      .map(c => money[c.key] + ' ' + c.short);
    return parts.length ? parts.join('  ') : '0 ' + CONFIG.coins[CONFIG.coins.length - 1].short;
  },

  /** Alimman yksikön summa luettavana kolikkojonona. */
  formatBase(base) { return this.format(this.fromBase(base)); }
};

/* ---------- Päiväkirja ---------- */

const DayLog = {
  /** Hakee (tai luo) merkinnän annetulle päivälle. Kutsutaan updateDurable-lohkon sisältä. */
  entry(d, day) {
    let e = d.log.find(x => x.day === day);
    if (!e) {
      e = { day: day, date: Calendar.format(day), meals: null, lang: {}, spend: [] };
      d.log.push(e);
      d.log.sort((a, b) => a.day - b.day);
    }
    return e;
  },

  /* Osa kirjauksista syntyy heittosumman piirron yhteydessä, ja kirjoitus
     kertyvään dataan piirtää näkymän uudelleen. Vartija katkaisee kierron:
     sisempi kutsu kirjaisi saman tiedon uudelleen, joten se voidaan ohittaa. */
  writing: false,

  write(fn) {
    if (this.writing) return;
    this.writing = true;
    try { Store.updateDurable(fn); } finally { this.writing = false; }
  },

  /** Kirjaa tapahtuman kuluvalle päivälle. Muut näkymät kutsuvat tätä, jotta
      päiväkirja kertyy itsestään pelin aikana eikä sitä tarvitse täyttää käsin. */
  add(ev) {
    this.write(d => {
      const e = this.entry(d, d.day);
      if (!Array.isArray(e.events)) e.events = [];
      e.events.push(Object.assign({ at: Date.now() }, ev));
    });
  },

  /** Päivittää samalla avaimella kirjattua tapahtumaa, tai luo sen. Heittoketju
      kasvaa pala kerrallaan, eikä jokaisesta näppäilystä haluta omaa riviään. */
  update(key, ev) {
    this.write(d => {
      const e = this.entry(d, d.day);
      if (!Array.isArray(e.events)) e.events = [];
      const prev = e.events.find(x => x.key === key);
      if (prev) { Object.assign(prev, ev); return; }
      // Avaimeen on koodattu päivä, jona heitto tehtiin. Jos päivä on sen
      // jälkeen vaihtunut, ruudulle jäänyt heitto ei saa kirjautua uudelleen
      // uuden päivän tapahtumaksi.
      if (this.keyDay(key) !== d.day) return;
      e.events.push(Object.assign({ key: key, at: Date.now() }, ev));
    });
  },

  /** Yksittäinen toimenpide: vasemmalle selite, oikealle arvo. Tämä kattaa
      kaiken sen toiminnan jolla ei ole omaa erikoisrivinmuotoaan. */
  note(label, value) { this.add({ t: 'act', label: label, value: value || '' }); },

  /** Kerryttää saman päivän samaan riviin. Muona- ja rahanappeja painetaan
      monta kertaa peräkkäin, eikä jokainen painallus ansaitse omaa riviään. */
  bump(id, label, delta, fmt) {
    if (!delta) return;
    const key = 'acc-' + Store.durable.day + '-' + id;
    this.write(d => {
      const e = this.entry(d, d.day);
      if (!Array.isArray(e.events)) e.events = [];
      let prev = e.events.find(x => x.key === key);
      if (!prev) {
        prev = { key: key, t: 'act', label: label, delta: 0, fmt: fmt || '', at: Date.now() };
        e.events.push(prev);
      }
      prev.delta += delta;
    });
  },

  /** Tapahtuman oikean reunan teksti. Rahat ovat alinta yksikköä, joten ne
      näytetään kolikkoina eikä paljaana lukuna. */
  actValue(x) {
    if (x.delta === undefined) return x.value || '✓';
    if (x.fmt === 'money') return (x.delta > 0 ? '+' : '−') + Money.formatBase(Math.abs(x.delta));
    return signed(x.delta);
  },

  /** Avaimen muoto on "laji-päivä-aikaleima". */
  key(kind) { return kind + '-' + Store.durable.day + '-' + Date.now(); },
  keyDay(key) { return parseInt(String(key).split('-')[1], 10); },

  /** Osumapistemuutokset yhteen laskettuna: taistelu tuottaa niitä kymmeniä,
      eikä jokainen kuulu omalle rivilleen. */
  hpTotals(e) {
    return (e.events || []).filter(x => x.t === 'hp').reduce((acc, x) => {
      if (x.delta < 0) acc.lost += -x.delta; else acc.healed += x.delta;
      return acc;
    }, { lost: 0, healed: 0 });
  },

  events(e, type) {
    return (e.events || []).filter(x => x.t === type);
  },

  /** Onko merkinnässä mitään kirjattavaa? */
  isEmpty(e) {
    return (e.meals === null || e.meals === undefined) &&
           !Object.keys(e.lang || {}).length &&
           !(e.spend || []).length &&
           !(e.events || []).length;
  },

  langTotal(e) {
    return Object.keys(e.lang || {}).reduce((s, k) => s + e.lang[k], 0);
  },

  spendTotal(e) {
    return (e.spend || []).reduce((s, x) => s + x.base, 0);
  }
};

/* ---------- Näkymä ---------- */

const Adventure = {

  logExpanded: false,

  /** Muonalaskuri seuraa vain omia varoja: tavernassa syöty ateria ei vähennä
      sitä, joten teksti sanoo mistä ateria tuli. */
  mealText(n) {
    return n === 1 ? '1 ateria muonavaroista' : n + ' ateriaa muonavaroista';
  },

  init() {
    $('.day-actions').addEventListener('click', e => {
      const b = e.target.closest('button[data-advance]');
      if (!b) return;
      haptic();
      const meals = parseInt(b.dataset.advance, 10);
      Store.updateDurable(d => {
        const e2 = DayLog.entry(d, d.day);
        e2.meals = meals;
        d.food = Math.max(0, d.food - meals);
        d.day += 1;
        DayLog.entry(d, d.day);           // varataan uusi päivä valmiiksi
      });
      const left = Store.durable.food;
      toast(left <= CONFIG.food.lowWarning
        ? 'Päivä kului. Muona vähissä: ' + left + '.'
        : 'Päivä kului — muonavaroja jäljellä ' + left + '.');
    });

    $('#dayBack').addEventListener('click', () => {
      if (Store.durable.day <= (CONFIG.calendar.startTravelDay || 0)) return;
      haptic();
      Store.updateDurable(d => {
        const abandoned = d.log.find(x => x.day === d.day);
        if (abandoned && DayLog.isEmpty(abandoned)) d.log = d.log.filter(x => x !== abandoned);
        d.day -= 1;
        const e2 = d.log.find(x => x.day === d.day);
        if (e2 && e2.meals !== null && e2.meals !== undefined) {
          d.food += e2.meals;
          e2.meals = null;
        }
      });
      toast('Päivä peruttu — ateriat palautettu.');
    });

    $('#view-adventure').addEventListener('click', e => {
      const b = e.target.closest('button[data-food]');
      if (!b) return;
      haptic();
      const before = Store.durable.food;
      Store.updateDurable(d => { d.food = Math.max(0, d.food + parseInt(b.dataset.food, 10)); });
      DayLog.bump('food', 'Muonavarat', Store.durable.food - before);
    });

    $('#foodSet').addEventListener('change', e => {
      const v = numOf(e.target, null);
      if (v === null || !Number.isFinite(v)) return;
      Store.updateDurable(d => { d.food = Math.max(0, v); });
      e.target.value = '';
    });

    $('#coinList').addEventListener('click', e => {
      const b = e.target.closest('button[data-coin]');
      if (!b) return;
      haptic();
      const key = b.dataset.coin;
      const before = Money.toBase(Store.durable.money);
      Store.updateDurable(d => {
        d.money[key] = Math.max(0, (d.money[key] || 0) + parseInt(b.dataset.delta, 10));
      });
      // Käsin lisätty tai poistettu raha on yhtä lailla päivän tapahtuma kuin
      // ostos, vaikka sille ei ole selitettä.
      DayLog.bump('money', 'Rahaa käsin', Money.toBase(Store.durable.money) - before, 'money');
    });

    $('#coinNormalize').addEventListener('click', () => {
      haptic();
      Store.updateDurable(d => { d.money = Money.fromBase(Money.toBase(d.money)); });
      toast('Kolikot vaihdettu isompiin.');
    });

    $('#coinSpendToggle').addEventListener('click', () => {
      $('#spendBox').classList.toggle('hidden');
      if (!$('#spendBox').classList.contains('hidden')) $('#spendAmount').focus();
    });

    $('#spendLabels').addEventListener('click', e => {
      const b = e.target.closest('button[data-label]');
      if (!b) return;
      $('#spendNote').value = b.dataset.label;
      $$('#spendLabels .chip').forEach(c => c.classList.toggle('active', c === b));
    });

    $('#spendConfirm').addEventListener('click', () => {
      const amount = numOf($('#spendAmount'), 0);
      const tier = $('#spendTier').value;
      if (amount <= 0) { toast('Anna maksettava määrä.'); return; }
      const cost = amount * Money.unitOf(tier);
      const have = Money.toBase(Store.durable.money);
      if (cost > have) { toast('Rahat eivät riitä.'); return; }

      const label = $('#spendNote').value.trim();
      haptic();
      Store.updateDurable(d => {
        d.money = Money.fromBase(have - cost);
        DayLog.entry(d, d.day).spend.push({ base: cost, label: label, amount: amount, tier: tier });
      });
      $('#spendAmount').value = '';
      $('#spendNote').value = '';
      $$('#spendLabels .chip').forEach(c => c.classList.remove('active'));
      toast('Maksettu' + (label ? ' (' + label + ')' : '') + '. Jäljellä ' + Money.format(Store.durable.money) + '.');
    });

    $('#spendAmount').addEventListener('input', () => this.renderSpendHint());
    $('#spendTier').addEventListener('change', () => this.renderSpendHint());

    $('#langList').addEventListener('click', e => {
      const b = e.target.closest('button[data-lang]');
      if (!b) return;
      haptic();
      const key = langKey(b.dataset.lang, b.dataset.track);

      if (b.dataset.act === 'target') {
        const now = Store.durable.langTargets[key] || 0;
        const val = prompt('Montako tuntia tämä taso vaatii? 0 = ei tavoitetta. ' + langLabel(key), String(now));
        if (val === null) return;
        const num = parseInt(String(val).replace(',', '.'), 10);
        // Nolla on kelpo arvo: se poistaa tavoitteen kieliltä joissa opiskelu ei
        // ole kesken. Vain negatiivinen tai epäluku hylätään.
        if (!Number.isFinite(num) || num < 0) { toast('Anna tuntimäärä (0 = ei tavoitetta).'); return; }
        Store.updateDurable(d => { d.langTargets[key] = num; });
        toast(num ? langLabel(key) + ': tavoite ' + num + ' h.' : langLabel(key) + ': tavoite poistettu.');
        return;
      }

      if (b.dataset.act === 'rankup') {
        Store.updateDurable(d => {
          const before = d.langHours[key] || 0;
          d.langRanks[key] = (d.langRanks[key] || 0) + 1;
          d.langHours[key] = Math.max(0, before - (d.langTargets[key] || 0));
          // Talteen paljonko tunteja kului, jotta noston voi perua tarkasti
          // myös silloin kun tavoitetta on sen jälkeen muutettu.
          d.langUndo[key] = { hours: before - d.langHours[key], target: d.langTargets[key] || 0 };
        });
        DayLog.note('Kielitaso · ' + langLabel(key), 'nousi');
        toast(langLabel(key) + ': taso nousi. Aseta seuraavan tason tuntitavoite.');
        return;
      }

      if (b.dataset.act === 'rankdown') {
        const gained = Store.durable.langRanks[key] || 0;
        if (!gained) { toast('Tämä taso on lomakkeelta, eikä sitä voi laskea appissa.'); return; }
        const undo = Store.durable.langUndo[key];
        const back = undo ? undo.hours : (Store.durable.langTargets[key] || 0);
        if (!confirm('Perutaanko tasonnosto? ' + langLabel(key) +
                     (back ? ' — ' + back + ' h palautuu.' : ''))) return;
        Store.updateDurable(d => {
          d.langRanks[key] = gained - 1;
          d.langHours[key] = (d.langHours[key] || 0) + back;
          delete d.langUndo[key];
        });
        DayLog.note('Kielitaso · ' + langLabel(key), 'peruttu');
        toast(langLabel(key) + ': taso peruttu' + (back ? ', ' + back + ' h palautettu.' : '.'));
        return;
      }

      const hours = parseInt(b.dataset.hours, 10);
      Store.updateDurable(d => {
        const before = d.langHours[key] || 0;
        const after = Math.max(0, before + hours);
        d.langHours[key] = after;
        const e2 = DayLog.entry(d, d.day);
        e2.lang[key] = (e2.lang[key] || 0) + (after - before);
        if (!e2.lang[key]) delete e2.lang[key];
      });
    });

    $('#logMore').addEventListener('click', () => {
      this.logExpanded = !this.logExpanded;
      this.renderLog();
    });

    $('#logList').addEventListener('click', e => {
      const head = e.target.closest('.log-head');
      if (!head) return;
      head.parentElement.classList.toggle('open');
    });
  },

  render() {
    const d = Store.durable, c = Store.character;

    /* --- Päivämäärä ja kuu --- */
    const date = Calendar.fromIndex(d.day);
    $('#calDay').textContent = date.day;
    $('#calMonth').textContent = date.month;
    $('#calYear').textContent = date.year + '  ' + CONFIG.calendar.yearSuffix;
    $('#travelDay').textContent = d.day;
    $('#moonGraphic').innerHTML = Moon.svg(d.day, 58);
    $('#moonName').textContent = Moon.phaseName(d.day);
    $('#moonCycle').textContent = Moon.cycleDay(d.day) + '/' + CONFIG.moon.cycleDays +
      ' · ' + Math.round(Moon.illumination(d.day) * 100) + ' %';
    const ev = Moon.nextEvents(d.day);
    // Molemmat tapahtumat näkyvissä, jotta kuun suunnan näkee ilman laskemista.
    $('#moonCountdown').textContent = [
      ev.full === 0 ? 'Täysikuu tänään' : 'täysikuuhun ' + ev.full + ' pv',
      ev.newMoon === 0 ? 'Uusikuu tänään' : 'uusikuuhun ' + ev.newMoon + ' pv'
    ].join(' · ');

    /* --- Muona --- */
    $('#foodCount').textContent = d.food;
    const fill = $('#foodFill');
    fill.style.width = clamp(d.food / CONFIG.food.barMax * 100, 0, 100) + '%';
    fill.classList.toggle('low', d.food <= CONFIG.food.lowWarning);
    $('#foodDays').textContent = d.food === 0
      ? 'Muona loppu.'
      : 'Riittää ' + Math.floor(d.food / 2) + ' pv (2 ateriaa/pv) tai ' + d.food + ' pv (1 ateria/pv).';

    /* --- Rahat --- */
    const list = $('#coinList');
    list.innerHTML = '';
    CONFIG.coins.forEach(coin => {
      list.appendChild(el('li', { class: 'coin' }, [
        el('span', { class: 'coin-dot', style: 'background:' + coin.color }),
        el('span', { class: 'coin-name', text: coin.name }),
        el('button', { 'data-coin': coin.key, 'data-delta': '-1', class: 'coin-btn', text: '−' }),
        el('b', { class: 'coin-num', text: String(d.money[coin.key] || 0) }),
        el('button', { 'data-coin': coin.key, 'data-delta': '1', class: 'coin-btn', text: '+' })
      ]));
    });
    const base = Money.toBase(d.money);
    const lowest = CONFIG.coins[CONFIG.coins.length - 1];
    $('#coinTotal').textContent = Money.format(d.money) + '  (' + base + ' ' + lowest.short + ')';

    const tierSel = $('#spendTier');
    if (!tierSel.options.length) {
      CONFIG.coins.forEach(c2 => tierSel.appendChild(el('option', { value: c2.key, text: c2.name })));
      tierSel.value = CONFIG.coins[CONFIG.coins.length - 1].key;
    }
    const labels = $('#spendLabels');
    if (!labels.children.length) {
      CONFIG.spendLabels.forEach(l => labels.appendChild(el('button', { class: 'chip', 'data-label': l, text: l })));
    }
    this.renderSpendHint();

    /* --- Kielet --- */
    this.renderLanguages();

    this.renderLog();
  },

  /** Jokaisella kielellä on kaksi erillistä raitaa: puhe ja kirjoitus.
      Tuntitavoite on tasokohtainen ja muokattavissa, koska se kasvaa tason mukana. */
  renderLanguages() {
    const d = Store.durable, c = Store.character;
    const ll = $('#langList');
    ll.innerHTML = '';

    (c.languages || []).forEach(lang => {
      const rows = [];
      [['spoken', 'Puhe'], ['written', 'Kirjoitus']].forEach(pair => {
        const track = pair[0], label = pair[1];
        const key = langKey(lang.name, track);
        const base = track === 'spoken' ? lang.spoken : lang.written;
        const gained = d.langRanks[key] || 0;
        const hours = d.langHours[key] || 0;
        const target = d.langTargets[key] || 0;
        const full = target > 0 && hours >= target;
        const pct = target > 0 ? clamp(hours / target * 100, 0, 100) : 0;

        const quick = el('div', { class: 'quick-row tight' },
          CONFIG.language.quickAdd.map(h => el('button', {
            'data-lang': lang.name, 'data-track': track, 'data-hours': String(h), text: '+' + h + ' h'
          })).concat([
            el('button', { 'data-lang': lang.name, 'data-track': track, 'data-hours': '-1',
                           class: 'ghost', text: '−1 h' }),
            el('button', { 'data-lang': lang.name, 'data-track': track, 'data-act': 'target',
                           class: 'ghost', text: 'Tavoite' })
          ]).concat(gained ? [
            // Näkyy vain jos tasoa on nostettu appissa — lomakkeen tasoja ei
            // voi laskea täältä.
            el('button', { 'data-lang': lang.name, 'data-track': track, 'data-act': 'rankdown',
                           class: 'ghost', text: 'Peru taso' })
          ] : []));

        rows.push(el('div', { class: 'lang-track-row' + (full ? ' full' : '') }, [
          el('div', { class: 'lt-head' }, [
            el('span', { class: 'lt-label', text: label }),
            el('span', { class: 'lt-rank', text: 'taso ' + (base + gained) + (gained ? ' (+' + gained + ')' : '') }),
            el('span', { class: 'lt-hours' + (target ? '' : ' unset'),
                         text: target ? hours + ' / ' + target + ' h'
                                      : hours + ' h · aseta tavoite' })
          ]),
          el('div', { class: 'lang-track' }, [el('div', { class: 'lang-fill', style: 'width:' + pct + '%' })]),
          full
            ? el('button', { class: 'primary wide', 'data-lang': lang.name, 'data-track': track,
                             'data-act': 'rankup', text: 'Taso nousi → ' + (base + gained + 1) })
            : quick,
          full ? quick : el('span')
        ]));
      });

      ll.appendChild(el('li', { class: 'lang' }, [
        el('div', { class: 'lang-head' }, [
          el('span', { class: 'lang-name', text: lang.name }),
          el('span', { class: 'lang-rank', text: lang.study && lang.study.note ? lang.study.note : '' })
        ])
      ].concat(rows)));
    });
  },

  renderSpendHint() {
    const amount = numOf($('#spendAmount'), 0);
    const tier = $('#spendTier').value;
    if (!amount || !tier) { $('#spendHint').textContent = ''; return; }
    const cost = amount * Money.unitOf(tier);
    const after = Money.toBase(Store.durable.money) - cost;
    const lowest = CONFIG.coins[CONFIG.coins.length - 1];
    $('#spendHint').textContent = after < 0
      ? 'Ei riitä — puuttuu ' + (-after) + ' ' + lowest.short + '.'
      : 'Jäljelle jää ' + Money.formatBase(after) + '.';
  },

  renderLog() {
    const d = Store.durable;
    const entries = d.log.filter(e => !DayLog.isEmpty(e) || e.day === d.day).sort((a, b) => b.day - a.day);
    const shown = this.logExpanded ? entries : entries.slice(0, 5);

    const totals = d.log.reduce((acc, e) => {
      acc.meals += e.meals || 0;
      acc.lang += DayLog.langTotal(e);
      acc.spend += DayLog.spendTotal(e);
      return acc;
    }, { meals: 0, lang: 0, spend: 0 });
    $('#logSummary').textContent = (totals.meals === 1 ? '1 ateria' : totals.meals + ' ateriaa') +
      ' · ' + totals.lang + ' h · ' +
      Money.formatBase(totals.spend);

    const ul = $('#logList');
    ul.innerHTML = '';
    if (!shown.length) {
      ul.appendChild(el('li', { class: 'empty', text: 'Ei merkintöjä vielä.' }));
    }
    shown.forEach(e => {
      const isToday = e.day === d.day;
      const langTotal = DayLog.langTotal(e);
      const spendTotal = DayLog.spendTotal(e);

      const skills = DayLog.events(e, 'skill');
      const spells = DayLog.events(e, 'spell');
      const rolls = DayLog.events(e, 'roll');
      const fights = DayLog.events(e, 'fight');
      const acts = DayLog.events(e, 'act').filter(x => x.delta === undefined || x.delta !== 0);
      const hp = DayLog.hpTotals(e);

      const summary = [];
      if (e.meals !== null && e.meals !== undefined) {
        summary.push(e.meals === 0 ? 'paasto' : Adventure.mealText(e.meals));
      }
      if (skills.length) summary.push(skills.length + (skills.length === 1 ? ' taito' : ' taitoa'));
      if (spells.length) summary.push(spells.length + (spells.length === 1 ? ' loitsu' : ' loitsua'));
      if (fights.length || rolls.length) {
        summary.push((fights.length || 1) + ' taistelu' +
          (rolls.length ? ' · ' + rolls.length + (rolls.length === 1 ? ' heitto' : ' heittoa') : ''));
      }
      if (hp.lost) summary.push('−' + hp.lost + ' hp');
      if (acts.length) summary.push(acts.length + (acts.length === 1 ? ' toimi' : ' toimea'));
      if (langTotal) summary.push(langTotal + ' h opiskelua');
      if (spendTotal) summary.push(Money.formatBase(spendTotal));

      const details = el('div', { class: 'log-body' });
      // Kuun tila päivän tarkkuudella: vaihenimi yksin kattaa 3-4 päivää.
      details.appendChild(el('div', { class: 'log-row' }, [
        el('span', { text: 'Kuu' }),
        el('b', { text: Moon.cycleDay(e.day) + '/' + CONFIG.moon.cycleDays + ' · ' +
                        Math.round(Moon.illumination(e.day) * 100) + ' % · ' +
                        (Moon.waxing(e.day) ? 'kasvaa' : 'vähenee') })
      ]));
      if (langTotal) {
        Object.keys(e.lang).forEach(k => {
          details.appendChild(el('div', { class: 'log-row' }, [
            el('span', { text: langLabel(k) }), el('b', { text: '+' + e.lang[k] + ' h' })
          ]));
        });
      }
      (e.spend || []).forEach(sp => {
        details.appendChild(el('div', { class: 'log-row' }, [
          el('span', { text: sp.label || 'Ostos' }),
          el('b', { text: '−' + Money.formatBase(sp.base) })
        ]));
      });
      if (e.meals !== null && e.meals !== undefined) {
        details.appendChild(el('div', { class: 'log-row' }, e.meals === 0
          ? [el('span', { text: 'Paasto' }), el('b', { text: 'ei muonaa' })]
          : [el('span', { text: Adventure.mealText(e.meals) }), el('b', { text: '−' + e.meals })]));
      }

      // Pelin tapahtumat siinä järjestyksessä kuin ne kirjautuivat.
      skills.forEach(x => details.appendChild(el('div', { class: 'log-row' }, [
        el('span', { text: 'Taito · ' + x.name }),
        el('b', { text: fmtNum(x.total) })
      ])));
      spells.forEach(x => details.appendChild(el('div', { class: 'log-row' }, [
        el('span', { text: 'Loitsu · ' + x.name }),
        el('b', { text: '−' + x.pp + ' pp' })
      ])));
      rolls.forEach(x => details.appendChild(el('div', { class: 'log-row' }, [
        el('span', { text: (x.target === 'attack' ? 'Hyökkäys · ' : 'Puolustus · ') + x.name +
                           (x.round ? ' (kr ' + x.round + ')' : '') }),
        el('b', { text: fmtNum(x.total) })
      ])));
      if (hp.lost) details.appendChild(el('div', { class: 'log-row' }, [
        el('span', { text: 'Osumapisteitä menetetty' }), el('b', { text: '−' + hp.lost })
      ]));
      if (hp.healed) details.appendChild(el('div', { class: 'log-row' }, [
        el('span', { text: 'Osumapisteitä palautui' }), el('b', { text: '+' + hp.healed })
      ]));
      acts.forEach(x => details.appendChild(el('div', { class: 'log-row' }, [
        el('span', { text: x.label }),
        el('b', { text: DayLog.actValue(x) })
      ])));
      // Kuurivi on aina mukana, joten tyhjyys päätellään muista riveistä.
      if (details.children.length === 1) {
        details.appendChild(el('div', { class: 'log-row' }, [el('span', { text: 'Ei merkintöjä' }), el('b', { text: '—' })]));
      }

      ul.appendChild(el('li', { class: 'log-entry' + (isToday ? ' today' : '') }, [
        el('div', { class: 'log-head' }, [
          el('span', { class: 'log-day', text: 'Pv ' + e.day }),
          el('div', { class: 'log-main' }, [
            el('span', { class: 'log-date',
                         text: Calendar.formatShort(e.day) + ' · ' + Moon.short(e.day) +
                               (isToday ? ' · tänään' : '') }),
            el('span', { class: 'log-summary', text: summary.length ? summary.join(' · ') : 'ei merkintöjä' })
          ]),
          el('span', { class: 'sg-chev', text: '⌄' })
        ]),
        details
      ]));
    });

    const more = $('#logMore');
    more.classList.toggle('hidden', entries.length <= 5);
    more.textContent = this.logExpanded ? 'Näytä vain viimeiset päivät' : 'Näytä koko päiväkirja (' + entries.length + ' pv)';
  }
};
