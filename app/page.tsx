import Link from 'next/link';
import { loadAllEntities, tierColor, postureLabelColor } from '../lib/entities';

const CATEGORY_LABEL: Record<string, string> = {
  ministry: 'Ministry',
  regulator: 'Regulator',
  omc: 'Oil marketing',
  upstream: 'Upstream',
  gas: 'Gas',
  refiner: 'Refining',
  epc: 'EPC',
  safety: 'Safety',
  education: 'Education',
  jv: 'JV',
};

const CATEGORY_ORDER = [
  'ministry',
  'regulator',
  'omc',
  'upstream',
  'gas',
  'refiner',
  'epc',
  'safety',
  'education',
  'jv',
];

export default function Home() {
  const entities = loadAllEntities();
  const counts = entities.reduce<Record<string, number>>(
    (acc, e) => ({ ...acc, [e.tier]: (acc[e.tier] || 0) + 1 }),
    {},
  );

  const allUrgent = entities.flatMap((e) =>
    e.urgentActions.map((a) => ({ ...a, entity: e })),
  );
  const sortedUrgent = allUrgent.sort((a, b) => a.days - b.days);

  // Group by category
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: entities.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0);

  const phase2Count = entities.filter((e) => !!e.phase2).length;
  const scanDate = entities[0]?.scanDate ?? '—';

  return (
    <div className="py-7 sm:py-9">
      {/* Hero */}
      <section className="border-b s-border pb-10 mb-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] s-accent-green">
          Sanket cyber-posture register · scan {scanDate}
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] s-fade">
          Passive reconnaissance · {entities.length} MoPNG entities · Phase 2 active on {phase2Count}
        </p>

        <h1 className="mt-8 font-serif text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight s-fg leading-[0.95]">
          {counts.HIGH ?? 0}
          <span className="ml-3 text-3xl sm:text-4xl s-fade font-normal align-baseline">HIGH</span>
        </h1>

        <p className="mt-5 font-serif text-2xl sm:text-3xl s-fg leading-snug max-w-3xl">
          {counts.HIGH ?? 0} of {entities.length} MoPNG entities flagged HIGH.
        </p>

        <p className="mt-3 s-dim text-base max-w-2xl">
          Sanket is a public passive-reconnaissance register on the Indian Ministry of Petroleum and
          Natural Gas digital estate. Civic-tech transparency, refreshed weekly. Click any entity for
          the per-entity assessment.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
          <span className="rounded border s-border s-surface px-3 py-1.5 s-fade">
            HIGH <span className="text-red-400 ml-1.5 font-semibold tabular-nums">{counts.HIGH ?? 0}</span>
          </span>
          <span className="rounded border s-border s-surface px-3 py-1.5 s-fade">
            MEDIUM <span className="text-amber-400 ml-1.5 font-semibold tabular-nums">{counts.MEDIUM ?? 0}</span>
          </span>
          <span className="rounded border s-border s-surface px-3 py-1.5 s-fade">
            LOW <span className="text-lime-400 ml-1.5 font-semibold tabular-nums">{counts.LOW ?? 0}</span>
          </span>
          {(counts.PROVISIONAL ?? 0) > 0 && (
            <span className="rounded border s-border s-surface px-3 py-1.5 s-fade">
              PROVISIONAL <span className="s-fade ml-1.5 font-semibold tabular-nums">{counts.PROVISIONAL}</span>
            </span>
          )}
        </div>
      </section>

      {/* Urgent across portfolio */}
      {sortedUrgent.length > 0 && (
        <section className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade mb-3">
            Portfolio-urgent
          </p>
          <h2 className="text-xl font-semibold tracking-tight s-fg sm:text-2xl mb-4">
            Time-bound items across the portfolio
          </h2>
          <div className="rounded-lg border-l-2 border s-border bg-[rgba(239,71,111,0.06)] px-5 py-4"
            style={{ borderLeftColor: 'var(--sanket-accent)' }}>
            <ul className="m-0 p-0 list-none divide-y divide-zinc-800/50">
              {sortedUrgent.map((u, i) => (
                <li key={i} className="flex items-baseline gap-3 py-2.5 first:pt-0 last:pb-0 text-sm">
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

      {/* Directory by category */}
      <section className="mb-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade mb-3">Directory</p>
        <h2 className="text-xl font-semibold tracking-tight s-fg sm:text-2xl mb-6">
          MoPNG entities · click for full assessment
        </h2>

        <div className="space-y-8">
          {byCategory.map(({ cat, items }) => (
            <div key={cat}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade mb-3">
                {CATEGORY_LABEL[cat]} · {items.length}
              </p>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((e) => (
                  <Link
                    key={e.slug}
                    href={`/entity/${e.slug}`}
                    className="rounded-lg border s-border s-surface p-4 transition hover-s-border block group"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <h3 className="m-0 font-serif text-lg s-fg leading-tight group-hover:text-[var(--sanket-accent)] transition">
                        {e.short}
                      </h3>
                      <span
                        className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold ${tierColor(e.tier)}`}
                      >
                        {e.tier}
                      </span>
                    </div>
                    <code className="font-mono text-[11px] s-dim bg-white/5 px-1 py-0.5 rounded">
                      {e.domain}
                    </code>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span
                        className="font-serif text-3xl tabular-nums s-fg"
                      >
                        {e.postureScore || '—'}
                      </span>
                      <span
                        className={`font-mono text-[10px] uppercase tracking-[0.16em] ${postureLabelColor(e.postureLabel)}`}
                      >
                        {e.postureLabel}
                      </span>
                      {e.phase2 && (
                        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] s-accent-green">
                          ▸ Phase 2
                        </span>
                      )}
                    </div>
                    <p className="mt-2 m-0 s-dim text-[12.5px] leading-snug line-clamp-2">
                      {e.oneLine}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

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
          Phase 1 (passive recon) covers all {entities.length} entities and is unconditional. Phase 2
          (active vulnerability assessment, Mythos-class adversary simulation, CISO patch list)
          requires per-entity ethical-hacking authorisation. Re-scan cadence: weekly via launchd.
        </p>
      </footer>
    </div>
  );
}
