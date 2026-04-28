import register from '../data/register.json';
import posture from '../data/posture.json';
import signals from '../data/signals.json';
import newsEvents from '../data/news-events.json';
import sources from '../data/sources.json';
import { SignalCard } from '../components/signal-card';

type Tier = 'HIGH' | 'MEDIUM' | 'LOW' | 'PROVISIONAL';

type Entity = {
  name: string;
  domain: string;
  tier: Tier;
  findings: string;
};

type Severity = 'Critical' | 'High' | 'Watch';

type Signal = {
  id: string;
  severity: Severity;
  title: string;
  summary: string;
  body: string;
  keyAction: string;
  decisionRole: string;
  decisionPoint: string;
};

const tierOrder: Record<Tier, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, PROVISIONAL: 3 };

const tierTextClass: Record<Tier, string> = {
  HIGH: 'text-red-400',
  MEDIUM: 'text-amber-400',
  LOW: 'text-lime-400',
  PROVISIONAL: 's-fade italic',
};

const sevTextClass: Record<Severity, string> = {
  Critical: 'text-red-400',
  High: 'text-amber-400',
  Watch: 'text-lime-400',
};

export default function Home() {
  const { meta, urgent, crossCutting, entities } = register as {
    meta: { tagline: string; scanDate: string; entityCount: number; methodology: string };
    urgent: string[];
    crossCutting: { title: string; summary: string }[];
    entities: Entity[];
  };

  const sortedEntities = [...entities].sort(
    (a, b) => tierOrder[a.tier] - tierOrder[b.tier],
  );
  const counts = entities.reduce<Record<Tier, number>>(
    (acc, e) => ({ ...acc, [e.tier]: (acc[e.tier] || 0) + 1 }),
    { HIGH: 0, MEDIUM: 0, LOW: 0, PROVISIONAL: 0 },
  );

  return (
    <div className="py-7 sm:py-9">
      {/* Hero — sector posture (curated) */}
      <section className="border-b s-border pb-10 mb-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl sm:text-6xl font-semibold tracking-tight s-fg leading-[1]">
              Sanket
            </h1>
            <p className="mt-2 s-dim text-base">Oil and gas cyber security dashboard</p>
          </div>
          <nav className="font-mono text-[11px] uppercase tracking-[0.2em] flex flex-wrap items-center gap-x-5 gap-y-2 s-fade pt-3">
            <a href="#signals" className="hover-s-fg">Threat dashboard</a>
            <a href="#register" className="hover-s-fg">Register</a>
            <a href="#timelines" className="hover-s-fg opacity-60">Timelines · soon</a>
            <a href="#scan" className="hover-s-fg opacity-60">Run scan · soon</a>
            <a href="https://sanjaya.amitpatnaik.com" className="s-link">Sanjaya ↗</a>
          </nav>
          <div className="rounded-lg border s-border s-surface px-5 py-4 min-w-[220px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade">
              Threat posture
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <strong className="font-serif text-5xl s-fg leading-none tabular-nums">
                {posture.score}
              </strong>
              <em className="not-italic font-mono text-[11px] uppercase tracking-[0.16em] text-amber-400">
                {posture.label}
              </em>
            </div>
            <p className="mt-2 m-0 font-mono text-[10px] uppercase tracking-[0.16em] s-fade">
              as of {posture.asOf}
            </p>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {posture.topSignals.map((s, i) => (
            <li
              key={i}
              className={`rounded-lg border-l-2 border s-border s-surface p-4 ${
                s.severity === 'Critical' ? 'border-l-red-500' : 'border-l-amber-500'
              }`}
            >
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.2em] font-semibold ${
                  s.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {s.severity}
              </span>
              <strong className="block mt-1.5 font-serif text-lg s-fg leading-snug">
                {s.title}
              </strong>
              <p className="mt-1.5 m-0 s-dim text-sm leading-relaxed">{s.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Tracked risk signals */}
      <section className="mt-2 mb-14" id="signals">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">Signals</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
            Tracked risk signals
          </h2>
          <p className="mt-1 s-dim text-[15px]">
            Public inputs only. No claims about live PSU systems.
          </p>
        </div>

        {/* Top-priority strip */}
        <div
          className="mt-5 rounded-lg border-l-2 border s-border bg-[rgba(239,71,111,0.06)] px-5 py-4"
          style={{ borderLeftColor: 'var(--sanket-accent)' }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-accent font-semibold">
            Top priority right now
          </p>
          <strong className="block mt-1 font-serif text-xl s-fg leading-snug">
            {posture.topPriority.name}
          </strong>
          <p className="mt-1 m-0 s-dim text-[14.5px] leading-relaxed">
            {posture.topPriority.vector}
          </p>
        </div>

        {/* Signal grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {(signals as Signal[]).map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      </section>

      {/* News tracker */}
      <section className="mt-12 mb-14">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">News tracker</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
            Public-source events feeding v0
          </h2>
        </div>
        <ol className="mt-5 divide-y divide-zinc-800 border-y border-zinc-800">
          {(newsEvents as { date: string; headline: string; flag: string; url: string; source: string }[]).map(
            (e, i) => (
              <li
                key={i}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <time className="shrink-0 font-mono text-xs tabular-nums s-fade sm:w-32">
                  {e.date}
                </time>
                <div className="flex-1">
                  <strong className="block s-fg font-medium leading-snug">{e.headline}</strong>
                  <span className="block mt-1 s-dim text-[14px] leading-relaxed">{e.flag}</span>
                </div>
                <a href={e.url} className="s-link font-mono text-[11px] uppercase tracking-[0.16em]">
                  {e.source} ↗
                </a>
              </li>
            ),
          )}
        </ol>
      </section>

      {/* Public web posture register — my data */}
      <section className="mt-12 mb-14" id="register">
        <div className="flex flex-wrap items-baseline gap-3 justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">Register</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
              Public web posture · {meta.entityCount} MoPNG entities
            </h2>
            <p className="mt-1 s-dim text-[15px] max-w-2xl">{meta.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
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
                PROV <span className="s-fade ml-1.5 font-semibold tabular-nums">{counts.PROVISIONAL}</span>
              </span>
            )}
          </div>
        </div>

        {urgent.length > 0 && (
          <div
            className="mt-5 rounded-lg border-l-2 border s-border bg-[rgba(239,71,111,0.06)] px-5 py-4"
            style={{ borderLeftColor: 'var(--sanket-accent)' }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-accent font-semibold">
              Urgent · action within 21 days
            </p>
            <ul className="mt-3 m-0 pl-5 list-disc s-muted text-sm space-y-1.5 marker:s-fade">
              {urgent.map((u, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: u }} />
              ))}
            </ul>
          </div>
        )}

        {crossCutting.length > 0 && (
          <div className="mt-5 grid gap-3">
            {crossCutting.map((c, i) => (
              <div
                key={i}
                className="rounded-lg border s-border s-surface p-5 transition hover-s-border"
              >
                <strong className="block font-serif text-lg s-fg leading-snug mb-2">
                  {c.title}
                </strong>
                <p className="m-0 s-dim text-[15px] leading-relaxed">{c.summary}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-lg border s-border s-surface overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="s-raise">
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] s-fade font-semibold border-b s-border w-24">
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
              {sortedEntities.map((e, i) => (
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
                  <td className="px-4 py-4 align-top s-dim text-[13.5px] leading-relaxed max-w-xl">
                    {e.findings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Source spine */}
      <section className="mt-12 mb-14" id="sources">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">Source spine</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
            Public inputs behind v0
          </h2>
        </div>
        <ul className="mt-5 divide-y divide-zinc-800 border-y border-zinc-800">
          {(sources as { title: string; url: string; sub: string }[]).map((s, i) => (
            <li key={i} className="py-4">
              <a href={s.url} className="s-link font-medium">
                {s.title} ↗
              </a>
              <p className="mt-1 m-0 s-dim text-sm leading-relaxed">{s.sub}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Coming soon (Phase 2 placeholders) */}
      <section className="mt-12 mb-8" id="timelines">
        <div className="rounded-lg border s-border s-surface p-5 opacity-60">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">
            Timelines · coming
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
            Oil and gas cyber pathways
          </h2>
          <p className="mt-2 m-0 s-dim text-sm">
            Five scenarios · baseline / border crisis / OEM hub compromise / AI vuln surge /
            ransomware crew. Danger index, likely pathway, and action queue per scenario. Phase 2.
          </p>
        </div>
      </section>
      <section className="mt-4 mb-12" id="scan">
        <div className="rounded-lg border s-border s-surface p-5 opacity-60">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] s-fade">
            Run scan · coming
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight s-fg sm:text-2xl">
            Browser posture scan
          </h2>
          <p className="mt-2 m-0 s-dim text-sm">
            Twenty-five client-side checks. No data leaves the device. Plain-English verdict
            plus role briefs for CMD, CISO, and IT admin. Phase 2.
          </p>
        </div>
      </section>

      {/* Methodology footer */}
      <footer className="mt-14 pt-8 border-t s-border s-fade text-sm leading-relaxed">
        <p className="m-0 mb-2">
          Sibling project: <a href="https://sanjaya.amitpatnaik.com" className="s-link">Sanjaya</a>{' '}
          — fuel-pricing transparency on the same Ministry portfolio. Sanjaya narrates; Sanket
          warns.
        </p>
        <p className="m-0">
          Register methodology: passive reconnaissance only —{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">curl</code>,{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">dig</code>,{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">openssl</code>,
          public certificate-transparency logs, public breach databases, public web archives. No
          traffic generated against scanned entity infrastructure beyond what an ordinary
          visitor's browser produces. Re-scan cadence: weekly.
        </p>
      </footer>
    </div>
  );
}
