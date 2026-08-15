import { useMemo } from 'react';
import { ageGroupOf, hasModule } from '../domain/ageGroups';
import {
  currentKitaYearStart,
  daysSinceLastEpisode,
  episodeTemperatures,
  periodStats,
  todayLabel,
} from '../domain/analytics';
import { SYMPTOMS, symptomLabel } from '../domain/catalog';
import { dayOf, formatAge, formatDateLong, formatTime, plural, todayISO } from '../domain/dates';
import { activeEpisode, buildEpisodes } from '../domain/episodes';
import { growthNarrative, growthSeries } from '../domain/growth';
import {
  STATUS_LABEL,
  STATUS_SYMBOL,
  buildCheckupPlan,
  buildVaccinationPlan,
  nextRelevantCheckup,
  nextRelevantVaccination,
} from '../domain/schedule';
import { useActions, useStore } from '../store/store';
import type { Child, HealthEntry } from '../domain/types';
import { TemperatureChart } from '../ui/charts';

interface Props {
  child: Child;
  onQuickEntry: (entry: HealthEntry) => void;
  onNavigate: (tab: 'tracker' | 'vaccines' | 'insights' | 'profile') => void;
}

export function Dashboard({ child, onQuickEntry, onNavigate }: Props) {
  const { state, noteChipUse } = useStore();
  const { addEntry, addDiaper, addFeeding, addSleep } = useActions();

  const group = ageGroupOf(child);
  const episodes = useMemo(() => buildEpisodes(state.entries, child.id), [state.entries, child.id]);
  const active = activeEpisode(episodes);
  const status = todayLabel(state.entries, child.id);
  const last = daysSinceLastEpisode(state.entries, child.id);

  const vaccinePlan = useMemo(
    () => buildVaccinationPlan(child, state.vaccinations),
    [child, state.vaccinations],
  );
  const nextVaccine = nextRelevantVaccination(vaccinePlan);
  const nextCheckup = nextRelevantCheckup(buildCheckupPlan(child, state.checkups));

  const kitaYear = currentKitaYearStart();
  const yearStats = periodStats(state.entries, child.id, kitaYear, todayISO());

  const weight = growthSeries(state.measurements, child, 'weight');
  const growth = growthNarrative(child, 'weight', weight);

  /**
   * Quick-Chips: der Tap legt den Eintrag sofort an (Speichern-zuerst) und
   * öffnet erst danach das Sheet zur Verfeinerung. Die Reihenfolge lernt aus
   * der bisherigen Nutzung — häufig Genutztes wandert nach vorn.
   */
  const quickChips = useMemo(() => {
    const usage = state.settings.chipUsage;
    return SYMPTOMS.filter((s) => s.quick)
      .slice()
      .sort((a, b) => (usage[b.code] ?? 0) - (usage[a.code] ?? 0))
      .slice(0, 3);
  }, [state.settings.chipUsage]);

  const quickTap = (code: string) => {
    noteChipUse(code);
    const entry = addEntry({
      childId: child.id,
      at: new Date().toISOString(),
      symptoms: [{ code, severity: 2 }],
      tempMethod: state.settings.lastTempMethod,
    });
    onQuickEntry(entry);
  };

  const openBlank = () => {
    const entry = addEntry({
      childId: child.id,
      at: new Date().toISOString(),
      symptoms: [],
      tempMethod: state.settings.lastTempMethod,
    });
    onQuickEntry(entry);
  };

  const todayFeedings = state.feedings.filter(
    (f) => f.childId === child.id && !f.deleted && dayOf(f.at) === todayISO(),
  );
  const todayDiapers = state.diapers.filter(
    (d) => d.childId === child.id && !d.deleted && dayOf(d.at) === todayISO(),
  );

  return (
    <>
      <div className="screen-head">
        <div className="screen-sub">{formatDateLong(todayISO())}</div>
        <h1 className="screen-title">{child.name}</h1>
        <div className="screen-sub">
          {formatAge(child.birthDate)} · {group.label}
        </div>
      </div>

      <section className="quickbar" aria-labelledby="quick-title">
        <div className="tile__label" id="quick-title">Schnelleintrag</div>
        <div className="chips">
          {quickChips.map((s) => (
            <button key={s.code} type="button" className="chip" onClick={() => quickTap(s.code)}>
              <span className="chip__icon" aria-hidden>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
          <button type="button" className="chip" onClick={openBlank}>
            <span className="chip__icon" aria-hidden>＋</span>
            <span>mehr</span>
          </button>
        </div>
        <p className="small muted" style={{ marginTop: 'var(--space-3)' }}>
          Ein Tap genügt — der Eintrag ist sofort gespeichert. Details kannst du danach ergänzen.
        </p>
      </section>

      {active && (
        <section className="section">
          <div className="section__title">Laufende Episode</div>
          <div className="tile tile--wide">
            <div className="row row--between">
              <div>
                <div className="tile__value">
                  {active.symptomCodes.map(symptomLabel).join(', ') || 'Symptome erfasst'}
                </div>
                <div className="tile__meta">
                  Seit {formatDateLong(dayOf(active.start))} · Tag {active.dayCount}
                  {active.maxTemp != null && ` · max. ${active.maxTemp.toFixed(1)} °C`}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <TemperatureChart points={episodeTemperatures(state.entries, active)} />
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="tiles">
          <button type="button" className="tile" onClick={() => onNavigate('tracker')}>
            <div className="tile__label">Heute</div>
            <div className="tile__value">{status.label}</div>
            <div className="tile__meta">{status.detail}</div>
          </button>

          <button type="button" className="tile" onClick={() => onNavigate('vaccines')}>
            <div className="tile__label">Nächste Impfung</div>
            {nextVaccine ? (
              <>
                <div className="tile__value" style={{ fontSize: 17 }}>{nextVaccine.dose.label}</div>
                <div className="tile__meta">
                  <span className={`status status--${nextVaccine.status}`}>
                    <span aria-hidden>{STATUS_SYMBOL[nextVaccine.status]}</span>
                    {STATUS_LABEL[nextVaccine.status]}
                  </span>
                </div>
              </>
            ) : (
              <div className="tile__value" style={{ fontSize: 17 }}>Alles erledigt</div>
            )}
          </button>

          <button type="button" className="tile" onClick={() => onNavigate('insights')}>
            <div className="tile__label">Letzte Krankheit</div>
            {last ? (
              <>
                <div className="tile__value">
                  {last.days === 0 ? 'heute' : `vor ${last.days} T.`}
                </div>
                <div className="tile__meta">
                  {plural(last.episode.dayCount, 'Tag', 'Tage')} gedauert
                </div>
              </>
            ) : (
              <div className="tile__value" style={{ fontSize: 17 }}>Noch keine</div>
            )}
          </button>

          <button type="button" className="tile" onClick={() => onNavigate('insights')}>
            <div className="tile__label">Seit September</div>
            <div className="tile__value">{plural(yearStats.episodeCount, 'Infekt', 'Infekte')}</div>
            <div className="tile__meta">
              {plural(yearStats.sickDays, 'Krankheitstag', 'Krankheitstage')}
            </div>
          </button>

          {nextCheckup && (
            <button type="button" className="tile tile--wide" onClick={() => onNavigate('vaccines')}>
              <div className="tile__label">Nächste Vorsorge</div>
              <div className="tile__value" style={{ fontSize: 18 }}>
                {nextCheckup.def.label}
              </div>
              <div className="tile__meta">
                {nextCheckup.def.windowLabel} ·{' '}
                <span className={`status status--${nextCheckup.status}`}>
                  <span aria-hidden>{STATUS_SYMBOL[nextCheckup.status]}</span>
                  {STATUS_LABEL[nextCheckup.status]}
                </span>
              </div>
            </button>
          )}

          {hasModule(child, 'growth') && weight.length > 0 && (
            <button type="button" className="tile" onClick={() => onNavigate('insights')}>
              <div className="tile__label">Gewicht</div>
              <div className="tile__value">
                {growth.headline}{' '}
                <span aria-hidden>
                  {growth.trend === 'up' ? '↗' : growth.trend === 'down' ? '↘' : '→'}
                </span>
              </div>
              <div className="tile__meta">{growth.detail}</div>
            </button>
          )}
        </div>
      </section>

      {hasModule(child, 'feeding') && (
        <section className="section">
          <div className="section__title">Säuglingsalltag</div>
          <div className="tiles">
            <div className="tile">
              <div className="tile__label">Mahlzeiten heute</div>
              <div className="tile__value">{todayFeedings.length}</div>
              <div className="tile__meta">
                {todayFeedings.length
                  ? `zuletzt ${formatTime(todayFeedings[todayFeedings.length - 1].at)}`
                  : 'noch nichts erfasst'}
              </div>
              <div className="row row--wrap" style={{ marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  onClick={() =>
                    addFeeding({ childId: child.id, at: new Date().toISOString(), kind: 'breast' })
                  }
                >
                  Stillen
                </button>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  onClick={() =>
                    addFeeding({ childId: child.id, at: new Date().toISOString(), kind: 'bottle' })
                  }
                >
                  Flasche
                </button>
              </div>
            </div>

            <div className="tile">
              <div className="tile__label">Windeln heute</div>
              <div className="tile__value">{todayDiapers.length}</div>
              <div className="tile__meta">
                {todayDiapers.filter((d) => d.kind !== 'urine').length} mit Stuhl
              </div>
              <div className="row row--wrap" style={{ marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  onClick={() =>
                    addDiaper({ childId: child.id, at: new Date().toISOString(), kind: 'urine' })
                  }
                >
                  Urin
                </button>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  onClick={() =>
                    addDiaper({ childId: child.id, at: new Date().toISOString(), kind: 'both' })
                  }
                >
                  Stuhl
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__title">Letzte Nacht</div>
        <div className="tile tile--wide">
          <div className="tile__meta" style={{ marginBottom: 'var(--space-2)' }}>
            Wie hat {child.name} geschlafen?
          </div>
          <div className="seg">
            {([3, 2, 1] as const).map((q) => (
              <button
                key={q}
                type="button"
                className="seg__item"
                aria-pressed={
                  state.sleep.find((s) => s.childId === child.id && s.date === todayISO() && !s.deleted)
                    ?.quality === q
                }
                onClick={() => addSleep({ childId: child.id, date: todayISO(), quality: q })}
              >
                {q === 3 ? 'Gut' : q === 2 ? 'Unruhig' : 'Schlecht'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {state.entries.filter((e) => e.childId === child.id && !e.deleted).length === 0 && (
        <section className="section">
          <div className="empty">
            Tippe auf Fieber oder Husten, sobald etwas ist. Alles andere kommt von selbst.
          </div>
        </section>
      )}

      <p className="disclaimer">
        KinderGesundheit+ dokumentiert und stellt dar. Die App stellt keine Diagnosen, gibt
        keine Behandlungsempfehlungen und ersetzt keine ärztliche Beratung.
      </p>
    </>
  );
}
