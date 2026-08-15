/**
 * Datenmodell nach PRD §5.3.
 *
 * Für den Prototyp liegen alle Entitäten in einem einzigen, versionierten
 * State-Dokument (siehe db/idb.ts). Das hält die Persistenz trivial, macht den
 * DSGVO-Vollexport zu einem JSON.stringify und ist die Vorstufe zur späteren
 * Ende-zu-Ende-Verschlüsselung: verschlüsselt wird dann genau dieses Dokument.
 * Für die Produktivversion mit vielen tausend Einträgen pro Kind gehört das
 * auf SQLite/SQLCipher mit Indizes umgestellt.
 */

export type ID = string;
/** YYYY-MM-DD */
export type ISODate = string;
/** Vollständiger ISO-Zeitstempel */
export type ISODateTime = string;

export type Sex = 'm' | 'f' | 'd';

/** Feldsatz, den jeder synchronisierbare Datensatz trägt (PRD §5.3). */
export interface SyncMeta {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  deviceId: string;
  /** Tombstone statt Hard-Delete, damit Löschungen synchronisierbar bleiben. */
  deleted?: boolean;
}

export interface Child extends SyncMeta {
  id: ID;
  name: string;
  birthDate: ISODate;
  sex?: Sex;
  /** Frühgeburt: aktiviert das korrigierte Alter bis 24 Monate (PRD P-05). */
  isPreterm: boolean;
  /** Schwangerschaftswoche bei Geburt, z. B. 34 */
  gestationalWeeks?: number;
  allergies: string[];
  color: string;
}

export type Severity = 1 | 2 | 3;

export type TempMethod = 'ear' | 'forehead' | 'rectal' | 'axillary' | 'oral';

export interface SymptomObservation {
  code: string;
  severity: Severity;
}

/** Ein Krankheits-/Symptomeintrag. Entsteht bereits beim Tap auf den Quick-Chip. */
export interface HealthEntry extends SyncMeta {
  id: ID;
  childId: ID;
  at: ISODateTime;
  symptoms: SymptomObservation[];
  temperature?: number;
  tempMethod?: TempMethod;
  note?: string;
  /** Foto als Data-URL. Bleibt im lokalen Store, wird nie hochgeladen. */
  photo?: string;
  /** Fieberkrampf — bewusst separat erfasst, weil ärztlich hoch relevant. */
  febrileSeizure?: boolean;
  /** Selbsteinschätzung des Kindes, 1 (schlecht) bis 5 (gut). */
  moodFace?: 1 | 2 | 3 | 4 | 5;
  episodeId?: ID;
}

export type MeasurementKind = 'weight' | 'height' | 'headCirc';

export interface Measurement extends SyncMeta {
  id: ID;
  childId: ID;
  at: ISODateTime;
  kind: MeasurementKind;
  /** kg bei weight, cm bei height/headCirc */
  value: number;
}

/**
 * Nutzergepflegtes Medikamenten-Preset.
 * Der Mindestabstand wird ausdrücklich vom Nutzer eingetragen — die App
 * schlägt keine Dosis und keinen Abstand vor (PRD §5.7, T-07).
 */
export interface MedPreset extends SyncMeta {
  id: ID;
  childId: ID;
  name: string;
  form: string;
  dose: string;
  minIntervalHours: number;
  /** Pharmazentralnummer, falls per Scan/Eingabe erfasst */
  pzn?: string;
}

export interface MedicationEvent extends SyncMeta {
  id: ID;
  childId: ID;
  at: ISODateTime;
  presetId?: ID;
  name: string;
  dose: string;
  episodeId?: ID;
}

export type FeedingKind = 'breast' | 'bottle' | 'solid';

export interface FeedingEntry extends SyncMeta {
  id: ID;
  childId: ID;
  at: ISODateTime;
  kind: FeedingKind;
  durationMin?: number;
  side?: 'l' | 'r';
  amountMl?: number;
  foodItem?: string;
  /** Erstkontakt mit einem Lebensmittel — macht Reaktionen rückverfolgbar. */
  isFirstContact?: boolean;
}

export type DiaperKind = 'urine' | 'stool' | 'both';

export interface DiaperEntry extends SyncMeta {
  id: ID;
  childId: ID;
  at: ISODateTime;
  kind: DiaperKind;
}

export interface SleepEntry extends SyncMeta {
  id: ID;
  childId: ID;
  /** Ein Eintrag pro Nacht, datiert auf den Morgen danach. */
  date: ISODate;
  quality: 1 | 2 | 3;
}

export interface VaccinationRecord extends SyncMeta {
  id: ID;
  childId: ID;
  /** Schlüssel aus dem STIKO-Datensatz, z. B. "6fach" */
  vaccineCode: string;
  doseNumber: number;
  date: ISODate;
  batch?: string;
  source: 'manual' | 'ocr';
  note?: string;
}

export interface CheckupRecord extends SyncMeta {
  id: ID;
  childId: ID;
  /** z. B. "U6" */
  checkupCode: string;
  date: ISODate;
  note?: string;
}

export interface MilestoneRecord extends SyncMeta {
  id: ID;
  childId: ID;
  milestoneCode: string;
  achievedDate: ISODate;
}

export interface Settings {
  activeChildId?: ID;
  theme: 'system' | 'light' | 'dark';
  /** Automatischer Nachtmodus ab 21 Uhr (PRD §4.2). */
  nightMode: boolean;
  /** Reihenfolge der Quick-Chips je Kind, lernt aus der Nutzung. */
  chipUsage: Record<string, number>;
  proUnlocked: boolean;
  onboarded: boolean;
  lastTempMethod: TempMethod;
}

export interface AppState {
  schemaVersion: number;
  deviceId: string;
  children: Child[];
  entries: HealthEntry[];
  measurements: Measurement[];
  medPresets: MedPreset[];
  medications: MedicationEvent[];
  feedings: FeedingEntry[];
  diapers: DiaperEntry[];
  sleep: SleepEntry[];
  vaccinations: VaccinationRecord[];
  checkups: CheckupRecord[];
  milestones: MilestoneRecord[];
  settings: Settings;
}

/** Aus Einträgen abgeleitet, nicht persistiert (PRD T-05). */
export interface Episode {
  id: string;
  childId: ID;
  start: ISODateTime;
  end: ISODateTime;
  entryIds: ID[];
  maxTemp?: number;
  symptomCodes: string[];
  dayCount: number;
  hadFever: boolean;
}
