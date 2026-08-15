import { useMemo, useState } from 'react';
import {
  MOOD_FACES,
  SEVERITY_LABEL,
  SYMPTOMS,
  TEMP_METHODS,
  symptomIcon,
} from '../domain/catalog';
import { formatTime, nowISO, toLocalInputValue, fromLocalInputValue } from '../domain/dates';
import { effectiveAgeMonths } from '../domain/ageGroups';
import { useActions, useStore } from '../store/store';
import type { Child, HealthEntry, Severity, TempMethod } from '../domain/types';
import { Sheet } from '../ui/Sheet';
import { MedicationSection } from './MedicationSection';

interface Props {
  entry: HealthEntry;
  child: Child;
  onClose: () => void;
}

/**
 * Schnelleingabe (PRD §4.2).
 *
 * Kernprinzip „Speichern zuerst, verfeinern danach": Der Eintrag existiert
 * bereits, wenn dieses Sheet aufgeht — er wurde beim Tap auf den Quick-Chip
 * angelegt. Alles hier ist optionale Ergänzung, jede Änderung schreibt sofort.
 * Wer wegwischt, verliert nichts. Das eliminiert die häufigste Ursache für
 * Datenlücken: das nachts um 1 Uhr abgebrochene Formular.
 */
export function QuickEntrySheet({ entry, child, onClose }: Props) {
  const { state, updateSettings } = useStore();
  const { updateEntry } = useActions();
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);

  // Der Eintrag aus dem Store ist die Wahrheit, nicht die Prop-Kopie.
  const live = state.entries.find((e) => e.id === entry.id) ?? entry;
  const ageMonths = effectiveAgeMonths(child);

  const availableSymptoms = useMemo(
    () => SYMPTOMS.filter((s) => (s.minMonths ?? 0) <= ageMonths),
    [ageMonths],
  );
  const visibleSymptoms = showAllSymptoms
    ? availableSymptoms
    : availableSymptoms.filter((s) => s.quick || live.symptoms.some((x) => x.code === s.code));

  const toggleSymptom = (code: string) => {
    const has = live.symptoms.some((s) => s.code === code);
    updateEntry(live.id, {
      symptoms: has
        ? live.symptoms.filter((s) => s.code !== code)
        : [...live.symptoms, { code, severity: 2 as Severity }],
    });
  };

  const setSeverity = (severity: Severity) => {
    updateEntry(live.id, { symptoms: live.symptoms.map((s) => ({ ...s, severity })) });
  };

  const setTemperature = (raw: string) => {
    const normalized = raw.replace(',', '.');
    const value = Number.parseFloat(normalized);
    updateEntry(live.id, {
      temperature: Number.isFinite(value) && value > 0 ? value : undefined,
    });
  };

  const setMethod = (method: TempMethod) => {
    updateEntry(live.id, { tempMethod: method });
    updateSettings({ lastTempMethod: method });
  };

  const currentSeverity = live.symptoms[0]?.severity ?? 2;
  const showMoodFace = ageMonths >= 36;

  return (
    <Sheet open onClose={onClose} title={undefined}>
      <div className="sheet__saved">
        <span aria-hidden>✓</span>
        <span>
          Eingetragen · {formatTime(live.at)}
          {live.symptoms.length > 0 && ' · '}
          {live.symptoms.length > 0 &&
            live.symptoms.map((s) => symptomIcon(s.code)).join(' ')}
        </span>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="temp">Temperatur (optional)</label>
        <input
          id="temp"
          className="input tabular"
          type="text"
          inputMode="decimal"
          placeholder="38,9"
          defaultValue={live.temperature != null ? String(live.temperature).replace('.', ',') : ''}
          onChange={(e) => setTemperature(e.target.value)}
          style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', minHeight: 64 }}
        />
        <div className="seg" style={{ marginTop: 'var(--space-2)' }}>
          {TEMP_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              className="seg__item"
              aria-pressed={(live.tempMethod ?? state.settings.lastTempMethod) === m.value}
              onClick={() => setMethod(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="small muted" style={{ marginTop: 6 }}>
          Die Messmethode wird mitgespeichert — Werte verschiedener Methoden sind nicht
          direkt vergleichbar.
        </p>
      </div>

      <div className="field">
        <span className="field__label">Symptome</span>
        <div className="seg">
          {visibleSymptoms.map((s) => (
            <button
              key={s.code}
              type="button"
              className="seg__item"
              aria-pressed={live.symptoms.some((x) => x.code === s.code)}
              onClick={() => toggleSymptom(s.code)}
            >
              {s.icon} {s.label}
            </button>
          ))}
          {!showAllSymptoms && (
            <button type="button" className="seg__item" onClick={() => setShowAllSymptoms(true)}>
              + weitere
            </button>
          )}
        </div>
      </div>

      {live.symptoms.length > 0 && (
        <div className="field">
          <span className="field__label">Stärke</span>
          <div className="seg">
            {([1, 2, 3] as Severity[]).map((sev) => (
              <button
                key={sev}
                type="button"
                className="seg__item"
                aria-pressed={currentSeverity === sev}
                onClick={() => setSeverity(sev)}
              >
                {SEVERITY_LABEL[sev]}
              </button>
            ))}
          </div>
        </div>
      )}

      {showMoodFace && (
        <div className="field">
          <span className="field__label">Wie fühlst du dich? (vom Kind)</span>
          <div className="seg">
            {MOOD_FACES.map((face, i) => (
              <button
                key={face}
                type="button"
                className="seg__item"
                aria-label={`Gefühl ${i + 1} von 5`}
                aria-pressed={live.moodFace === i + 1}
                onClick={() => updateEntry(live.id, { moodFace: (i + 1) as 1 | 2 | 3 | 4 | 5 })}
                style={{ fontSize: 22 }}
              >
                {face}
              </button>
            ))}
          </div>
        </div>
      )}

      <MedicationSection child={child} entryAt={live.at} />

      <div className="field">
        <label className="field__label" htmlFor="note">Notiz</label>
        <textarea
          id="note"
          className="textarea"
          placeholder="z. B. schlapp, will nicht trinken"
          defaultValue={live.note ?? ''}
          onChange={(e) => updateEntry(live.id, { note: e.target.value || undefined })}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="photo">Foto (bleibt auf dem Gerät)</label>
        <input
          id="photo"
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => updateEntry(live.id, { photo: String(reader.result) });
            reader.readAsDataURL(file);
          }}
        />
        {live.photo && (
          <img
            src={live.photo}
            alt="Angehängtes Foto"
            style={{ marginTop: 8, maxWidth: '100%', borderRadius: 'var(--radius-control)' }}
          />
        )}
      </div>

      <div className="field">
        <label className="row" style={{ gap: 'var(--space-2)' }}>
          <input
            type="checkbox"
            checked={!!live.febrileSeizure}
            onChange={(e) => updateEntry(live.id, { febrileSeizure: e.target.checked || undefined })}
            style={{ width: 22, height: 22 }}
          />
          <span>Fieberkrampf aufgetreten</span>
        </label>
        <p className="small muted" style={{ marginTop: 4 }}>
          Wird im Arzt-Export gesondert ausgewiesen.
        </p>
      </div>

      <details className="field">
        <summary className="field__label" style={{ cursor: 'pointer' }}>Zeitpunkt ändern</summary>
        <input
          className="input"
          type="datetime-local"
          value={toLocalInputValue(live.at)}
          max={toLocalInputValue(nowISO())}
          onChange={(e) => {
            if (e.target.value) updateEntry(live.id, { at: fromLocalInputValue(e.target.value) });
          }}
          style={{ marginTop: 8 }}
        />
      </details>

      <button type="button" className="btn btn--primary btn--block" onClick={onClose}>
        Fertig
      </button>
      <p className="small muted center" style={{ marginTop: 'var(--space-2)' }}>
        Alles ist bereits gespeichert.
      </p>
    </Sheet>
  );
}
