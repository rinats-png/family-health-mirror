#!/usr/bin/env node
/**
 * Prüft die Wortliste aus der Aufgabenstellung (Abschnitt 5) gegen alle
 * nutzersichtbaren Zeichenketten.
 *
 * Die Liste erzeugt regulatorisches Risiko allein durch Formulierung — deshalb
 * ist sie hier maschinell durchgesetzt und nicht bloß dokumentiert. Der Lauf
 * gehört in die CI; ein Treffer bricht den Build.
 *
 * Geprüft wird `src/i18n/strings.ts` (alle Oberflächentexte) sowie die
 * Store-Texte unter `store/`. Quellcode-Kommentare stehen bewusst außen vor:
 * Sie sind nicht nutzersichtbar und müssen die verbotenen Begriffe benennen
 * dürfen, um zu erklären, warum sie verboten sind.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Verbotene Begriffe als Wortgrenzen-Muster, DE und EN. */
const FORBIDDEN = [
  ['Diagnose', /\bdiagnos(e|en|tik)\b/i],
  ['diagnosis', /\bdiagnos(is|es|tic)\b/i],
  ['Befund', /\bbefund(e|es)?\b/i],
  ['finding', /\bfindings?\b/i],
  ['Symptom', /\bsymptom(e|en|s)?\b/i],
  ['Gesundheitsstatus', /\bgesundheitsstatus\b/i],
  ['health status', /\bhealth status\b/i],
  ['Score', /\bscores?\b/i],
  ['Normbereich', /\bnormbereich\b/i],
  ['normal range', /\bnormal range\b/i],
  ['auffällig', /\bauffällig(e|er|es|en)?\b/i],
  ['unauffällig', /\bunauffällig(e|er|es|en)?\b/i],
  ['abnormal', /\babnormal\b/i],
  ['überwachen', /\büberwach(en|ung|t)\b/i],
  ['Monitoring', /\bmonitor(ing|s|ed)?\b/i],
  ['empfohlen', /\bempfohlen(e|er|es)?\b/i],
  ['Empfehlung', /\bempfehlung(en)?\b/i],
  ['empfehlen', /\b(empfehlen|empfiehlt|empfahl)\b/i],
  ['recommended', /\brecommend(ed|s|ation|ations)?\b/i],
  ['sollten Sie', /\bsollten sie\b/i],
  ['you should', /\byou should\b/i],
  ['erkennt', /\berkennt\b/i],
  ['analysiert', /\banalysiert\b/i],
  ['wertet aus', /\bwertet aus\b/i],
  ['detects', /\bdetects?\b/i],
  ['analyses', /\banalys(e|es|is|ed)\b/i],
  ['assesses', /\bassess(es|ment|ed)?\b/i],
  ['Therapie', /\btherapie\b/i],
  ['therapy', /\btherapy\b/i],
];

/**
 * Sätze, in denen ein verbotener Begriff bewusst und korrekt vorkommt: die
 * Verneinung in der Zweckbestimmung. „stellt keine Diagnosen" muss erlaubt
 * sein, „Diagnose" als Feldbezeichnung nicht.
 */
const ALLOWED_NEGATIONS = [
  /stellt keine diagnosen/i,
  /makes no diagnoses/i,
  /keine ärztliche bewertung/i,
  /no medical assessment/i,
  /bewertet die eingegebenen daten nicht/i,
  /bewertet die einträge nicht/i,
  /does not assess/i,
  /ersetzt keine ärztliche untersuchung, beratung oder behandlung/i,
  /does not replace medical examination, consultation or treatment/i,
  /gibt\s+keine handlungsempfehlungen/i,
  /gives no advice on what to do/i,
  /trifft keine medizinischen aussagen/i,
  /makes no medical statements/i,
  /keine auswertung/i,
  /no analysis/i,
  /no classification of measured values/i,
];

function collectFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) collectFiles(full, out);
    else if (/\.(ts|tsx|md)$/.test(name)) out.push(full);
  }
  return out;
}

/** Nur Zeichenkettenliterale prüfen — Kommentare und Bezeichner sind egal. */
function extractStrings(source) {
  const out = [];
  const pattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const lineNumber = source.slice(0, match.index).split('\n').length;
    out.push({ text: match[2], lineNumber });
  }
  return out;
}

/** Zeilen innerhalb von ```-Blöcken, mit ihrer Zeilennummer. */
function fencedBlockLines(source) {
  const out = [];
  let inside = false;
  source.split('\n').forEach((text, index) => {
    if (text.trimStart().startsWith('```')) {
      inside = !inside;
      return;
    }
    if (inside) out.push({ text, lineNumber: index + 1 });
  });
  return out;
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

const targets = [
  join(root, 'src', 'i18n'),
  join(root, '..', 'store'),
].filter((p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
});

let failures = 0;

for (const dir of targets) {
  for (const file of collectFiles(dir)) {
    const raw = readFileSync(file, 'utf8');
    const isMarkdown = file.endsWith('.md');
    // In Markdown zählt nur, was in einem Codeblock steht: Das ist die Copy,
    // die tatsächlich im Store erscheint. Der umgebende Fließtext ist interne
    // Anleitung und muss die verbotenen Begriffe nennen dürfen, um sie zu
    // verbieten.
    const candidates = isMarkdown ? fencedBlockLines(raw) : extractStrings(stripComments(raw));

    for (const { text, lineNumber } of candidates) {
      if (ALLOWED_NEGATIONS.some((re) => re.test(text))) continue;
      for (const [label, pattern] of FORBIDDEN) {
        if (pattern.test(text)) {
          console.error(
            `${file}:${lineNumber}  verbotener Begriff „${label}"\n    ${text.trim().slice(0, 140)}`,
          );
          failures += 1;
        }
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} Verstoß/Verstöße gegen die Wortliste (Aufgabenstellung Abschnitt 5).`);
  process.exit(1);
}

console.log('Wortliste eingehalten: keine verbotenen Begriffe in Oberflächen- und Store-Texten.');
