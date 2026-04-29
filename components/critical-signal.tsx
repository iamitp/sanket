import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { EntityReport } from '../lib/entities';

type Props = {
  entities: EntityReport[];
  checkedDate: string;
  nearestActionDays: number | null;
};

type SignalStyle = CSSProperties & {
  '--signal-x': string;
  '--signal-y': string;
  '--signal-delay': string;
};

const SIGNAL_LAYOUT = [
  { x: 12, y: 56 },
  { x: 27, y: 34 },
  { x: 41, y: 62 },
  { x: 56, y: 42 },
  { x: 70, y: 68 },
  { x: 84, y: 38 },
  { x: 92, y: 58 },
] as const;

function signalPath(index: number): string {
  const current = SIGNAL_LAYOUT[index];
  const next = SIGNAL_LAYOUT[index + 1];
  const controlY = Math.min(current.y, next.y) - 16;
  return `M ${current.x} ${current.y} Q ${(current.x + next.x) / 2} ${controlY} ${next.x} ${next.y}`;
}

export function CriticalSignal({ entities, checkedDate, nearestActionDays }: Props) {
  const highRiskEntities = entities
    .filter((entity) => entity.tier === 'HIGH')
    .sort((a, b) => a.securityScore - b.securityScore)
    .slice(0, SIGNAL_LAYOUT.length);
  const scoredEntities = entities.filter((entity) => entity.securityScore > 0);
  const highCount = entities.filter((entity) => entity.tier === 'HIGH').length;
  const criticalCount = entities.filter((entity) => entity.riskLabel === 'Critical').length;
  const lowestScore = scoredEntities.length
    ? Math.min(...scoredEntities.map((entity) => entity.securityScore))
    : 0;

  return (
    <section className="critical-signal rounded-lg border s-border s-surface px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="m-0 font-mono text-[10px] uppercase tracking-[0.2em] s-accent font-semibold">
            Critical signal
          </p>
          <p className="m-0 mt-2 max-w-xl text-sm leading-6 s-dim">
            High-tier entities sorted by severity and time pressure.
          </p>
        </div>
        <dl className="m-0 grid grid-cols-3 gap-3 text-right">
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] s-fade">High</dt>
            <dd className="m-0 mt-1 font-serif text-2xl leading-none text-red-400">{highCount}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] s-fade">Critical</dt>
            <dd className="m-0 mt-1 font-serif text-2xl leading-none text-red-400">{criticalCount}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] s-fade">Nearest</dt>
            <dd className="m-0 mt-1 font-serif text-2xl leading-none s-fg">
              {nearestActionDays == null ? '—' : `${nearestActionDays}d`}
            </dd>
          </div>
        </dl>
      </div>

      <div className="critical-signal__field mt-5" aria-label="Animated critical risk signal">
        <div className="critical-signal__grid" aria-hidden="true" />
        <div className="critical-signal__sweep" aria-hidden="true" />
        <svg className="critical-signal__paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {highRiskEntities.slice(0, -1).map((entity, index) => (
            <path key={entity.slug} d={signalPath(index)} />
          ))}
        </svg>
        {highRiskEntities.map((entity, index) => {
          const point = SIGNAL_LAYOUT[index];
          const style: SignalStyle = {
            '--signal-x': `${point.x}%`,
            '--signal-y': `${point.y}%`,
            '--signal-delay': `${index * 0.65}s`,
          };

          return (
            <Link
              key={entity.slug}
              href={`/entity/${entity.slug}`}
              className={`critical-signal__node ${
                entity.riskLabel === 'Critical'
                  ? 'critical-signal__node--critical'
                  : 'critical-signal__node--watch'
              }`}
              style={style}
              title={`${entity.short} · score ${entity.securityScore} · ${entity.riskLabel}`}
            >
              <span className="critical-signal__dot" aria-hidden="true" />
              <span className="critical-signal__label">{entity.short}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] s-fade">
        <span>Lowest score · {lowestScore}</span>
        <span>Passive check · {checkedDate}</span>
      </div>
    </section>
  );
}
