import Link from 'next/link';
import type { EntityReport, Tier } from '../lib/entities';

type Props = { entities: EntityReport[] };

const TIER_ORDER: Tier[] = ['HIGH', 'MEDIUM', 'LOW', 'PROVISIONAL'];

const TIER_TOP_BORDER: Record<Tier, string> = {
  HIGH: 'border-t-red-500',
  MEDIUM: 'border-t-amber-500',
  LOW: 'border-t-lime-500',
  PROVISIONAL: 'border-t-zinc-600',
};

const TIER_HOVER_GLOW: Record<Tier, string> = {
  HIGH: 'hover:bg-red-500/10',
  MEDIUM: 'hover:bg-amber-500/10',
  LOW: 'hover:bg-lime-500/10',
  PROVISIONAL: 'hover:bg-zinc-500/10',
};

const TIER_TEXT: Record<Tier, string> = {
  HIGH: 'text-red-400',
  MEDIUM: 'text-amber-400',
  LOW: 'text-lime-400',
  PROVISIONAL: 's-fade',
};

export function PostureDistributionChart({ entities }: Props) {
  // Sort worst → best (lower score = worse)
  const sorted = [...entities].sort((a, b) => {
    const t = TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
    if (t !== 0) return t;
    return a.postureScore - b.postureScore;
  });

  const counts = entities.reduce<Record<Tier, number>>(
    (acc, e) => ({ ...acc, [e.tier]: (acc[e.tier] || 0) + 1 }),
    { HIGH: 0, MEDIUM: 0, LOW: 0, PROVISIONAL: 0 },
  );

  return (
    <div>
      {/* Chart frame */}
      <div className="rounded-md border s-border s-surface px-4 pt-3 pb-2">
        {/* Y-axis ticks (left) + bars */}
        <div className="flex gap-3">
          <div className="flex flex-col justify-between font-mono text-[9px] s-fade tabular-nums leading-none w-5 py-1">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>

          <div className="flex-1 relative">
            {/* Reference grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-dashed s-border opacity-30" />
              <div className="border-t border-dashed s-border opacity-30" />
              <div className="border-t border-dashed s-border opacity-30" />
            </div>

            {/* Bars */}
            <div className="relative flex items-end gap-[3px] h-24 sm:h-28">
              {sorted.map((e) => {
                const score = e.postureScore || 6; // floor for provisional/zero
                return (
                  <Link
                    key={e.slug}
                    href={`/entity/${e.slug}`}
                    title={`${e.short} · score ${e.postureScore} · ${e.tier}`}
                    className={`group flex-1 relative bg-zinc-900/70 border-t-2 ${TIER_TOP_BORDER[e.tier]} ${TIER_HOVER_GLOW[e.tier]} transition-colors`}
                    style={{ height: `${score}%` }}
                  >
                    {/* Hover label */}
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.08em] s-fade opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {e.short} · {e.postureScore}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* X-axis name strip */}
            <div className="mt-1.5 flex gap-[3px]">
              {sorted.map((e) => (
                <div
                  key={`l-${e.slug}`}
                  className="flex-1 font-mono text-[8px] uppercase s-fade text-center truncate leading-none"
                  title={e.short}
                >
                  {e.short.length > 6 ? e.short.slice(0, 5) : e.short}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] s-fade">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-0.5 bg-red-500" />
            HIGH <span className={`tabular-nums ${TIER_TEXT.HIGH}`}>{counts.HIGH}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-0.5 bg-amber-500" />
            MEDIUM <span className={`tabular-nums ${TIER_TEXT.MEDIUM}`}>{counts.MEDIUM}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-0.5 bg-lime-500" />
            LOW <span className={`tabular-nums ${TIER_TEXT.LOW}`}>{counts.LOW}</span>
          </span>
          {counts.PROVISIONAL > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-0.5 bg-zinc-500" />
              PROVISIONAL <span className={`tabular-nums ${TIER_TEXT.PROVISIONAL}`}>{counts.PROVISIONAL}</span>
            </span>
          )}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] s-fade">
          posture score · 0 worst · 100 best
        </p>
      </div>
    </div>
  );
}
