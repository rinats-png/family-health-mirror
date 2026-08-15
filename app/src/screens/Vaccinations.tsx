import { useMemo, useState } from 'react';
import { VACCINE_SCHEDULE } from '../data/stiko';
import { CHECKUPS_VERSION } from '../data/checkups';
import { formatDateShort, formatRelativeDays, todayISO } from '../domain/dates';
import {
  STATUS_LABEL,
  STATUS_SYMBOL,
  buildCheckupPlan,
  buildVaccinationPlan,
  measlesProofStatus,
  type DueStatus,
  type ScheduledVaccination,
} from '../domain/schedule';
import { useActions, useStore } from '../store/store';
import type { Child } from '../domain/types';
import { Sheet } from '../ui/Sheet';

function StatusPill({ status }: { status: DueStatus }) {
  return (
    <span className={`status status--${status}`}>
      <span aria-hidden>{STATUS_SYMBOL[status]}</span>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Vaccinations({ child }: { child: Child }) {
  const { state } = useStore();
  const { addVaccination, removeVaccination, addCheckup, removeCheckup } = useActions();
  const [confirming, setConfirming] = useState<ScheduledVaccination | null>(null);
  const [date, setDate] = useState(todayISO());
  const [batch, setBatch] = useState('');

  const plan = useMemo(
    () => buildVaccinationPlan(child, state.vaccinations),
    [child, state.vaccinations],
  );
  const checkups = useMemo(
    () => buildCheckupPlan(child, state.checkups),
    [child, state.checkups],
  );

  const attention = plan.filter((p) => p.status === 'overdue' || p.status === 'due' || p.status === 'soon');
  const done = plan.filter((p) => p.status === 'done');
  const upcoming = plan.filter((p) => p.status === 'upcoming');
  const expired = plan.filter((p) => p.status === 'expired');
  const measles = measlesProofStatus(plan);

  const openCheckups = checkups.filter(
    (c) => c.status !== 'done' && c.status !== 'upcoming' && c.status !== 'expired',
  );
  const nextUpcomingCheckups = checkups.filter((c) => c.status === 'upcoming').slice(0, 2);
  const doneCheckups = checkups.filter((c) => c.status === 'done');

  return (
    <>
      <div className="screen-head">
        <h1 className="screen-title">Impfungen</h1>
        <div className="screen-sub">{child.name} · Vorsorge und Impfplan</div>
      </div>

      {!VACCINE_SCHEDULE.verified && (
        <div className="note note--warn" style={{ marginBottom: 'var(--space-4)' }}>
          <strong>Ungeprüfter Datensatz.</strong> Dieser Prototyp nutzt einen nachgebildeten,
          fachlich nicht freigegebenen Impfplan ({VACCINE_SCHEDULE.version}). Verlasse dich
          für Termine ausschließlich auf deine Kinderärztin oder deinen Kinderarzt.
        </div>
      )}

      {done.length === 0 && (expired.length > 0 || attention.length > 0) && (
        <div className="note note--info" style={{ marginBottom: 'var(--space-4)' }}>
          <strong>Impfpass nachtragen.</strong> Für {child.name} ist bisher keine Impfung
          erfasst, deshalb wirkt der Plan unvollständig. Trage die bereits erfolgten
          Impfungen aus dem gelben Impfpass nach — danach stimmt die Übersicht.
        </div>
      )}

      {attention.length > 0 && (
        <section className="section">
          <div className="section__title">Jetzt relevant</div>
          <div className="list">
            {attention.map((p) => (
              <div key={p.key} className="list-item">
                <div className="list-item__main">
                  <div className="list-item__title">
                    {p.dose.label}
                    {p.dose.totalDoses > 1 && ` (${p.dose.doseNumber}/${p.dose.totalDoses})`}
                  </div>
                  <div className="list-item__meta">
                    Empfohlen ab {formatDateShort(p.dueFrom)} · {formatRelativeDays(p.dueFrom)}
                  </div>
                  <div style={{ marginTop: 4 }}><StatusPill status={p.status} /></div>
                </div>
                <button
                  type="button"
                  className="btn btn--sm btn--primary"
                  onClick={() => { setConfirming(p); setDate(todayISO()); setBatch(''); }}
                >
                  Erledigt
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__title">Vorsorgeuntersuchungen</div>
        <div className="list">
          {[...openCheckups, ...nextUpcomingCheckups].map((c) => (
            <div key={c.def.code} className="list-item">
              <div className="list-item__main">
                <div className="list-item__title">
                  {c.def.label}
                  {c.def.extra && <span className="pro-badge" style={{ marginLeft: 6 }}>Zusatz</span>}
                </div>
                <div className="list-item__meta">
                  {c.def.windowLabel} · {formatDateShort(c.dueFrom)} – {formatDateShort(c.dueTo)}
                </div>
                <div style={{ marginTop: 4 }}><StatusPill status={c.status} /></div>
              </div>
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() =>
                  addCheckup({ childId: child.id, checkupCode: c.def.code, date: todayISO() })
                }
              >
                Erledigt
              </button>
            </div>
          ))}
          {openCheckups.length === 0 && nextUpcomingCheckups.length === 0 && (
            <div className="empty">Alle erfassten Vorsorgetermine sind erledigt.</div>
          )}
        </div>
        {doneCheckups.length > 0 && (
          <details style={{ marginTop: 'var(--space-3)' }}>
            <summary className="section__title" style={{ cursor: 'pointer' }}>
              Erledigt ({doneCheckups.length})
            </summary>
            <div className="list" style={{ marginTop: 'var(--space-2)' }}>
              {doneCheckups.map((c) => (
                <div key={c.def.code} className="list-item">
                  <div className="list-item__main">
                    <div className="list-item__title">✓ {c.def.label}</div>
                    <div className="list-item__meta">
                      {c.record && formatDateShort(c.record.date)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--sm btn--ghost"
                    aria-label={`${c.def.label} zurücksetzen`}
                    onClick={() => c.record && removeCheckup(c.record.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      {expired.length > 0 && (
        <section className="section">
          <div className="section__title">Zeitfenster abgelaufen ({expired.length})</div>
          <div className="note note--muted" style={{ marginBottom: 'var(--space-3)' }}>
            Für diese Impfungen liegt das im Plan vorgesehene Zeitfenster länger zurück.
            Das ist keine Handlungsaufforderung und keine Bewertung — ob und wann etwas
            nachgeholt wird, gehört in die kinderärztliche Sprechstunde. Falls die Impfung
            bereits erfolgt ist, kannst du sie hier nachtragen.
          </div>
          <details>
            <summary className="btn btn--ghost btn--block" style={{ cursor: 'pointer' }}>
              Liste anzeigen
            </summary>
            <div className="list" style={{ marginTop: 'var(--space-2)' }}>
              {expired.map((p) => (
                <div key={p.key} className="list-item">
                  <div className="list-item__main">
                    <div className="list-item__title">
                      {p.dose.label}
                      {p.dose.totalDoses > 1 && ` (${p.dose.doseNumber}/${p.dose.totalDoses})`}
                    </div>
                    <div className="list-item__meta">
                      Vorgesehen bis {formatDateShort(p.dueTo)}
                    </div>
                    <div style={{ marginTop: 4 }}><StatusPill status={p.status} /></div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--sm btn--ghost"
                    onClick={() => { setConfirming(p); setDate(todayISO()); setBatch(''); }}
                  >
                    Nachtragen
                  </button>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      <section className="section">
        <div className="section__title">Kita-Check</div>
        <div className="tile tile--wide">
          <div className="tile__value" style={{ fontSize: 18 }}>
            Masern-Nachweis: {measles.done} von {measles.total} Dosen erfasst
          </div>
          <p className="tile__meta">
            Rein beschreibende Angabe aus deinen eigenen Einträgen. Ob ein Nachweis für die
            Betreuungseinrichtung ausreicht, entscheidet die Einrichtung bzw. das
            Gesundheitsamt — nicht diese App.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section__title">Erledigt ({done.length})</div>
        {done.length === 0 ? (
          <div className="empty">Noch keine Impfung erfasst.</div>
        ) : (
          <div className="list">
            {done.map((p) => (
              <div key={p.key} className="list-item">
                <div className="list-item__main">
                  <div className="list-item__title">
                    ✓ {p.dose.label}
                    {p.dose.totalDoses > 1 && ` (${p.dose.doseNumber}/${p.dose.totalDoses})`}
                  </div>
                  <div className="list-item__meta">
                    {p.record && formatDateShort(p.record.date)}
                    {p.record?.batch && ` · Charge ${p.record.batch}`}
                  </div>
                </div>
                <a
                  className="btn btn--sm btn--ghost"
                  href={p.dose.infoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Offizielle Informationen zu ${p.dose.label}`}
                >
                  ⓘ
                </a>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  aria-label="Eintrag entfernen"
                  onClick={() => p.record && removeVaccination(p.record.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <details>
          <summary className="section__title" style={{ cursor: 'pointer' }}>
            Später vorgesehen ({upcoming.length})
          </summary>
          <div className="list" style={{ marginTop: 'var(--space-2)' }}>
            {upcoming.map((p) => (
              <div key={p.key} className="list-item">
                <div className="list-item__main">
                  <div className="list-item__title">
                    ○ {p.dose.label}
                    {p.dose.totalDoses > 1 && ` (${p.dose.doseNumber}/${p.dose.totalDoses})`}
                  </div>
                  <div className="list-item__meta">
                    ab {formatDateShort(p.dueFrom)}
                    {p.dose.note && ` · ${p.dose.note}`}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  onClick={() => { setConfirming(p); setDate(todayISO()); setBatch(''); }}
                >
                  Erfassen
                </button>
              </div>
            ))}
          </div>
        </details>
      </section>

      <p className="disclaimer">
        Grundlage: {VACCINE_SCHEDULE.sourceLabel} ({VACCINE_SCHEDULE.version}),
        Vorsorge-Datensatz {CHECKUPS_VERSION}.{' '}
        <a href={VACCINE_SCHEDULE.sourceUrl} target="_blank" rel="noreferrer noopener">
          Offizielle Empfehlungen des RKI
        </a>
        . Diese Übersicht ist eine Terminhilfe auf Basis einer öffentlichen Empfehlung und
        keine individuelle ärztliche Empfehlung. Sie ersetzt keine ärztliche Beratung.
      </p>

      {confirming && (
        <Sheet open onClose={() => setConfirming(null)} title={confirming.dose.label}>
          <div className="field">
            <label className="field__label" htmlFor="vdate">Datum der Impfung</label>
            <input
              id="vdate"
              className="input"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="vbatch">Chargennummer (optional)</label>
            <input
              id="vbatch"
              className="input"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="steht im Impfpass"
            />
          </div>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => {
              addVaccination({
                childId: child.id,
                vaccineCode: confirming.dose.vaccineCode,
                doseNumber: confirming.dose.doseNumber,
                date,
                batch: batch.trim() || undefined,
                source: 'manual',
              });
              setConfirming(null);
            }}
          >
            Als erledigt eintragen
          </button>
        </Sheet>
      )}
    </>
  );
}
