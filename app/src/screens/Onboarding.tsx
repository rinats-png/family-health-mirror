import { useState } from 'react';
import { todayISO } from '../domain/dates';
import { useStore } from '../store/store';

/**
 * Onboarding (PRD P-01/P-02).
 *
 * Kein Konto, keine E-Mail, kein Code — aus der Marktanalyse die stärkste
 * strukturelle Verbesserung gegenüber Wettbewerbern mit Praxiscode oder
 * Registrierungszwang. Ziel: unter 60 Sekunden.
 */
export function Onboarding() {
  const { addChild, updateSettings } = useStore();
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(todayISO());

  return (
    <div className="app">
      <main className="app__main" style={{ paddingBottom: 'var(--space-6)' }}>
        {step === 0 ? (
          <>
            <div className="screen-head" style={{ paddingTop: 'var(--space-6)' }}>
              <h1 className="screen-title">KinderGesundheit+</h1>
              <p className="screen-sub" style={{ fontSize: 17, marginTop: 'var(--space-3)' }}>
                Krankheiten, Impfungen und Entwicklung an einem ruhigen Ort — von der Geburt
                bis in die Grundschule.
              </p>
            </div>

            <div className="stack" style={{ marginTop: 'var(--space-5)' }}>
              <div className="tile tile--brand">
                <div className="tile__label">Ohne Konto</div>
                <p className="tile__meta">
                  Keine Registrierung, keine E-Mail-Adresse, kein Praxiscode. Die Daten bleiben
                  auf diesem Gerät.
                </p>
              </div>
              <div className="tile tile--brand">
                <div className="tile__label">In zehn Sekunden eingetragen</div>
                <p className="tile__meta">
                  Ein Tap legt den Eintrag an. Details kannst du später ergänzen — oder auch
                  nicht.
                </p>
              </div>
              <div className="tile tile--brand">
                <div className="tile__label">Wächst mit</div>
                <p className="tile__meta">
                  Die App wechselt mit dem Alter des Kindes von Windeln und Stillen zu Infekten,
                  Impfungen und Schulbeschwerden.
                </p>
              </div>
            </div>

            <div className="note note--warn" style={{ marginTop: 'var(--space-4)' }}>
              <strong>Prototyp.</strong> Impfplan-, Vorsorge- und Wachstumsdaten sind
              ungeprüfte Platzhalter. Diese App dokumentiert, sie diagnostiziert nicht und
              ersetzt keine ärztliche Beratung.
            </div>

            <button
              type="button"
              className="btn btn--primary btn--block"
              style={{ marginTop: 'var(--space-5)' }}
              onClick={() => setStep(1)}
            >
              Los geht's
            </button>
          </>
        ) : (
          <>
            <div className="screen-head" style={{ paddingTop: 'var(--space-6)' }}>
              <h1 className="screen-title">Erstes Kind anlegen</h1>
              <p className="screen-sub">Mehr als diese zwei Angaben braucht es nicht.</p>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="ob-name">Name oder Spitzname</label>
              <input
                id="ob-name"
                className="input"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder="Ein Spitzname genügt"
              />
              <p className="small muted" style={{ marginTop: 6 }}>
                Der echte Name ist nicht nötig — die App braucht ihn nicht.
              </p>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="ob-birth">Geburtsdatum</label>
              <input
                id="ob-birth"
                className="input"
                type="date"
                value={birthDate}
                max={todayISO()}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              <p className="small muted" style={{ marginTop: 6 }}>
                Daraus ergeben sich Altersgruppe, Impfplan und Vorsorgetermine.
              </p>
            </div>

            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!name.trim()}
              onClick={() => {
                addChild({ name: name.trim(), birthDate, isPreterm: false, allergies: [] });
                updateSettings({ onboarded: true });
              }}
            >
              Fertig
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              style={{ marginTop: 'var(--space-2)' }}
              onClick={() => setStep(0)}
            >
              Zurück
            </button>
          </>
        )}
      </main>
    </div>
  );
}
