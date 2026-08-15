import { useState } from 'react';
import { CHECKUPS_VERSION } from '../data/checkups';
import { GROWTH_DATA_VERSION } from '../data/growth';
import { VACCINE_SCHEDULE } from '../data/stiko';
import { ageGroupOf } from '../domain/ageGroups';
import { formatAge, formatDateShort, todayISO } from '../domain/dates';
import { exportFullJson } from '../domain/export';
import { useStore } from '../store/store';
import type { AppState, Child } from '../domain/types';
import { Sheet } from '../ui/Sheet';

/** Free-Grenze aus dem PRD §6.4: ein Kind kostenlos, weitere in Pro. */
const FREE_CHILD_LIMIT = 1;

export function Profile({ child }: { child: Child }) {
  const {
    state, addChild, updateChild, removeChild, setActiveChild, updateSettings, replaceState, resetAll,
  } = useStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', birthDate: todayISO(), sex: '', preterm: false, weeks: 40 });
  const [allergyInput, setAllergyInput] = useState('');

  const canAddChild = state.settings.proUnlocked || state.children.length < FREE_CHILD_LIMIT;

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const next: AppState = parsed.state ?? parsed;
        if (!next || !Array.isArray(next.children)) throw new Error('Unerwartetes Format');
        replaceState(next);
        alert('Daten importiert.');
      } catch {
        alert('Die Datei konnte nicht gelesen werden. Erwartet wird ein JSON-Export dieser App.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="screen-head">
        <h1 className="screen-title">Profil</h1>
        <div className="screen-sub">Kinder, Daten und Einstellungen</div>
      </div>

      <section className="section">
        <div className="section__title">Kinder</div>
        <div className="list">
          {state.children.map((c) => (
            <div key={c.id} className="list-item">
              <span className="avatar" style={{ background: c.color }} aria-hidden>
                {c.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="list-item__main">
                <div className="list-item__title">
                  {c.name} {c.id === child.id && <span className="pro-badge">aktiv</span>}
                </div>
                <div className="list-item__meta">
                  {formatDateShort(c.birthDate)} · {formatAge(c.birthDate)} · {ageGroupOf(c).label}
                </div>
              </div>
              {c.id !== child.id && (
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => setActiveChild(c.id)}>
                  Wechseln
                </button>
              )}
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                aria-label={`${c.name} löschen`}
                onClick={() => {
                  if (confirm(`${c.name} und alle zugehörigen Daten unwiderruflich löschen?`)) {
                    removeChild(c.id);
                  }
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {canAddChild ? (
          <button
            type="button"
            className="btn btn--ghost btn--block"
            style={{ marginTop: 'var(--space-3)' }}
            onClick={() => setAdding(true)}
          >
            + Weiteres Kind
          </button>
        ) : (
          <div className="note note--info" style={{ marginTop: 'var(--space-3)' }}>
            Mehrere Kinder sind ein Pro-Feature. In diesem Prototyp kannst du Pro unten
            freischalten — ohne Zahlung, nur zum Ausprobieren.
          </div>
        )}
      </section>

      <section className="section">
        <div className="section__title">{child.name} bearbeiten</div>
        <div className="tile tile--wide">
          <div className="field">
            <label className="field__label" htmlFor="cname">Name</label>
            <input
              id="cname"
              className="input"
              value={child.name}
              onChange={(e) => updateChild(child.id, { name: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="cbirth">Geburtsdatum</label>
            <input
              id="cbirth"
              className="input"
              type="date"
              value={child.birthDate}
              max={todayISO()}
              onChange={(e) => updateChild(child.id, { birthDate: e.target.value })}
            />
          </div>
          <div className="field">
            <span className="field__label">Geschlecht (optional, nur für Referenzkurven)</span>
            <div className="seg">
              {[
                { v: undefined, l: 'ohne Angabe' },
                { v: 'f' as const, l: 'weiblich' },
                { v: 'm' as const, l: 'männlich' },
                { v: 'd' as const, l: 'divers' },
              ].map((o) => (
                <button
                  key={o.l}
                  type="button"
                  className="seg__item"
                  aria-pressed={child.sex === o.v}
                  onClick={() => updateChild(child.id, { sex: o.v })}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="row" style={{ gap: 'var(--space-2)' }}>
              <input
                type="checkbox"
                checked={child.isPreterm}
                onChange={(e) => updateChild(child.id, { isPreterm: e.target.checked })}
                style={{ width: 22, height: 22 }}
              />
              <span>Frühgeburt — korrigiertes Alter verwenden</span>
            </label>
            {child.isPreterm && (
              <input
                className="input tabular"
                style={{ marginTop: 8 }}
                type="number"
                min={22}
                max={40}
                value={child.gestationalWeeks ?? 36}
                onChange={(e) => updateChild(child.id, { gestationalWeeks: Number(e.target.value) })}
                aria-label="Schwangerschaftswoche bei Geburt"
              />
            )}
          </div>
          <div className="field">
            <span className="field__label">Allergien und Unverträglichkeiten</span>
            <div className="row row--wrap" style={{ marginBottom: 8 }}>
              {child.allergies.map((a) => (
                <button
                  key={a}
                  type="button"
                  className="seg__item"
                  onClick={() =>
                    updateChild(child.id, { allergies: child.allergies.filter((x) => x !== a) })
                  }
                >
                  {a} ✕
                </button>
              ))}
              {child.allergies.length === 0 && <span className="small muted">keine erfasst</span>}
            </div>
            <div className="row">
              <input
                className="input"
                placeholder="z. B. Kuhmilcheiweiß"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
              />
              <button
                type="button"
                className="btn btn--sm"
                disabled={!allergyInput.trim()}
                onClick={() => {
                  updateChild(child.id, { allergies: [...child.allergies, allergyInput.trim()] });
                  setAllergyInput('');
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__title">Darstellung</div>
        <div className="tile tile--wide">
          <div className="field">
            <span className="field__label">Thema</span>
            <div className="seg">
              {(['system', 'light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="seg__item"
                  aria-pressed={state.settings.theme === t}
                  onClick={() => updateSettings({ theme: t })}
                >
                  {t === 'system' ? 'System' : t === 'light' ? 'Hell' : 'Dunkel'}
                </button>
              ))}
            </div>
          </div>
          <label className="row" style={{ gap: 'var(--space-2)' }}>
            <input
              type="checkbox"
              checked={state.settings.nightMode}
              onChange={(e) => updateSettings({ nightMode: e.target.checked })}
              style={{ width: 22, height: 22 }}
            />
            <span>Nachtmodus ab 21 Uhr (gedämpft, ohne Animationen)</span>
          </label>
        </div>
      </section>

      <section className="section">
        <div className="section__title">Pro</div>
        <div className="tile tile--wide">
          <p className="tile__meta" style={{ marginBottom: 'var(--space-3)' }}>
            Free: ein Kind, vollständige tägliche Erfassung, Datenexport. Pro: mehrere Kinder,
            Impfplan-Erinnerungen, Auswertungen, Arzt-Export, Perzentilen. Die Erfassung selbst
            ist und bleibt kostenlos.
          </p>
          <button
            type="button"
            className={state.settings.proUnlocked ? 'btn btn--block' : 'btn btn--primary btn--block'}
            onClick={() => updateSettings({ proUnlocked: !state.settings.proUnlocked })}
          >
            {state.settings.proUnlocked ? 'Pro deaktivieren (Test)' : 'Pro freischalten (Test, kostenlos)'}
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section__title">Daten</div>
        <div className="stack">
          <button type="button" className="btn btn--block" onClick={() => exportFullJson(state)}>
            Alle Daten exportieren (JSON)
          </button>
          <label className="btn btn--block" style={{ cursor: 'pointer' }}>
            Daten importieren
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importJson(file);
              }}
            />
          </label>
          <button
            type="button"
            className="btn btn--danger btn--block"
            onClick={() => {
              if (confirm('Wirklich alle Daten dieser App unwiderruflich löschen?')) void resetAll();
            }}
          >
            Alle Daten löschen
          </button>
          <p className="small muted">
            Alle Daten liegen ausschließlich auf diesem Gerät. Es gibt kein Konto, keine
            Registrierung und keine Übertragung an einen Server. Löschen und Exportieren
            funktionieren ohne Rückfrage bei einem Support.
          </p>
        </div>
      </section>

      <p className="disclaimer">
        Prototyp. Datensätze: Impfplan {VACCINE_SCHEDULE.version}, Vorsorge {CHECKUPS_VERSION},
        Wachstum {GROWTH_DATA_VERSION} — sämtlich ungeprüfte Platzhalter. Diese App ist kein
        Medizinprodukt, stellt keine Diagnosen und gibt keine Behandlungs- oder
        Dosierungsempfehlungen.
      </p>

      {adding && (
        <Sheet open onClose={() => setAdding(false)} title="Kind anlegen">
          <div className="field">
            <label className="field__label" htmlFor="nname">Name oder Spitzname</label>
            <input
              id="nname"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ein Spitzname genügt"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="nbirth">Geburtsdatum</label>
            <input
              id="nbirth"
              className="input"
              type="date"
              value={form.birthDate}
              max={todayISO()}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </div>
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={!form.name.trim()}
            onClick={() => {
              const created = addChild({
                name: form.name.trim(),
                birthDate: form.birthDate,
                isPreterm: false,
                allergies: [],
              });
              setActiveChild(created.id);
              setForm({ name: '', birthDate: todayISO(), sex: '', preterm: false, weeks: 40 });
              setAdding(false);
            }}
          >
            Anlegen
          </button>
        </Sheet>
      )}
    </>
  );
}
