/* Sovelluksen käynnistys, näkymien vaihto ja datan lataus. */

const App = {

  view: 'battle',

  async start() {
    Store.load();

    // 1) Näytä heti jokin data: välimuisti tai dummy
    const cached = Store.cachedCharacter();
    if (CONFIG.data.source === 'sheets' && cached) {
      Store.setCharacter(cached, { cache: false });
    } else {
      Store.setCharacter(SEED_CHARACTER, { cache: false });
    }

    Battle.init();
    Adventure.init();
    Action.init();
    Magic.init();
    SheetView.init();
    this.initTabs();

    Store.onChange(() => this.render());
    this.render();

    // 2) Yritä tuoretta dataa taustalla
    if (CONFIG.data.source === 'sheets') this.refresh({ silent: true });

    this.registerServiceWorker();
  },

  initTabs() {
    $('#tabbar').addEventListener('click', e => {
      const b = e.target.closest('button[data-view]');
      if (!b) return;
      haptic();
      this.show(b.dataset.view);
    });

    $('#btnRefresh').addEventListener('click', () => this.refresh({}));
    $('#btnRefresh2').addEventListener('click', () => this.refresh({}));

    let saved = null;
    try { saved = localStorage.getItem('tm.view'); } catch (e) { /* ohitetaan */ }
    this.show(saved || 'battle');
  },

  show(view) {
    this.view = view;
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
    try { localStorage.setItem('tm.view', view); } catch (e) { /* ohitetaan */ }
    window.scrollTo({ top: 0 });
  },

  render() {
    const c = Store.character;
    if (!c) return;
    $('#topName').textContent = c.meta.name;
    $('#topSub').textContent = [c.meta.profession, 'taso ' + c.meta.level].filter(Boolean).join(' · ');
    Battle.render();
    Adventure.render();
    Action.render();
    Magic.render();
    SheetView.render();
  },

  async refresh(opts) {
    opts = opts || {};
    if (CONFIG.data.source !== 'sheets') {
      if (!opts.silent) toast('Lähtötietotila: data tulee tiedostosta js/seed-data.js.');
      return;
    }
    const btn = $('#btnRefresh');
    btn.classList.add('spinning');
    try {
      const data = await Sheets.fetchCharacter();
      if (!data.skills.length) throw new Error('Sheetistä ei löytynyt taitoja');
      Store.setCharacter(data, { cache: true });
      toast('Hahmodata päivitetty.');
    } catch (err) {
      console.error(err);
      if (!opts.silent) toast('Päivitys epäonnistui: ' + err.message);
      else if (!Store.cachedCharacter()) toast('Offline — käytössä esimerkkidata.');
    } finally {
      btn.classList.remove('spinning');
    }
  },

  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;
    navigator.serviceWorker.register('sw.js').catch(() => { /* ei kriittinen */ });
  }
};

document.addEventListener('DOMContentLoaded', () => App.start());
