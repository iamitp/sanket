import Link from 'next/link';
import { loadAllEntities } from '../lib/entities';
import { PostureDistributionChart } from '../components/posture-distribution-chart';
import { TodaySpear } from '../components/today-spear';
import { EntityConstellation } from '../components/entity-constellation';

export default function Home() {
  const entities = loadAllEntities();
  const counts = entities.reduce<Record<string, number>>(
    (acc, e) => ({ ...acc, [e.tier]: (acc[e.tier] || 0) + 1 }),
    {},
  );

  const phase2Count = entities.filter((e) => !!e.phase2).length;
  const scanDate = entities[0]?.scanDate ?? '—';

  const allUrgent = entities.flatMap((e) =>
    e.urgentActions.map((a) => ({ ...a, entity: e })),
  );
  const sortedUrgent = allUrgent.sort((a, b) => a.days - b.days);

  const avgScore = Math.round(
    entities.filter((e) => e.postureScore > 0).reduce((s, e) => s + e.postureScore, 0) /
      Math.max(1, entities.filter((e) => e.postureScore > 0).length),
  );

  return (
    <div className="py-7 sm:py-9">
      {/* Hero band — label row + chart full width */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] s-accent-green">
            Sanket cyber-posture register · scan {scanDate}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">
            {entities.length} MoPNG entities · Phase 2 active on {phase2Count}
          </p>
        </div>

        <PostureDistributionChart entities={entities} />

        {/* Single serif statement under the chart */}
        <h1 className="mt-10 font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight s-fg leading-[1.05] max-w-4xl">
          {counts.HIGH ?? 0} of {entities.length} entities flagged{' '}
          <span className="text-red-400">HIGH</span>.
        </h1>

        <p className="mt-4 s-dim text-base sm:text-lg max-w-3xl leading-relaxed">
          Sanket is a public passive-reconnaissance register on the Indian Ministry of Petroleum
          and Natural Gas digital estate. Civic-tech transparency, refreshed weekly. Click any bar
          above or any tile below for the full per-entity assessment.
        </p>
      </section>

      {/* Three balanced equal-height cards: spear · stats · cadence */}
      <section className="mb-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {/* Today's spear */}
          <TodaySpear entities={entities} />

          {/* Posture distribution stats */}
          <div className="flex flex-col h-full rounded-lg border s-border s-surface px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade font-semibold mb-3">
              Posture distribution
            </p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-serif text-5xl font-semibold tabular-nums s-fg leading-none">
                {avgScore}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] s-fade">
                avg score · 0 worst · 100 best
              </span>
            </div>
            <ul className="m-0 mt-auto p-0 list-none space-y-1 text-[13px]">
              <StatRow label="HIGH" count={counts.HIGH ?? 0} colorClass="text-red-400" />
              <StatRow label="MEDIUM" count={counts.MEDIUM ?? 0} colorClass="text-amber-400" />
              <StatRow label="LOW" count={counts.LOW ?? 0} colorClass="text-lime-400" />
              {(counts.PROVISIONAL ?? 0) > 0 && (
                <StatRow
                  label="PROVISIONAL"
                  count={counts.PROVISIONAL!}
                  colorClass="s-fade"
                />
              )}
            </ul>
          </div>

          {/* Phase 2 + cadence */}
          <div className="flex flex-col h-full rounded-lg border s-border s-surface px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade font-semibold mb-3">
              Coverage
            </p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-serif text-5xl font-semibold tabular-nums s-fg leading-none">
                {phase2Count}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] s-fade">
                Phase 2 active of {entities.length}
              </span>
            </div>
            <p className="m-0 s-dim text-[13px] leading-relaxed mb-2">
              Phase 1 (passive) covers all {entities.length} entities. Phase 2 (active scan +
              Mythos simulation + CISO patch list) requires per-entity ethical-hacking
              authorisation.
            </p>
            <p className="m-0 mt-auto font-mono text-[10px] uppercase tracking-[0.18em] s-fade">
              Re-scan cadence · weekly via launchd
            </p>
          </div>
        </div>
      </section>

      {/* Constellation directory */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">Directory</p>
            <h2 className="m-0 mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
              {entities.length} entities · sorted worst-first
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] s-fade">
            click any tile for full assessment
          </p>
        </div>
        <EntityConstellation entities={entities} />
      </section>

      {/* Portfolio-wide urgent list */}
      {sortedUrgent.length > 0 && (
        <section className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade mb-3">
            Portfolio-urgent
          </p>
          <h2 className="text-xl font-semibold tracking-tight s-fg sm:text-2xl mb-4">
            All time-bound items, soonest first
          </h2>
          <div
            className="rounded-lg border-l-2 border s-border bg-[rgba(239,71,111,0.04)] px-5 py-4"
            style={{ borderLeftColor: 'var(--sanket-accent)' }}
          >
            <ul className="m-0 p-0 list-none divide-y divide-zinc-800/50">
              {sortedUrgent.map((u, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-3 py-2.5 first:pt-0 last:pb-0 text-sm"
                >
                  <span
                    className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums font-semibold w-10 text-right ${
                      u.days <= 7 ? 'text-red-400' : u.days <= 30 ? 'text-amber-400' : 's-fade'
                    }`}
                  >
                    {u.days}d
                  </span>
                  <Link
                    href={`/entity/${u.entity.slug}`}
                    className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] s-fade hover-s-fg w-20"
                  >
                    {u.entity.short}
                  </Link>
                  <span className="flex-1 s-muted">{u.what}</span>
                  <span className="s-fade text-[11px] font-mono shrink-0 hidden sm:inline">
                    {u.due}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Methodology footer */}
      <footer className="mt-12 pt-8 border-t s-border s-fade text-sm leading-relaxed">
        <p className="m-0 mb-2">
          Sibling project:{' '}
          <a href="https://sanjaya.amitpatnaik.com" className="s-link">
            Sanjaya
          </a>{' '}
          — fuel-pricing transparency on the same Ministry portfolio. Sanjaya narrates; Sanket
          warns.
        </p>
        <p className="m-0">
          Methodology is reproducible by any visitor with{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">curl</code>,{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">dig</code>, and{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">openssl</code>.
        </p>
      </footer>
    </div>
  );
}

function StatRow({
  label,
  count,
  colorClass,
}: {
  label: string;
  count: number;
  colorClass: string;
}) {
  return (
    <li className="flex items-baseline justify-between font-mono uppercase tracking-[0.12em]">
      <span className={`text-[10px] ${colorClass}`}>{label}</span>
      <span className={`tabular-nums font-semibold text-sm ${colorClass}`}>{count}</span>
    </li>
  );
}
