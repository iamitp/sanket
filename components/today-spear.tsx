import Link from 'next/link';
import { actionTimeLabel, type EntityReport } from '../lib/entities';

type Props = { entities: EntityReport[] };

// Pick the single most time-pressing item across the portfolio.
// Only actions derived from the latest passive observation qualify here.
type Spear = {
  entity: EntityReport;
  what: string;
  due: string;
  days: number;
};

function pickSpear(entities: EntityReport[]): Spear | null {
  const candidates: Spear[] = [];
  for (const e of entities) {
    for (const a of e.urgentActions) {
      candidates.push({
        entity: e,
        what: a.what,
        due: a.due,
        days: a.days,
      });
    }
  }
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => a.days - b.days)[0];
}

export function TodaySpear({ entities }: Props) {
  const spear = pickSpear(entities);
  if (!spear) return null;

  const dayColor =
    spear.days <= 7 ? 'text-red-400' : spear.days <= 14 ? 'text-amber-400' : 'text-lime-400';

  return (
    <Link
      href={`/entity/${spear.entity.slug}`}
      className="kinetic-card kinetic-card--critical flex flex-col h-full rounded-lg border-l-2 border s-border bg-[rgba(239,71,111,0.06)] hover:bg-[rgba(239,71,111,0.1)] transition px-6 py-5 group"
      style={{ borderLeftColor: 'var(--sanket-accent)' }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-accent font-semibold mb-3">
        Today's spear
      </p>
      <div className="flex items-baseline gap-3 mb-3">
        <span className={`font-sans font-semibold text-5xl tabular-nums leading-none ${dayColor}`}>
          {Math.abs(spear.days)}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] s-fade">
          {actionTimeLabel(spear.days)} · {spear.due}
        </span>
      </div>
      <p className="m-0 s-fg text-[14.5px] leading-snug font-medium mb-2 group-hover:text-[var(--sanket-accent-soft)] transition">
        {spear.what}
      </p>
      <p className="m-0 mt-auto s-fade text-[12px] font-mono uppercase tracking-[0.12em]">
        {spear.entity.short} · {spear.entity.domain}
      </p>
    </Link>
  );
}
