#!/usr/bin/env node
/**
 * Rechnet die Farbpaare des Design-Systems gegen WCAG 2.1 nach.
 *
 * Die Werte werden aus src/styles/tokens.css gelesen, nicht hier dupliziert —
 * ein geänderter Token schlägt also sofort hier durch. Das ist der Grund für
 * dieses Skript: Die Hauptfarbe #99E1D9 ist auf hellem Grund als Text- und
 * Bedienelementfarbe unbrauchbar, und diese Grenze soll nicht davon abhängen,
 * dass jemand die Regel im Kopf hat.
 *
 * Grenzwerte: 4,5:1 für Text, 3:1 für Bedienelemente und große Schrift.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');

/** Liest die Tokens eines Blocks, z. B. `:root` oder `:root[data-theme='dark']`. */
function readTokens(selector) {
  const start = css.indexOf(selector + ' {');
  if (start === -1) throw new Error(`Block ${selector} nicht gefunden`);
  const body = css.slice(start, css.indexOf('}', start));
  const out = {};
  for (const [, name, value] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const hex = value.trim().match(/^#[0-9a-fA-F]{3,8}$/);
    if (hex) out[name] = hex[0];
  }
  return out;
}

const light = readTokens(':root');
const dark = { ...light, ...readTokens(":root[data-theme='dark']") };

function luminance(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const channels = h
    .slice(0, 6)
    .match(/../g)
    .map((pair) => parseInt(pair, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * [Beschreibung, Vordergrund-Token, Hintergrund-Token, Mindestverhältnis]
 * `#fff` und `#000` sind als Literale zugelassen, weil sie keine Token sind.
 */
const PAIRS = [
  // Text auf der Hauptfarbe — Kopfzeile, Fußnavigation, Schnelleingabe
  ['Haupttext auf der Hauptfarbe', 'brand-ink', 'brand', 4.5],
  ['Sekundärtext auf der Hauptfarbe', 'brand-muted', 'brand', 4.5],
  ['Haupttext auf brand-soft', 'brand-ink', 'brand-soft', 4.5],
  ['Sekundärtext auf brand-soft', 'brand-muted', 'brand-soft', 4.5],
  // Trennlinien sind keine Bedienelemente; verlangt ist nur Wahrnehmbarkeit.
  ['Trennlinie auf der Hauptfarbe', 'brand-strong', 'brand', 1.5],
  ['Kante einer Karte gegen ihre Fuellung', 'brand-line', 'surface', 3],
  ['Kante einer Karte gegen den Hintergrund', 'brand-line', 'bg-to', 3],
  ['Kante einer Karte gegen den hellen Hintergrundton', 'brand-line', 'bg-from', 3],
  ['Kante eines Symbolkreises auf der erhabenen Flaeche', 'brand-line', 'surface-2', 3],
  ['Aktiver Tab auf gefuellter Pille', 'action', 'surface-2', 4.5],
  // Es gibt bewusst KEIN Paar 'Karte gegen Hintergrund': Im hellen Thema
  // tragen beide dieselbe Hauptfarbe. Die Abgrenzung leistet allein die
  // Kante — geprüft in den drei brand-line-Paaren darüber.
  ['Trennlinie in der gruppierten Liste', 'border', 'surface', 1.2],

  // Text auf Flächen
  ['Haupttext auf Fläche', 'text', 'surface', 4.5],
  ['Haupttext auf dem Hintergrund', 'text', 'bg-to', 4.5],
  ['Sekundärtext auf Fläche', 'text-secondary', 'surface', 4.5],
  ['Gedämpfter Text auf Fläche', 'text-muted', 'surface', 4.5],
  ['Gedaempfter Text auf dem hellen Hintergrundton', 'text-muted', 'bg-from', 4.5],
  ['Gedaempfter Text auf dem Hintergrund', 'text-muted', 'bg-to', 4.5],
  ['Gedaempfter Text auf der erhabenen Flaeche', 'text-muted', 'surface-2', 4.5],

  // Bedienelemente
  ['Text auf der Wine-Ash-Fläche', 'ink-on', 'ink', 4.5],
  ['Wine-Ash-Fläche gegen den hellen Grund', 'ink', 'bg-to', 3],
  ['Wine-Ash-Fläche gegen den tiefen Grund', 'ink', 'bg-from', 3],
  ['Handlungsfarbe auf Fläche', 'action', 'surface', 4.5],
  ['Handlungsfarbe auf dem Hintergrund', 'action', 'bg-to', 4.5],
  ['Rand von Eingabefeldern auf Fläche', 'border-strong', 'surface', 3],
  ['Rand von Eingabefeldern auf dem Hintergrund', 'border-strong', 'bg-to', 3],

  // Hinweisfarben — ausschließlich UI-Zustände, nie Gesundheitsinhalte
  ['Warnton auf weichem Warnhintergrund', 'warning-ink', 'warning-soft', 4.5],
  ['Kritischer Ton auf weichem Hintergrund', 'critical', 'critical-soft', 4.5],
  ['Bestätigungston auf weichem Hintergrund', 'ok', 'ok-soft', 4.5],
];

/** Paare, die scheitern MÜSSEN — sie belegen, warum die Rollen getrennt sind. */
const MUST_FAIL = [
  ['Hauptfarbe als Text auf der hellsten Fläche', 'brand', 'surface-2', 4.5],
  ['Akzentfarbe als Text auf der hellsten Fläche', 'accent', 'surface-2', 4.5],
];

let failures = 0;

for (const [themeName, tokens] of [['hell', light], ['dunkel', dark]]) {
  console.log(`\n── Thema: ${themeName} ──`);
  for (const [label, fgName, bgName, min] of PAIRS) {
    const fg = tokens[fgName];
    const bg = tokens[bgName];
    if (!fg || !bg) {
      console.error(`FEHLT  Token ${!fg ? '--' + fgName : '--' + bgName} nicht definiert (${label})`);
      failures += 1;
      continue;
    }
    const value = contrast(fg, bg);
    const passed = value >= min;
    if (!passed) failures += 1;
    console.log(
      `${passed ? 'OK  ' : 'FAIL'}  ${value.toFixed(2).padStart(6)}:1  (min ${min})  ${label}`,
    );
  }
}

console.log('\n── Belege für die Rollentrennung (müssen scheitern) ──');
for (const [label, fgName, bgName, min] of MUST_FAIL) {
  const value = contrast(light[fgName], light[bgName]);
  const stillFails = value < min;
  if (!stillFails) {
    console.error(`FAIL  ${label} erreicht jetzt ${value.toFixed(2)}:1 — Rollentrennung prüfen.`);
    failures += 1;
  } else {
    console.log(`OK    ${value.toFixed(2).padStart(6)}:1  bleibt unter ${min} — ${label}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} Kontrastverstoß/-verstöße.`);
  process.exit(1);
}
console.log('\nAlle Farbpaare erfüllen die Vorgabe.');
