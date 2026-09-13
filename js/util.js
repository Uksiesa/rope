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

/** Numero näytölle: typografinen miinus, ei ASCII-viiva. */
function fmtNum(n) { return String(n).replace('-', '−'); }

/* ---------- Negatiivinen modi ----------
   iPhonen numeronäppäimistössä ei ole miinusmerkkiä, joten modikentän vieressä on
   etumerkkinappi. Kenttä näyttää luvun itseisarvona ja nappi etumerkin; napin voi
   painaa ennen tai jälkeen luvun kirjoittamisen. */

/** Modikentän arvo etumerkkeineen. */
function modValue(input) {
  const v = numOf(input, 0);
  return input && input.dataset.neg === '1' ? -Math.abs(v) : v;
}

/** Päivittää napin ulkoasun kentän etumerkin mukaan. */
function syncSignButton(button, input) {
  const neg = input.dataset.neg === '1';
  button.textContent = neg ? '−' : '+';
  button.classList.toggle('negative', neg);
  button.setAttribute('aria-label', neg ? 'Modi negatiivinen' : 'Modi positiivinen');
}

/** Kytkee etumerkkinapin kenttään. onChange kutsutaan aina muutoksen jälkeen. */
function bindSignToggle(button, input, onChange) {
  syncSignButton(button, input);
  button.addEventListener('click', () => {
    const typed = numOf(input, null);
    const neg = input.dataset.neg === '1';
    input.dataset.neg = neg ? '0' : '1';
    if (Number.isFinite(typed)) input.value = String(Math.abs(typed));
    syncSignButton(button, input);
    haptic();
    if (onChange) onChange();
  });
  // Työpöydällä voi kirjoittaa miinuksen suoraan: siirretään se napin tilaan.
  input.addEventListener('input', () => {
    const typed = numOf(input, null);
    if (Number.isFinite(typed) && typed < 0) {
      input.dataset.neg = '1';
      input.value = String(Math.abs(typed));
      syncSignButton(button, input);
    }
  });
}

/** Tyhjentää kentän ja palauttaa etumerkin positiiviseksi. */
function resetSign(button, input) {
  input.value = '';
  input.dataset.neg = '0';
  syncSignButton(button, input);
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

/* ---------- Avoin heitto ---------- */

/** Ketjun suunnan määrää ensimmäinen heitto: matala aloitus vähentää, muut lisäävät. */
function rollDirection(rolls) {
  const low = CONFIG.openEnded.low;
  return (rolls.length && low > 0 && rolls[0] <= low) ? -1 : 1;
}

/** Onko heitto sellainen, että RoleMasterissa heitetään uudelleen? */
function isOpenEnded(value) {
  const oe = CONFIG.openEnded;
  return value >= oe.high || (oe.low > 0 && value <= oe.low);
}

/** Ketjun yhteisarvo, esim. [98, 43] -> 141 ja [3, 67] -> -64. */
function rollChainTotal(rolls) {
  const dir = rollDirection(rolls);
  return rolls.reduce((sum, r, i) => sum + (i === 0 ? r : dir * r), 0);
}

/** Ketju luettavana tekstinä: "98 + 43" tai "3 − 67". */
function rollChainText(rolls) {
  const sign = rollDirection(rolls) < 0 ? ' − ' : ' + ';
  return rolls.map((r, i) => (i === 0 ? fmtNum(r) : sign + r)).join('');
}

/** Piirtää heittoketjun ja jatkonapin. Nappi näkyy vasta kun kentässä on heitto,
    ja korostuu kun heitto on avoin. */
function renderRollChain(container, chain, pending) {
  const hasPending = Number.isFinite(pending);
  const rolls = chain.concat(hasPending ? [pending] : []);
  container.innerHTML = '';
  if (!rolls.length) { container.classList.add('hidden'); return; }
  container.classList.remove('hidden');

  if (rolls.length > 1) {
    container.appendChild(el('span', { class: 'chain-text',
      text: rollChainText(rolls) + ' = ' + fmtNum(rollChainTotal(rolls)) }));
  }
  if (hasPending) {
    const open = isOpenEnded(rolls[rolls.length - 1]);
    container.appendChild(el('button', {
      class: 'chain-add' + (open ? ' open' : ''),
      'data-addroll': '1',
      text: open ? '+ avoin heitto' : '+ heitto'
    }));
  }
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
