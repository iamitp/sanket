import Link from 'next/link';
import type { EntityReport, Tier } from '../lib/entities';

type Props = { entities: EntityReport[] };

const TIER_ORDER: Tier[] = ['HIGH', 'MEDIUM', 'LOW', 'PROVISIONAL'];

const TIER_BORDER: Record<Tier, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-amber-500',
  LOW: 'border-l-lime-500',
  PROVISIONAL: 'border-l-zinc-600',
};

const TIER_GLOW: Record<Tier, string> = {
  HIGH: 'shadow-[0_0_24px_-12px_rgba(248,113,113,0.6)]',
  MEDIUM: 'shadow-[0_0_24px_-12px_rgba(251,191,36,0.5)]',
  LOW: 'shadow-[0_0_24px_-12px_rgba(163,217,39,0.4)]',
  PROVISIONAL: '',
};

const TIER_TEXT: Record<Tier, string> = {
  HIGH: 'text-red-400',
  MEDIUM: 'text-amber-400',
  LOW: 'text-lime-400',
  PROVISIONAL: 's-fade italic',
};

const RISK_TEXT: Record<EntityReport['riskLabel'], string> = {
  Critical: 'text-red-400',
  Elevated: 'text-amber-400',
  Watch: 'text-yellow-300',
  Normal: 'text-lime-400',
};

export function EntityConstellation({ entities }: Props) {
  // Sort worst → best so the most urgent are visually first
  const sorted = [...entities].sort((a, b) => {
    const t = TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
    if (t !== 0) return t;
    return a.securityScore - b.securityScore;
  });

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
      {sorted.map((e) => {
        const kineticClass =
          e.riskLabel === 'Critical'
            ? 'kinetic-card kinetic-card--critical'
            : e.tier === 'HIGH'
              ? 'kinetic-card kinetic-card--watch'
              : '';

        return (
          <Link
            key={e.slug}
            href={`/entity/${e.slug}`}
            className={`group relative flex flex-col rounded-lg border border-l-4 s-border ${TIER_BORDER[e.tier]} s-surface p-4 transition-all hover-s-border hover:bg-[rgba(255,255,255,0.02)] ${TIER_GLOW[e.tier]} ${kineticClass}`}
          >
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.16em] font-semibold ${TIER_TEXT[e.tier]}`}
              >
                {e.tier}
              </span>
              {e.phase2 ? (
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] s-accent-green">
                  ▸ Phase 2
                </span>
              ) : (
                <span aria-hidden className="invisible font-mono text-[9px]">▸</span>
              )}
            </div>

            <h3 className="m-0 font-serif text-xl s-fg leading-tight group-hover:text-[var(--sanket-accent-soft)] transition">
              {e.short}
            </h3>
            <code className="font-mono text-[11px] s-dim bg-white/5 px-1 py-0.5 rounded inline-block mt-1.5 self-start">
              {e.domain}
            </code>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-5xl tabular-nums s-fg leading-none">
                {e.securityScore || '—'}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.16em] ${RISK_TEXT[e.riskLabel]}`}
              >
                {e.riskLabel}
              </span>
            </div>

            <p className="mt-2.5 m-0 s-dim text-[12.5px] leading-snug line-clamp-2 h-[2.6em]">
              {e.oneLine}
            </p>

            <div className="mt-auto pt-2.5 border-t s-border flex items-center gap-2 min-h-[1.75rem]">
              {e.urgentActions.length > 0 ? (
                <>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-red-400 font-semibold tabular-nums">
                    {Math.min(...e.urgentActions.map((a) => a.days))}d
                  </span>
                  <span className="text-[11px] s-fade truncate flex-1">
                    {e.urgentActions[0].what}
                  </span>
                </>
              ) : (
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] s-fade">
                  no time-bound actions
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
