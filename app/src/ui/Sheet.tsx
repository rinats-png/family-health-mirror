import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Bottom-Sheet mit Escape, Backdrop-Klick und Fokus-Rückgabe. */
export function Sheet({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  /*
   * `onClose` kommt aus dem Elternteil und ist dort bei jedem Rendern eine
   * neue Funktion. Stand es in der Abhängigkeitsliste, lief dieser Effekt bei
   * JEDER Zustandsänderung neu — also bei jedem getippten Zeichen, weil die
   * Felder im Blatt sofort schreiben. Der Effekt setzte dann den Fokus zurück
   * auf das Blatt und riss ihn damit aus dem Feld, in dem gerade getippt
   * wurde.
   *
   * Sichtbar wurde das an Datumsfeldern: Der Browser sammelt die Ziffern eines
   * Segments zwischen; verliert das Feld dazwischen den Fokus, ist der
   * Zwischenstand weg. Aus „Tag 10" wurde so „Tag 1". Gemessen gegen ein Feld
   * ohne Anbindung: 2026-08-10 dort, 2026-08-01 hier.
   *
   * Der Handler liegt deshalb in einer Ref, und der Effekt hängt nur noch am
   * Öffnen und Schließen.
   */
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      returnFocus.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <div className="sheet__grip" />
        {title && (
          <h2 style={{ fontSize: 19, marginBottom: 'var(--space-3)' }}>{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
