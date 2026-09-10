/* Pienet apufunktiot. */

const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const k in attrs) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
    }
  }
  (children || []).forEach(c => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return node;
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** Etumerkillinen numero: 5 -> "+5", -3 -> "−3" (typografinen miinus). */
function signed(n) {
  const v = Math.round(n);
  return v < 0 ? '−' + Math.abs(v) : '+' + v;
}

/** Numeerinen kenttä turvallisesti luvuksi. */
function numOf(input, fallback) {
  const v = parseInt(String(input && input.value !== undefined ? input.value : input).trim(), 10);
  return Number.isFinite(v) ? v : (fallback === undefined ? 0 : fallback);
}

/** Yksinkertainen normalisointi hakua ja puhetunnistusta varten. */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Kirjainparien joukko sumeaa vertailua varten. */
function bigrams(s) {
  const out = [];
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
  return out;
}

/** Karkea samankaltaisuus 0..1. Kestää suomen taivutusta kohtuullisesti,
    koska vertailu tehdään kirjainpareilla (Sørensen–Dice). */
function similarity(a, b) {
  const ca = norm(a).replace(/\s+/g, '');
  const cb = norm(b).replace(/\s+/g, '');
  if (!ca || !cb) return 0;
  if (ca === cb) return 1;
  if (cb.includes(ca) || ca.includes(cb)) return 0.92;

  const ba = bigrams(ca), bb = bigrams(cb);
  if (!ba.length || !bb.length) return 0;
  const pool = bb.slice();
  let hits = 0;
  ba.forEach(g => {
    const i = pool.indexOf(g);
    if (i >= 0) { hits++; pool.splice(i, 1); }
  });
  return 2 * hits / (ba.length + bb.length);
}

/** Kielen opiskeluraidan avain kertyvässä datassa. */
function langKey(name, track) { return name + '|' + track; }

/** "D'Hara|written" -> "D'Hara · kirjoitus" */
function langLabel(key) {
  const i = String(key).lastIndexOf('|');
  if (i < 0) return String(key);
  const track = key.slice(i + 1);
  return key.slice(0, i) + ' · ' + (track === 'written' ? 'kirjoitus' : 'puhe');
}

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function haptic() {
  if (navigator.vibrate) navigator.vibrate(8);
}
