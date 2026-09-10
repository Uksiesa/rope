/* Service worker: appin tiedostot välimuistiin, jotta offline-käyttö onnistuu.

   Kun julkaiset muutoksia, kasvata SEKÄ tämän CACHE-numeroa ETTÄ index.html:n
   ?v=-parametreja. CACHE hoitaa service workerin välimuistin, ?v= selaimen oman
   HTTP-välimuistin — ilman jälkimmäistä puhelin voi näyttää vanhaa koodia. */

const CACHE = 'totuus-v5';

const SHELL = [
  '.',
  'index.html',
  'css/style.css',
  'js/config.js',
  'js/seed-data.js',
  'js/util.js',
  'js/store.js',
  'js/sheets.js',
  'js/modes/battle.js',
  'js/modes/adventure.js',
  'js/modes/action.js',
  'js/modes/magic.js',
  'js/modes/sheet.js',
  'js/app.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Google Sheets: aina verkosta, ei välimuistiin (data välimuistitetaan localStorageen).
  if (req.url.includes('docs.google.com')) return;

  // Appin omat tiedostot: välimuisti ensin, päivitä taustalla.
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
