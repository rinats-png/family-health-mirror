import { useState } from 'react';
import { formatTime } from '../domain/dates';
import { useActions, useStore } from '../store/store';
import type { Child } from '../domain/types';

/**
 * Medikamenten-Gabe mit Sperr-Timer (PRD T-06, T-07).
 *
 * Regulatorisch entscheidend (PRD §5.7): Die App schlägt weder Präparat noch
 * Dosis noch Mindestabstand vor. Alle drei Werte stammen aus dem Preset, das
 * die Eltern selbst angelegt haben — die App rechnet ausschließlich eine
 * Uhrzeit aus einer vom Nutzer eingetragenen Stundenzahl.
 */
export function MedicationSection({ child, entryAt }: { child: Child; entryAt: string }) {
  const { state } = useStore();
  const { addMedication, addMedPreset, removeMedPreset } = useActions();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', form: 'Saft', dose: '', minIntervalHours: 6 });

  const presets = state.medPresets.filter((p) => p.childId === child.id && !p.deleted);
  const given = state.medications
    .filter((m) => m.childId === child.id && !m.deleted)
    .sort((a, b) => b.at.localeCompare(a.at));

  const lastByPreset = new Map<string, string>();
  for (const g of given) {
    if (g.presetId && !lastByPreset.has(g.presetId)) lastByPreset.set(g.presetId, g.at);
  }

  const nextAllowed = (presetId: string, minHours: number): Date | undefined => {
    const last = lastByPreset.get(presetId);
    if (!last) return undefined;
    return new Date(new Date(last).getTime() + minHours * 3_600_000);
  };

  return (
    <div className="field">
      <span className="field__label">Medikament</span>

      {presets.length === 0 && !creating && (
        <p className="small muted" style={{ marginBottom: 8 }}>
          Noch kein Präparat hinterlegt. Lege eines an — Name, Dosis und Mindestabstand
          trägst du selbst aus der Packungsbeilage ein.
        </p>
      )}

      <div className="stack" style={{ gap: 'var(--space-2)' }}>
        {presets.map((p) => {
          const next = nextAllowed(p.id, p.minIntervalHours);
          const blocked = next != null && next.getTime() > Date.now();
          return (
            <div key={p.id} className="list-item">
              <div className="list-item__main">
                <div className="list-item__title">{p.name}</div>
                <div className="list-item__meta">
                  {p.form} · {p.dose}
                  {blocked && next && (
                    <> · nächste Gabe frühestens {formatTime(next.toISOString())}</>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="btn btn--sm btn--primary"
                onClick={() =>
                  addMedication({
                    childId: child.id,
                    at: entryAt,
                    presetId: p.id,
                    name: p.name,
                    dose: p.dose,
                  })
                }
              >
                Gabe
              </button>
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                aria-label={`${p.name} entfernen`}
                onClick={() => removeMedPreset(p.id)}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {creating ? (
        <div className="stack" style={{ marginTop: 'var(--space-3)' }}>
          <input
            className="input"
            placeholder="Präparat, z. B. Ibuprofen-Saft 2%"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Dosis laut Packungsbeilage, z. B. 5 ml"
            value={form.dose}
            onChange={(e) => setForm({ ...form, dose: e.target.value })}
          />
          <label className="field__label" htmlFor="interval">
            Mindestabstand laut Packungsbeilage (Stunden)
          </label>
          <input
            id="interval"
            className="input tabular"
            type="number"
            min={1}
            max={48}
            value={form.minIntervalHours}
            onChange={(e) => setForm({ ...form, minIntervalHours: Number(e.target.value) })}
          />
          <div className="note note--warn">
            Diese Angaben übernimmt die App unverändert aus deiner Eingabe. Sie prüft,
            berechnet und empfiehlt keine Dosierung.
          </div>
          <div className="row">
            <button
              type="button"
              className="btn btn--primary grow"
              disabled={!form.name.trim()}
              onClick={() => {
                addMedPreset({
                  childId: child.id,
                  name: form.name.trim(),
                  form: form.form,
                  dose: form.dose.trim(),
                  minIntervalHours: form.minIntervalHours,
                });
                setForm({ name: '', form: 'Saft', dose: '', minIntervalHours: 6 });
                setCreating(false);
              }}
            >
              Speichern
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setCreating(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          style={{ marginTop: 'var(--space-2)' }}
          onClick={() => setCreating(true)}
        >
          + Präparat anlegen
        </button>
      )}
    </div>
  );
}
