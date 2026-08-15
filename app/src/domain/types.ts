/**
 * Datenmodell.
 *
 * Leitsatz (siehe REGULATORY.md): Gespeichert wird ausschließlich, was der
 * Nutzer eingegeben hat. Es gibt in diesem Modell bewusst kein Feld, das eine
 * von der Anwendung erzeugte Bewertung, Einstufung, Fälligkeit oder Ableitung
 * aufnehmen könnte. Wer ein solches Feld ergänzen will, muss zuerst die
 * Prüffrage aus REGULATORY.md beantworten.
 */

export type ID = string;
/** YYYY-MM-DD */
export type ISODate = string;
export type ISODateTime = string;

export type Sex = 'f' | 'm' | 'x';

export type Locale = 'de' | 'en';

export type WeightUnit = 'kg' | 'lb';
export type LengthUnit = 'cm' | 'in';
export type TempUnit = 'C' | 'F';

export interface SyncMeta {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  deleted?: boolean;
}

export interface Child extends SyncMeta {
  id: ID;
  name: string;
  birthDate: ISODate;
  /** Nur für die Auswahl der geschlechtsspezifischen Referenzkurve. */
  sex?: Sex;
  /** Data-URL, bleibt auf dem Gerät. */
  photo?: string;
  color: string;
}

/**
 * Eine Schnelleintrags-Kachel und zugleich die Kategorie eines Eintrags.
 * Farbe und Bezeichnung wählt der Nutzer — nicht die Anwendung.
 */
export interface Category extends SyncMeta {
  id: ID;
  /** Schlüssel der mitgelieferten Kacheln; bei eigenen Kacheln leer. */
  builtInKey?: string;
  /** Vom Nutzer vergebener Name; überschreibt die mitgelieferte Bezeichnung. */
  customLabel?: string;
  icon: string;
  color: string;
  /** Reihenfolge auf dem Startbildschirm. */
  order: number;
  hidden?: boolean;
}

export interface MedicationDetail {
  /** Freier Text. Es gibt keine Wirkstoffdatenbank. */
  name: string;
  /** Freier Text, z. B. „5 ml". Es findet keine Berechnung statt. */
  amount: string;
}

/** Ein Tagebucheintrag. */
export interface Entry extends SyncMeta {
  id: ID;
  childId: ID;
  at: ISODateTime;
  categoryIds: ID[];
  note?: string;
  /** Vom Nutzer gemessen und eingetragen. Wird nirgends eingestuft. */
  temperature?: number;
  temperatureUnit?: TempUnit;
  /** Data-URL, bleibt auf dem Gerät. */
  photo?: string;
  tags: string[];
  medication?: MedicationDetail;
}

export type MeasurementKind = 'weight' | 'length' | 'headCircumference';

export interface Measurement extends SyncMeta {
  id: ID;
  childId: ID;
  date: ISODate;
  kind: MeasurementKind;
  /** Immer in der Basiseinheit gespeichert: kg bzw. cm. */
  value: number;
}

/**
 * Erinnerung mit vom Nutzer gewähltem Text und Zeitpunkt.
 * Die Anwendung schlägt keinen Zeitpunkt vor und errechnet keinen.
 */
export interface Reminder extends SyncMeta {
  id: ID;
  childId?: ID;
  at: ISODateTime;
  text: string;
  doneAt?: ISODateTime;
}

/** Eine stattgefundene, vom Nutzer eingetragene Impfung. */
export interface VaccinationRecord extends SyncMeta {
  id: ID;
  childId: ID;
  date: ISODate;
  /** Freier Text oder Eintrag aus der statischen Namensliste. */
  name: string;
  batch?: string;
  practice?: string;
  note?: string;
}

/** Abfotografierte Seite des Impfpasses. */
export interface PassPhoto extends SyncMeta {
  id: ID;
  childId: ID;
  image: string;
  caption?: string;
}

export interface Settings {
  activeChildId?: ID;
  locale: Locale;
  theme: 'system' | 'light' | 'dark';
  nightMode: boolean;
  pro: boolean;
  weightUnit: WeightUnit;
  lengthUnit: LengthUnit;
  temperatureUnit: TempUnit;
  /** Gewählte Referenzsammlung für die Perzentilendarstellung. */
  growthReferenceId: string;
  onboarded: boolean;
  /** App-Sperre aktiv (Entsperrung über Passwort). */
  lockEnabled: boolean;
}

export interface AppState {
  schemaVersion: number;
  children: Child[];
  categories: Category[];
  entries: Entry[];
  measurements: Measurement[];
  reminders: Reminder[];
  vaccinations: VaccinationRecord[];
  passPhotos: PassPhoto[];
  settings: Settings;
}
