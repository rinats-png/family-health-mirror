# CLAUDE.md — Design-System- und Figma-Integrationsregeln

Regeln für die Übernahme von Figma-Designs in dieses Repository (Figma MCP).
Ergänzt, nicht ersetzt: **[`REGULATORY.md`](REGULATORY.md)** hat Vorrang vor jeder
Design-Vorgabe.

---

## 0. Vorrangregel — vor jedem Import lesen

Dies ist ein **Dokumentationswerkzeug ohne Bewertungsfunktion**. Ein Figma-Design
kann eine regulatorische Grenze überschreiten, ohne dass eine Zeile Logik dazukommt
— eine Kachel mit der Aufschrift „Heutiger Gesundheitsstatus" ist bereits eine
Bewertungsaussage.

**Prüffrage vor der Umsetzung jedes Frames:**

> Zeigt dieser Screen eine Aussage, die nicht bereits vom Nutzer eingegeben wurde?

Wenn ja: **nicht bauen**, sondern beim Design rückfragen. Das gilt auch dann, wenn
der Frame technisch trivial und produktseitig attraktiv ist.

### 0.1 Konkrete Kollisionen mit dem ersten Design-Entwurf

Der ursprüngliche Design-Vorschlag (Kachel-Dashboard) enthält vier Elemente, die
heute **nicht mehr umsetzbar** sind. Falls sie in einer Figma-Datei auftauchen, sind
sie zu streichen, nicht zu übersetzen:

| Element im Entwurf | Verstoß | Ersatz |
|---|---|---|
| Kachel „Heutiger Gesundheitsstatus" (Smiley/Ampel) | Ausschluss #1 — von der App berechnete Gesamtbewertung | Liste der letzten Einträge, unbewertet |
| Kachel „Nächste Impfung in X Tagen" | Ausschluss #7 — Impfplan-Logik, Fälligkeit | Chronologische Liste eingetragener Impfungen |
| Kachel „Gewichtstrend ↗" | Ausschluss #2 — Trendbewertung | Perzentildiagramm ohne Kommentierung |
| Kachel „Letzte Krankheit vor X Tagen" | Prüffrage — „Krankheit" ist eine Einordnung des Eintrags | Letzte Einträge mit der vom Nutzer gewählten Kategorie |

**Was aus dem Entwurf gilt und umgesetzt ist:** das Kachelraster als
Schnelleingabe, die Farbhierarchie (mit der Korrektur aus 1.2), Listen- und
Kalenderansichten für Verläufe, und das Mantra **Eingabe in unter zehn Sekunden**.

### 0.2 Bildzeichen sind Aussagen

Ein Symbol trifft eine Aussage über die Zweckbestimmung wie jeder Text. Nicht
verwendbar sind deshalb: **EKG-/Herzschlagkurven** (Bildzeichen für
Vitalzeichen-Messung — die Anwendung misst nichts), Ampeln, Smileys als
Gesamtbewertung, Warndreiecke an Gesundheitsinhalten, Stethoskope oder
Kreuze in der Wortmarke.

Unbedenklich und verwendet: Herzkontur, Figurengruppe, Kalender, Stift.

### 0.3 Farbregel mit regulatorischer Wirkung

`--warning` (`#E88C2B`) und `--critical` (`#4E0401`) dürfen **niemals** einen
Gesundheitszustand kennzeichnen. Warnfarben implizieren eine Bewertung. Sie sind
ausschließlich UI-Zuständen vorbehalten: Löschbestätigung (`.btn--danger`),
Formularfehler, Prototyp-Hinweise (`.note--warn`).

Kommt aus Figma ein roter oder oranger Zustand an einem Messwert, einem Kalendertag
oder einem Eintrag, ist das ein Design-Fehler und kein Umsetzungsdetail.

---

## 1. Design-Tokens

### 1.1 Wo und in welchem Format

Einzige Quelle: **[`app/src/styles/tokens.css`](app/src/styles/tokens.css)** — reine
CSS Custom Properties auf `:root`. Es gibt **keine** Token-Pipeline (kein Style
Dictionary, kein Theo, keine JSON-Zwischenschicht) und bewusst auch keine
JS-Konstanten für Farben.

```css
:root {
  --brand: #ddc6b6;        /* Flächen, nie Text auf Weiß */
  --brand-soft: #f0e5dd;
  --brand-ink: #262223;    /* Text AUF --brand */

  --action: #16657e;       /* alle Bedienelemente */
  --action-hover: #0f4c5e;
  --action-soft: #e3f0f5;
  --accent: #65abc4;       /* nur dekorativ: Diagramme, Ränder */
  …
}
```

Themen laufen über Attribute am Wurzelelement, gesetzt in
[`app/src/App.tsx`](app/src/App.tsx):

```
:root                      → hell
:root[data-theme='dark']   → dunkel, gleiche Rollen, andere Werte
:root[data-night='true']   → ab 21 Uhr zusätzlich gedämpft, ohne Bewegung
```

**Regel:** Ein neuer Token wird in **allen drei** Blöcken gepflegt. Ein Token, der
nur im hellen Thema existiert, ist ein Bug.

### 1.2 Die Farbhierarchie

`#DDC6B6` ist die **Hauptfarbe der Anwendung**. Sie trägt den Hintergrundverlauf
jedes Bildschirms und die Marken-Flächen und ist damit durchgehend präsent.

Als Textfarbe oder Füllung eines Bedienelements ist sie dagegen nicht verwendbar:
Auf Weiß erreicht sie **1,64:1**, WCAG fordert 3:1 für Bedienelemente und 4,5:1 für
Text. Daraus ergibt sich keine Abschwächung der Marke, sondern eine Rollentrennung:

| Rolle | Token | Wert | Verwendung |
|---|---|---|---|
| Hauptfarbe, Flächen | `--brand` | `#DDC6B6` | Marken-Flächen, Symbolkreise, Herkunft des Verlaufs |
| Verlauf | `--bg-from` / `--bg-to` | `#F7E3CC` → `#E8CBA9` | Hintergrund jedes Bildschirms |
| Text darauf | `--brand-ink` | `#262223` | 9,61:1 auf `--brand` |
| Sekundärtext darauf | `--brand-muted` | `#54443A` | 5,66:1 auf `--brand` |
| Kante von Flächen | `--brand-line` | `#6B5039` | 4,80:1 gegen die Karte, 5,71:1 gegen den Verlauf |
| Trennlinie | `--brand-strong` | `#BC9C82` | Kante der Marken-Flächen |
| Karte, Blatt | `--surface` | `#BCA89B` | Hauptfarbe, 15 % abgedunkelt |
| Erhabene Fläche | `--surface-2` | `#CFBBAE` | Symbolkreise, aktive Pille, Eingabefelder |
| Handlung | `--action` | `#0D4353` | Buttons, Auswahlzustände, Fokusring |
| Akzent | `--accent` | `#65ABC4` | Diagramme, Ränder — **nie** als Textfarbe (2,38:1) |

**Warum die Kante eigene Aufmerksamkeit braucht — die wichtigste Lehre aus dem
Story-Entwurf:** Eine cremefarbene Karte erreicht gegen den warmen Verlauf nur
etwa **1,05:1**. Zwischen Karte und Hintergrund liegt praktisch kein
Helligkeitsunterschied; im Entwurf trägt allein der weiche Schatten die
Abgrenzung, und der verschwindet bei Sonnenlicht. Deshalb bekommt jede Fläche,
die auf dem Verlauf liegt — Karte, Kopfzeilen-Pille, Fußnavigation,
Symbolkreis — eine Kante in `--brand-line` mit mindestens 3:1 gegen **beide**
Seiten.

**Aktiver Zustand in der Fußnavigation** unterscheidet sich über eine gefüllte
Pille (`--brand-soft`), den Schriftschnitt (800 statt 600) **und** die Farbe —
nie über Farbe allein.

Kommt aus Figma ein Primärbutton in `#DDC6B6`, wird er auf `--action` gemappt und
die Abweichung im PR vermerkt.

#### Glas: halbtransparente Flächen

Karten, Kopfzeile, Fußnavigation und Blätter sind halbtransparent mit
`backdrop-filter`. Drei Regeln dazu:

1. **`--surface` ist der solide Wert und zugleich der Prüfmaßstab.** Das
   Komposit über dem Verlauf liegt bei `#C8B29F` bis `#CDB9A9`, also *heller*
   als der solide Wert — gegen den soliden zu rechnen ist die vorsichtige
   Variante.
2. **Kopfzeile und Fußnavigation nutzen `--chrome-glass` mit höherer Deckkraft**
   (0,88 statt 0,72). Dahinter scrollt Inhalt durch; bei niedriger Deckkraft
   könnte dunkler Text darunter das Komposit lokal absenken.
3. **Eingabefelder bleiben deckend.** Unschärfe hinter getipptem Text macht das
   Lesen schwerer, und genau dort zählt Genauigkeit.

Eine Fläche aus Glas grenzt sich nie über die Füllung ab — immer über
`--brand-line`.

#### Die Kontrastregel ist durchgesetzt, nicht dokumentiert

```bash
cd app && npm run check:contrast
```

Das Skript liest die Werte aus `tokens.css` — ein geänderter Token schlägt sofort
durch — und rechnet beide Themen gegen WCAG 2.1 nach. Es prüft zusätzlich zwei
Paare, die **scheitern müssen** (`--brand` und `--accent` als Text auf Weiß): Wenn
die plötzlich bestehen, hat jemand die Rollentrennung aufgelöst. Bricht bei
Verstoß mit Exit-Code 1 ab und gehört in die CI.

### 1.3 Nicht-Farb-Tokens

```css
--bg-from / --bg-to;                  /* Hintergrundverlauf aus der Hauptfarbe */
--radius-card: 28px;  --radius-tile: 20px;  --radius-control: 14px;  --radius-pill: 999px;
--space-1: 4px … --space-6: 32px;     /* 4-pt-Basis, 8-pt-Raster */
--tap: 48px;                          /* Mindest-Tap-Ziel, nicht unterschreiten */
--font: -apple-system, …;             /* Fließtext */
--font-display: 'Iowan Old Style', Palatino, Georgia, serif;   /* Titel */
--fs-base: 17px;
--shadow-tile;  --shadow-card;  --shadow-sheet;
```

**Der Hintergrund ist ein Verlauf**, kein Flächenton: `--bg-from` oben,
`--bg-to` unten, beide aus der Hauptfarbe abgeleitet. Prüfmaßstab für jeden
Text, der direkt darauf steht, ist immer der **tiefere** Ton `--bg-to`.

**Es gibt zwei Schriftfamilien.** `--font-display` ist eine Systemserife und
trägt Bildschirmtitel und Kartentitel; alles andere läuft in `--font`. Keine
Web-Font — jede externe Ressource ist wegen der Content-Security-Policy und des
Local-first-Versprechens ausgeschlossen (siehe 4.2).

### 1.4 Bekannte Lücke: Schriftgrößen

**Es gibt Schriftfamilien-Token, aber keine Schriftgrößen-Token.** Größen stehen als Literale in
[`global.css`](app/src/styles/global.css) und vereinzelt inline. Faktisch verwendete
Skala:

| Verwendung | Größe | Klasse |
|---|---|---|
| Bildschirmtitel | 34px/600, Serife | `.screen-title` |
| Kartentitel | 28px/600, Serife | `.storycard__title` |
| Kachelwert | 22px/700 | `.tile__value` |
| Blatt-Überschrift | 19px/600 | inline in `Sheet` |
| Fließtext | 17px | `--fs-base` |
| Untertitel, Listentitel | 15px | `.screen-sub`, `.list-item__title` |
| Sekundärtext | 13–14px | `.small`, `.list-item__meta`, `.field__label` |
| Rubriken | 11–12px/700, `letter-spacing: .08em`, `uppercase` | `.tile__label`, `.section__title` |
| Tab-Beschriftung | 10.5px | `.tabbar__item` |

**Wenn eine Figma-Datei Textstile mitbringt:** zuerst `--fs-…`-Token in `tokens.css`
anlegen, die Literale in `global.css` ersetzen, **dann** den Import bauen. Nicht
umgekehrt — sonst wandern Figma-Pixelwerte einzeln in Komponenten und die Skala
zerfällt.

### 1.5 Empfohlene Benennung in Figma

Figma-Variablen so benennen, dass sie 1:1 auf die CSS-Namen fallen — dann ist die
Übersetzung mechanisch und nicht interpretierend:

```
color/brand            → var(--brand)
color/brand/soft       → var(--brand-soft)
color/brand/ink        → var(--brand-ink)
color/action           → var(--action)
color/action/hover     → var(--action-hover)
color/surface          → var(--surface)
color/text/muted       → var(--text-muted)
radius/tile            → var(--radius-tile)
space/3                → var(--space-3)
```

Figma-Modi `light` / `dark` bilden `:root` und `:root[data-theme='dark']` ab. Für
`data-night` gibt es bewusst keinen Figma-Modus — das ist eine reine Laufzeitdämpfung
über vier Token.

---

## 2. Komponenten

### 2.1 Es gibt keine Komponentenbibliothek

Bewusste Entscheidung. Statt einer Bibliothek aus React-Komponenten gibt es:

1. **Zwei Primitive** in [`app/src/ui/`](app/src/ui/):
   - [`Sheet.tsx`](app/src/ui/Sheet.tsx) — Bottom-Sheet mit Escape, Backdrop-Klick,
     Fokusrückgabe, Scroll-Sperre
   - [`GrowthChart.tsx`](app/src/ui/GrowthChart.tsx) — SVG-Perzentildiagramm,
     zusätzlich als String-Builder für den PDF-Export
2. **Ein Klassensystem** in [`global.css`](app/src/styles/global.css), BEM-nah:
   `.block`, `.block__element`, `.block--modifier`
3. **Screens**, die diese Klassen direkt komponieren

Kein Storybook, keine Komponentendokumentation außer diesem Dokument.

**Konsequenz für Figma-Import:** Eine Figma-Komponente wird zu einer **CSS-Klasse**,
nicht zu einer React-Komponente. Eine neue React-Komponente ist erst gerechtfertigt,
wenn sie eigenen Zustand oder eigene Interaktionslogik hat (wie `Sheet`).

### 2.2 Vorhandene Bausteine — hier zuerst nachsehen

| Figma-Muster | Klasse | Datei |
|---|---|---|
| Story-Karte, wischbar | `.storycards` > `.storycard` > `.storycard__badge/__title/__meta/__art` | global.css |
| Seitenanzeige der Karten | `.dots` > `.dot[aria-current]` | global.css |
| Kachel | `.tile`, `.tile--wide`, `.tile--brand` + `.tile__label/__value/__meta` | global.css |
| Kachelraster | `.tiles` (2 Spalten) | global.css |
| Kategorie-Chips | `.chips` > `.chip` > `.chip__icon` | global.css |
| Liste als zusammenhängende Karte | `.list--grouped` + `.list-item__badge` | global.css |
| Button | `.btn` + `--primary/--ghost/--danger/--block/--sm` | global.css |
| Auswahlgruppe / Chips | `.seg` > `.seg__item[aria-pressed]` | global.css |
| Listenzeile | `.list` > `.list-item` > `.list-item__main/__title/__meta/__chevron` | global.css |
| Formularfeld | `.field` > `.field__label` + `.input`/`.textarea`/`.select` | global.css |
| Kalender | `.calendar`, `.calendar__grid`, `.day`, `.day__dots`, `.day__dot` | global.css |
| Jahresstreifen | `.year`, `.year__row`, `.year__strip`, `.year__cell` | global.css |
| Hinweisbox | `.note--info` / `--warn` / `--muted` | global.css |
| Leerzustand | `.empty` | global.css |
| Kopf-/Fußnavigation | `.topbar`, `.tabbar`, `.tabbar__item[aria-current]` | global.css |
| Toast mit Rückgängig | `.toast`, `.toast__action` | global.css |
| Pro-Kennzeichnung | `.pro-badge` | global.css |
| Zweckbestimmungs-Fußtext | `.disclaimer` | global.css |

**Glas-Tokens:** `--surface-glass`, `--chrome-glass`, `--glass-blur`,
`--glass-sheen` (heller Innenrand für den Glanz).

Hilfsklassen: `.row`, `.row--between`, `.row--wrap`, `.stack`, `.grow`, `.muted`,
`.small`, `.center`, `.tabular` (Ziffern mit fester Breite — für alle Messwerte und
Uhrzeiten verwenden).

### 2.3 Muster: Screen aus Klassen komponieren

```tsx
// app/src/screens/Today.tsx — verkürzt
<section className="quickbar" aria-labelledby="quick-title">
  <div className="tile__label" id="quick-title">{t('quickEntry')}</div>
  <div className="chips">
    {tiles.map((c) => (
      <button key={c.id} type="button" className="chip" onClick={() => create(c.id)}>
        <span className="chip__icon" aria-hidden>{c.icon}</span>
        <span>{categoryLabel(c, locale)}</span>
      </button>
    ))}
  </div>
</section>
```

**Regeln:**
- Interaktive Elemente sind `<button type="button">`, niemals `<div onClick>`.
- Zustand über ARIA: `aria-pressed` für Auswahl, `aria-current` für Navigation. Das
  CSS hängt an diesen Attributen, nicht an einer `.is-active`-Klasse.
- Rein dekorative Zeichen bekommen `aria-hidden`.

### 2.4 Wann Inline-Styles erlaubt sind

`style={{…}}` ist zulässig für **berechnete Einzelwerte** — Kategoriefarbe eines
Punkts, Balkenbreite, Abstandskorrektur. Für alles Wiederkehrende wird eine Klasse
angelegt.

```tsx
// erlaubt: Farbe kommt aus Nutzerdaten
<span className="day__dot" style={{ background: c }} />

// nicht erlaubt: fester Wert gehört in global.css
<div style={{ padding: 16, borderRadius: 16, background: '#fff' }} />
```

Ein **Farbliteral** in einer `.tsx`-Datei ist immer ein Fehler. Farbwerte stehen in
`styles/tokens.css` oder — wenn sie Daten sind, weil der Nutzer sie zugewiesen
bekommt — in `data/categories.ts` (`CATEGORY_PALETTE`, `CHILD_COLORS`). Einzige
Ausnahme ist `ui/GrowthChart.tsx`: Das SVG wird auch für den PDF-Druck in ein
fremdes Dokument serialisiert, wo CSS-Variablen nicht auflösen.

Prüfen lässt sich das mit einem Griff:

```bash
grep -rln '#[0-9a-fA-F]\{6\}' app/src --include=*.tsx   # erwartet: nur GrowthChart.tsx
```

---

## 3. Frameworks und Build

| Ebene | Wahl | Datei |
|---|---|---|
| UI | **React 19** mit TypeScript, function components, Hooks | — |
| Build | **Vite 8**, `base: './'` für Auslieferung unter Unterpfad | `app/vite.config.ts` |
| Zustand | React Context + `useState`, kein Redux/Zustand/Jotai | `app/src/store/store.tsx` |
| Routing | Tab-State in `App.tsx`, **kein Router** | `app/src/App.tsx` |
| Styling | ein globales Stylesheet, kein CSS-in-JS, keine Utility-Bibliothek | `app/src/styles/` |
| Linting | oxlint | `app/.oxlintrc.json` |
| Sprachprüfung | eigenes Skript, CI-tauglich | `app/scripts/check-wording.mjs` |

**Laufzeit-Abhängigkeiten: ausschließlich `react` und `react-dom`.** Das ist eine
harte Vorgabe, keine Momentaufnahme. Eine Figma-Umsetzung, die eine
Icon-Bibliothek, eine Chart-Bibliothek oder ein UI-Kit nachzieht, wird abgelehnt —
Diagramme werden als SVG von Hand gezeichnet (siehe `GrowthChart.tsx`).

Begründung: Die App verarbeitet Gesundheitsdaten von Kindern lokal. Jede
Drittabhängigkeit ist zusätzliche Angriffsfläche und ein potenzieller
Datenabfluss, der dem Versprechen „kein Server, keine Tracking-Bausteine"
widerspricht.

```bash
cd app
npm run dev             # Entwicklungsserver
npm run build           # tsc -b && vite build
npm run check:wording   # Wortliste DE/EN — bricht bei Verstoß ab
npm run lint
```

---

## 4. Assets

### 4.1 Drei getrennte Klassen

| Klasse | Ablage | Referenz |
|---|---|---|
| **App-Shell** (Icon, Manifest, Service Worker) | `app/public/` | absolut relativ zur Basis, z. B. `href="icon.svg"` |
| **Nutzerbilder** (Eintragsfoto, Impfpass-Seite, Profilbild) | Data-URL **in IndexedDB**, nie im Bundle | `<img src={entry.photo} />` |
| **Diagramme** | zur Laufzeit als SVG erzeugt | `ui/GrowthChart.tsx` |

### 4.2 Kein CDN, keine externen Ressourcen

Es gibt **keine** externe Ressource: keine Web-Font, kein Bild-CDN, kein
Analytics-Endpunkt. Die Schriftart ist der Systemstack (`--font`). Der Service
Worker cacht ausschließlich eigene Dateien.

**Beim Import aus Figma:** Exportierte Bitmaps sind fast immer ein Fehlgriff.
Symbole und Illustrationen werden als Inline-SVG oder — bei Kategorien — als Emoji
umgesetzt. Ein neues Bitmap im Repository braucht eine Begründung im PR.

### 4.3 Nutzerbilder im Umgang

```tsx
const reader = new FileReader();
reader.onload = () => updateEntry(live.id, { photo: String(reader.result) });
reader.readAsDataURL(file);
```

Diese Bilder verlassen das Gerät nie — auch nicht für den PDF-Export, der lokal
gerendert wird. Ein Figma-Design, das ein Bild-Upload-Ziel oder eine Galerie-URL
vorsieht, ist mit `REGULATORY.md` und der Datenschutzerklärung abzugleichen.

---

## 5. Icons

### 5.1 Emoji als Icon-System

Bewusst kein Icon-Font, kein SVG-Sprite, keine Icon-Bibliothek. Icons sind Emoji.

**Kategorie-Icons** — Daten, nicht Präsentation, weil der Nutzer eigene Kacheln
anlegen kann:

```ts
// app/src/data/categories.ts
export const BUILT_IN_CATEGORIES: BuiltInCategory[] = [
  { key: 'fever',  icon: '🌡️', color: '#65ABC4', label: { de: 'Fieber', en: 'Fever' } },
  { key: 'cough',  icon: '😷', color: '#8FBF9F', label: { de: 'Husten', en: 'Cough' } },
  …
];
```

**Navigations- und UI-Icons** — inline am Verwendungsort, weil einmalig:

```tsx
// app/src/App.tsx
{ id: 'today', label: t('navToday'), icon: '▣' }
```

### 5.2 Konventionen

- Icons sind **immer** `aria-hidden`; die Bedeutung trägt der danebenstehende Text
  oder ein `aria-label`.
- Ein Icon steht nie allein für eine Information — Farbe und Symbol sind nie die
  einzigen Träger.
- Größe über `font-size` (`.chip__icon` 22px, `.tabbar__icon` 19px), nicht über
  `width`/`height`.
- Neue Kategorie-Icons kommen nach `data/categories.ts`, nicht in eine Screen-Datei.

**Wenn Figma ein eigenes Icon-Set mitbringt:** Das ist eine
Architekturentscheidung, keine Umsetzungsaufgabe. Vorher klären, sonst entstehen
zwei parallele Systeme. Ein Wechsel auf Inline-SVG wäre vertretbar; eine
Icon-Font-Abhängigkeit nicht (siehe 3).

---

## 6. Styling

### 6.1 Methodik

Ein globales Stylesheet, BEM-nahe Benennung, Werte ausschließlich aus Token.
Keine CSS-Module, kein Styled Components, kein Tailwind.

```css
/* app/src/styles/global.css */
.tile {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-tile);
  padding: var(--space-4);
  box-shadow: var(--shadow-tile);
}
.tile--wide  { grid-column: 1 / -1; }
.tile--brand { background: var(--brand-soft); border-color: var(--brand); }
.tile__label { font-size: 11px; text-transform: uppercase; color: var(--text-muted); }
```

Einstieg: `global.css` importiert `tokens.css` in Zeile 1; `main.tsx` importiert nur
`global.css`.

### 6.2 Responsive

Die App ist **mobil-first mit fester Maximalbreite**, keine Breakpoint-Kaskade:

```css
.app    { max-width: 560px; margin: 0 auto; }
.tabbar { max-width: 560px; margin: 0 auto; }
```

Ein einziger Breakpoint (`min-width: 480px`) betrifft das Chip-Raster. Auf dem Desktop
läuft dieselbe Ansicht zentriert.

**Konsequenz:** Ein Figma-Desktop-Frame mit mehrspaltigem Layout passt nicht ins
Produkt. Vor der Umsetzung klären, ob eine echte Desktop-Ansicht gewollt ist — das
wäre eine Produktentscheidung, keine Design-Übernahme.

### 6.3 Barrierefreiheit — nicht verhandelbar

| Anforderung | Umsetzung |
|---|---|
| Tap-Ziel ≥ 48 dp | `--tap`, gesetzt auf `.btn`, `.input`, `.chip` (76px) |
| Kontrast WCAG AA | maschinell geprüft über `npm run check:contrast`, beide Themen |
| Fokus sichtbar | globaler `:focus-visible` mit 3px `--action` |
| Farbe nie allein | Kalendertage tragen Punkte **und** sind antippbar; der aktive Tab hat Füllung, Schriftschnitt und Farbe |
| Gleichnamige Bedienelemente | Jeder Karten-Button trägt ein `aria-label` mit der Kategorie — sonst heißen alle elf „+ Eintragen" |
| Dynamic Type | relative Größen, kein `overflow: hidden` an Textcontainern |
| Bewegung | `prefers-reduced-motion` und `data-night` schalten Animationen ab |

Ein Figma-Design mit 32px-Buttons oder hellem Text auf `--brand` wird nicht 1:1
umgesetzt.

### 6.4 Dunkles Thema

Kein separates Stylesheet. Nur die Token-Werte tauschen. Wenn ein Figma-Dark-Frame
eine andere **Struktur** hat als der helle, ist das ein Design-Fehler — die
Umsetzung kann das nicht abbilden, ohne die Token-Architektur zu verlassen.

---

## 7. Projektstruktur

```
family-health-mirror/
├── REGULATORY.md          ← Vorrang vor allem anderen
├── CLAUDE.md              ← dieses Dokument
├── store/                 ← Store-Texte DE/EN (von check:wording geprüft)
├── docs/                  ← Datenschutz, Marktanalyse, PRD, Screenshots
└── app/
    ├── scripts/check-wording.mjs
    ├── public/            ← icon.svg, manifest.webmanifest, sw.js
    └── src/
        ├── data/          ← Kategorien, Impfnamen, Referenzkurven
        ├── domain/        ← Fachlogik ohne DOM: Typen, Datum, Einheiten,
        │                    Perzentilrechnung, Export
        ├── db/            ← IndexedDB-Persistenz, AES-GCM-Verschlüsselung
        ├── i18n/          ← strings.ts (DE/EN), index.tsx (Provider)
        ├── screens/       ← ein Modul je Bildschirm
        ├── store/         ← Context über dem gesamten Zustand
        ├── ui/            ← Sheet, GrowthChart
        └── styles/        ← tokens.css, global.css
```

### 7.1 Schichtregeln

```
screens/  →  darf alles importieren
ui/       →  nur domain/, i18n/, data/
domain/   →  nur domain/, data/ — kein React, kein DOM
data/     →  nichts (reine Konstanten)
```

`domain/` und `data/` sind DOM-frei und wären bei einer Portierung nach React Native
unverändert übernehmbar. Diese Trennung nicht aufweichen.

### 7.2 Ein Bildschirm = eine Datei

`screens/Today.tsx`, `screens/History.tsx`, … Untergeordnete Blätter, die nur zu
einem Bildschirm gehören, liegen daneben (`EntrySheet.tsx`, `ExportSheet.tsx`) und
nicht in `ui/`.

### 7.3 Texte gehören nie in Screens

**Jeder** nutzersichtbare String kommt aus `i18n/strings.ts` über `t('key')`.

```tsx
const { t, locale } = useI18n();
<div className="section__title">{t('recentEntries')}</div>
```

Das ist nicht nur Übersetzungshygiene: `npm run check:wording` prüft ausschließlich
`i18n/` und `store/`. Ein Literal in einem Screen entzieht sich der Prüfung — die
Wortliste aus Abschnitt 5 der Aufgabenstellung wäre dort wirkungslos.

**Bei Figma-Import:** Alle Beschriftungen aus dem Frame zuerst als Schlüssel in
`strings.ts` anlegen — in **beiden** Sprachen — dann `npm run check:wording` laufen
lassen, dann den Screen bauen.

---

## 8. Ablauf für einen Figma-Import

1. **Frame gegen `REGULATORY.md` Abschnitt 3 prüfen.** Bewertende Elemente
   streichen, nicht übersetzen. Bei Zweifel: weglassen und rückfragen.
2. **Token abgleichen.** Neue Farbe, Radius oder Abstand? Erst `tokens.css` in allen
   drei Themenblöcken ergänzen.
3. **Vorhandene Klassen suchen** (Tabelle 2.2), bevor eine neue entsteht.
4. **Texte nach `i18n/strings.ts`**, DE und EN, dann `npm run check:wording`.
5. **Screen bauen**, Klassen komponieren, `aria-pressed`/`aria-current` für Zustände.
6. **Prüfen:** `npm run build && npm run lint && npm run check:wording && npm run check:contrast`.
7. **Im Browser ansehen** — inklusive dunklem Thema und englischer Oberfläche.
8. **Abweichungen vom Design im PR benennen**, insbesondere Kontrast- und
   Tap-Ziel-Korrekturen.

### 8.1 Was einen Import blockiert

- Bewertende Aussage im Frame → Abschnitt 0
- Warnfarbe an einem Gesundheitsinhalt → Abschnitt 0.2
- Neue Laufzeit-Abhängigkeit → Abschnitt 3
- Text direkt im Screen statt in `strings.ts` → Abschnitt 7.3
- Tap-Ziel unter 48 dp oder ein Farbpaar, das `check:contrast` reißt → 1.2, 6.3
- Nur eine Sprache geliefert → 7.3
