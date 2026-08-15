/**
 * Dekorative Linienzeichnung am Fuß der Story-Karten.
 *
 * Rein schmückend: `aria-hidden`, ohne Bezug zum Inhalt der Karte und ohne
 * eigene Farbe — sie erbt über `currentColor` die Farbe der Karte. Damit kann
 * sie auch nicht versehentlich einen Zustand kennzeichnen.
 */
export function CardArt({ variant }: { variant: number }) {
  const shapes = [
    // Hügel mit Sonne
    <g key="hills">
      <circle cx="150" cy="26" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 46 C 30 28, 52 44, 74 36 S 118 20, 146 40 S 186 46, 196 42"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
      <path
        d="M4 54 C 36 40, 64 56, 96 48 S 156 36, 196 52"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"
      />
    </g>,
    // Wolke mit Wellen
    <g key="waves">
      <path
        d="M118 26 a 11 11 0 0 1 21 -4 a 9 9 0 0 1 13 9 h -36 a 8 8 0 0 1 2 -5 z"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
      <path
        d="M4 42 q 18 -9 36 0 t 36 0 t 36 0 t 36 0 t 36 0"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
      <path
        d="M4 52 q 18 -9 36 0 t 36 0 t 36 0 t 36 0 t 36 0"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray="3 5" opacity="0.7"
      />
    </g>,
    // Blattranke
    <g key="leaves">
      <path
        d="M8 52 C 48 52, 78 40, 100 24 S 158 8, 192 20"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
      <path d="M64 44 q 10 -12 22 -6 q -8 12 -22 6 z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M108 26 q 12 -11 23 -3 q -10 11 -23 3 z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M148 18 q 12 -9 22 -1 q -10 10 -22 1 z" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
    </g>,
  ];

  return (
    <svg className="storycard__art" viewBox="0 0 200 60" aria-hidden focusable="false" preserveAspectRatio="none">
      {shapes[variant % shapes.length]}
    </svg>
  );
}
