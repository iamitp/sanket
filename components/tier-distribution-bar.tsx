import Link from 'next/link';
import type { EntityReport, Tier } from '../lib/entities';

type Props = { entities: EntityReport[] };

const TIER_BG: Record<Tier, string> = {
  HIGH: 'bg-red-500/85 hover:bg-red-400 text-red-50',
  MEDIUM: 'bg-amber-500/80 hover:bg-amber-400 text-amber-50',
  LOW: 'bg-lime-500/80 hover:bg-lime-400 text-lime-950',
  PROVISIONAL: 'bg-zinc-700/80 hover:bg-zinc-600 text-zinc-200',
};

const TIER_ORDER: Tier[] = ['HIGH', 'MEDIUM', 'LOW', 'PROVISIONAL'];

export function TierDistributionBar({ entities }: Props) {
  // Sort worst-first for visual weight
  const sorted = [...entities].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  );

  return (
    <div>
      <div className="flex w-full h-16 sm:h-20 rounded-md overflow-hidden border s-border">
        {sorted.map((e) => (
          <Link
            key={e.slug}
            href={`/entity/${e.slug}`}
            title={`${e.short} — ${e.tier}`}
            className={`flex-1 flex items-end justify-center px-1 transition-all ${TIER_BG[e.tier]} relative group`}
            style={{ borderRight: '1px solid rgba(0,0,0,0.25)' }}
          >
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.08em] font-semibold pb-1 leading-none truncate w-full text-center">
              {e.short}
            </span>
            <span className="absolute top-1 left-1/2 -translate-x-1/2 font-serif text-xs sm:text-sm font-semibold tabular-nums opacity-90">
              {e.postureScore || '—'}
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] s-fade text-center">
        portfolio at a glance · 19 entities · click any cell for full assessment
      </p>
    </div>
  );
}
