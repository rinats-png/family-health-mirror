import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * Datums- und Zeitfelder.
 *
 * Warum das eine eigene Komponente ist: Ein Datumsfeld, dessen `value` bei
 * jedem `change` aus dem Zustand zurückgeschrieben wird, verliert beim Tippen
 * Ziffern. Der Browser meldet jede Teileingabe als Änderung — nach der ersten
 * Ziffer des Tages steht dort bereits ein gültiges Datum. Die Anwendung
 * schreibt, React rendert, und React setzt dabei den Wert im DOM neu. Damit
 * verwirft der Browser seinen Zwischenstand für das gerade bearbeitete
 * Segment, und die zweite Ziffer beginnt von vorn.
 *
 * Nachgemessen im direkten Vergleich mit einem Feld ohne Anbindung, gleiche
 * Tastenfolge (Monat 08, Tag 10, Jahr 2026):
 *
 *     ohne Anbindung   2026-08-10   ← die Ziffernfolge kommt vollständig an
 *     mit Anbindung    2026-08-01   ← die zweite Ziffer des Tages fehlt
 *
 * Wer ein Datum tippt, landet dadurch auf einem anderen Tag als gewollt.
 *
 * Die Lösung: Das Feld wird von React nicht gesteuert. Der Startwert kommt
 * über `defaultValue`, und ein Wert von außen wird direkt am Element gesetzt —
 * aber nur, solange dort niemand tippt. React fasst den Wert nie an, der
 * Zwischenstand des Browsers bleibt erhalten.
 */
function Field({
  type,
  value,
  onCommit,
  id,
  min,
  max,
  className = 'input',
  label,
  style,
}: {
  type: 'date' | 'datetime-local';
  value: string;
  onCommit: (value: string) => void;
  id?: string;
  min?: string;
  max?: string;
  className?: string;
  label?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const focused = useRef(false);

  // Ein Wert von außen — etwa nach einem Kindwechsel oder einem Import — wird
  // direkt am Element gesetzt, nicht über React, und nur wenn das Feld nicht
  // gerade bearbeitet wird.
  useEffect(() => {
    const el = ref.current;
    if (el && !focused.current && el.value !== value) el.value = value;
  }, [value]);

  return (
    <input
      ref={ref}
      id={id}
      className={className}
      type={type}
      defaultValue={value}
      min={min}
      max={max}
      aria-label={label}
      style={style}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => {
        // Eine unvollständige Eingabe meldet der Browser als leere Zeichenkette.
        // Die wird verworfen — sonst stünde zwischendurch „kein Datum" im
        // Bestand, während der Nutzer noch tippt.
        if (e.target.value) onCommit(e.target.value);
      }}
      onBlur={(e) => {
        focused.current = false;
        // Unvollständig verlassen: zurück auf den zuletzt gültigen Wert.
        if (!e.target.value) e.target.value = value;
      }}
    />
  );
}

export function DateField(props: Omit<Parameters<typeof Field>[0], 'type'>) {
  return <Field {...props} type="date" />;
}

export function DateTimeField(props: Omit<Parameters<typeof Field>[0], 'type'>) {
  return <Field {...props} type="datetime-local" />;
}
