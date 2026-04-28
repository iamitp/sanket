import Link from 'next/link';
import { loadAllEntities } from '../lib/entities';
import { TierDistributionBar } from '../components/tier-distribution-bar';
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

  return (
    <div className="py-7 sm:py-9">
      {/* Hero — portfolio shape at a glance */}
      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] s-accent-green">
            Sanket cyber-posture register · scan {scanDate}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">
            {entities.length} MoPNG entities · Phase 2 active on {phase2Count}
          </p>
        </div>

        <div className="mt-6">
          <TierDistributionBar entities={entities} />
        </div>

        {/* Stats stack — three big numbers + one statement */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
          <div>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight s-fg leading-[0.95]">
              {counts.HIGH ?? 0} of {entities.length} entities flagged{' '}
              <span className="text-red-400">HIGH</span>
            </h1>
            <p className="mt-4 s-dim text-base sm:text-lg max-w-2xl leading-relaxed">
              Sanket is a public passive-reconnaissance register on the Indian Ministry of
              Petroleum and Natural Gas digital estate. Civic-tech transparency, refreshed weekly.
              Click any tile in the bar above or any card below for the full per-entity assessment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="HIGH" value={counts.HIGH ?? 0} color="text-red-400" />
            <StatCard label="MEDIUM" value={counts.MEDIUM ?? 0} color="text-amber-400" />
            <StatCard label="LOW" value={counts.LOW ?? 0} color="text-lime-400" />
            <StatCard
              label="Phase 2 active"
              value={phase2Count}
              color="text-[var(--sanket-accent-soft)]"
            />
          </div>
        </div>
      </section>

      {/* Today's spear — featured countdown */}
      <section className="mb-12">
        <TodaySpear entities={entities} />
      </section>

      {/* Constellation grid */}
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
                    className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums font-semibold ${
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
          Phase 1 (passive recon) covers all {entities.length} entities and is unconditional. Phase
          2 (active vulnerability assessment, Mythos-class adversary simulation, CISO patch list)
          requires per-entity ethical-hacking authorisation. Re-scan cadence: weekly via launchd.
        </p>
      </footer>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border s-border s-surface px-4 py-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] s-fade mb-1">{label}</div>
      <div className={`font-serif text-4xl tabular-nums leading-none ${color}`}>{value}</div>
    </div>
  );
}
