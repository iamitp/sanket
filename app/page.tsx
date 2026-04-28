import register from '../data/register.json';

type Tier = 'HIGH' | 'MEDIUM' | 'LOW' | 'PROVISIONAL';

type Entity = {
  name: string;
  domain: string;
  tier: Tier;
  findings: string;
};

const tierOrder: Record<Tier, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, PROVISIONAL: 3 };

const tierTextClass: Record<Tier, string> = {
  HIGH: 'text-red-400',
  MEDIUM: 'text-amber-400',
  LOW: 'text-lime-400',
  PROVISIONAL: 's-fade italic',
};

function fmtScanDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.toString().padStart(2, '0')} ${months[m - 1]} ${y}`;
}

export default function Home() {
  const { meta, urgent, crossCutting, entities } = register as {
    meta: {
      tagline: string;
      scanDate: string;
      entityCount: number;
      methodology: string;
    };
    urgent: string[];
    crossCutting: { title: string; summary: string }[];
    entities: Entity[];
  };

  const sorted = [...entities].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
  const counts = entities.reduce<Record<Tier, number>>(
    (acc, e) => ({ ...acc, [e.tier]: (acc[e.tier] || 0) + 1 }),
    { HIGH: 0, MEDIUM: 0, LOW: 0, PROVISIONAL: 0 },
  );

  const headlineNumber = counts.HIGH;
  const headlineStatement = `${headlineNumber} of ${meta.entityCount} entities flagged HIGH.`;

  return (
    <div className="py-7 sm:py-9">
      {/* Hero — mirrors Sanjaya's predictor hero pattern */}
      <section className="border-b s-border pb-10 mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] s-accent-green">
          Sanket cyber posture · {fmtScanDate(meta.scanDate)}
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] s-fade">
          Passive reconnaissance · {meta.entityCount} MoPNG entities
        </p>

        <h1 className="mt-8 font-serif text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight s-fg leading-[0.95]">
          {headlineNumber}
          <span className="ml-3 text-3xl sm:text-4xl s-fade font-normal align-baseline">
            HIGH
          </span>
        </h1>

        <p className="mt-5 font-serif text-2xl sm:text-3xl s-fg leading-snug max-w-3xl">
          {headlineStatement}
        </p>

        <p className="mt-3 s-dim text-base max-w-2xl">{meta.tagline}</p>

        {/* Tier counts — mono pill row */}
        <div className="mt-6 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
          <span className="rounded border s-border s-surface px-3 py-1.5 s-fade">
            HIGH <span className="text-red-400 ml-1.5 font-semibold tabular-nums">{counts.HIGH}</span>
          </span>
          <span className="rounded border s-border s-surface px-3 py-1.5 s-fade">
            MEDIUM <span className="text-amber-400 ml-1.5 font-semibold tabular-nums">{counts.MEDIUM}</span>
          </span>
          <span className="rounded border s-border s-surface px-3 py-1.5 s-fade">
            LOW <span className="text-lime-400 ml-1.5 font-semibold tabular-nums">{counts.LOW}</span>
          </span>
          {counts.PROVISIONAL > 0 && (
            <span className="rounded border s-border s-surface px-3 py-1.5 s-fade">
              PROVISIONAL <span className="s-fade ml-1.5 font-semibold tabular-nums">{counts.PROVISIONAL}</span>
            </span>
          )}
        </div>
      </section>

      {/* Urgent strip */}
      {urgent.length > 0 && (
        <section className="mt-2 mb-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] s-accent">
              Urgent · action within 21 days
            </p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold tracking-tight s-fg leading-tight max-w-3xl">
              Four findings need same-week response.
            </h2>
          </div>
          <ul className="mt-5 divide-y divide-zinc-800 border-y border-zinc-800">
            {urgent.map((u, i) => (
              <li
                key={i}
                className="py-3 sm:py-4 s-muted text-[15px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: u }}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Cross-cutting findings */}
      <section className="mt-10 mb-12">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">Pattern</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
            Cross-cutting findings
          </h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-1">
          {crossCutting.map((c, i) => (
            <div
              key={i}
              className="rounded-lg border s-border s-surface p-5 transition hover-s-border"
            >
              <div className="font-serif text-lg font-semibold s-fg leading-snug mb-2">
                {c.title}
              </div>
              <p className="m-0 s-dim text-[15px] leading-relaxed">{c.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Per-entity register */}
      <section className="mt-10 mb-12">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">Register</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
            Per-entity scorecard
          </h2>
        </div>
        <div className="mt-5 rounded-lg border s-border s-surface overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="s-raise">
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] s-fade font-semibold border-b s-border w-28">
                  Tier
                </th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] s-fade font-semibold border-b s-border">
                  Entity
                </th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] s-fade font-semibold border-b s-border">
                  Domain
                </th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] s-fade font-semibold border-b s-border">
                  Findings
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e, i) => (
                <tr
                  key={i}
                  className="border-b s-border last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]"
                >
                  <td className="px-4 py-4 align-top">
                    <span
                      className={`font-mono text-[11px] uppercase tracking-[0.12em] font-semibold ${tierTextClass[e.tier]}`}
                    >
                      {e.tier}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top s-fg font-medium font-serif text-[16px] leading-snug">
                    {e.name}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <code className="font-mono text-xs s-dim bg-white/5 px-1.5 py-0.5 rounded">
                      {e.domain}
                    </code>
                  </td>
                  <td className="px-4 py-4 align-top s-dim text-[14px] leading-relaxed max-w-xl">
                    {e.findings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Methodology */}
      <section className="mt-10 mb-12">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">How</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
            Methodology
          </h2>
        </div>
        <div className="mt-5 rounded-lg border s-border s-surface p-5 s-dim text-[15px] leading-relaxed">
          {meta.methodology}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t s-border s-fade text-sm leading-relaxed">
        <p className="m-0 mb-2">
          Sibling project: <a href="https://sanjaya.amitpatnaik.com" className="s-link">Sanjaya</a>{' '}
          — fuel-pricing transparency on the same Ministry portfolio. Sanjaya narrates; Sanket
          warns.
        </p>
        <p className="m-0">
          Methodology is reproducible by any visitor with{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">curl</code>,{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">dig</code>, and{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">openssl</code>.
          Re-scan cadence: weekly via launchd. Entity findings shared privately with each Chief
          Information Security Officer prior to public publication, with a 30-day remediation
          window.
        </p>
      </footer>
    </div>
  );
}
