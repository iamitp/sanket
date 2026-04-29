import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ENTITY_SLUGS,
  applyDailyCheck,
  loadEntity,
  loadDailyEntityCheck,
  tierColor,
} from '../../../lib/entities';
import { SecurityGauge } from '../../../components/security-gauge';
import { HeaderHardeningMatrix } from '../../../components/header-hardening-matrix';
import { EmailAuthStrip } from '../../../components/email-auth-strip';
import { TLSSecurityCard } from '../../../components/tls-security-card';
import { TopologyGraph } from '../../../components/topology-graph';
import { LookalikesCard } from '../../../components/lookalikes-card';
import { FindingsList } from '../../../components/findings-list';
import { AttackPathFlow } from '../../../components/attack-path-flow';
import { MythosCompressionChart } from '../../../components/mythos-compression-chart';
import { CISOPatchTable } from '../../../components/ciso-patch-table';
import { UrgentActionsStrip } from '../../../components/urgent-actions-strip';

export function generateStaticParams() {
  return ENTITY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = loadEntity(slug);
  if (!e) return {};
  return {
    title: `${e.short} — Sanket security`,
    description: e.oneLine,
  };
}

export default async function EntityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseline = loadEntity(slug);
  if (!baseline) notFound();
  const daily = loadDailyEntityCheck(slug);
  const e = applyDailyCheck(baseline, daily);

  return (
    <div className="py-7 sm:py-9">
      {/* Breadcrumb */}
      <nav className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] s-fade">
        <Link href="/" className="hover-s-fg">
          Sanket
        </Link>
        <span className="mx-2">/</span>
        <span className="s-muted">{e.short}</span>
      </nav>

      {/* Hero */}
      <section className="border-b s-border pb-8 mb-10">
        <p
          className={`font-mono text-[11px] uppercase tracking-[0.2em] mb-2 ${tierColor(e.tier)}`}
        >
          {e.tier} · {e.category}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight s-fg leading-[1] mb-3">
          {e.name}
        </h1>
        <p className="s-dim text-base mb-2 max-w-3xl">{e.oneLine}</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] s-fade">
          <code className="bg-white/5 px-1.5 py-0.5 rounded mr-3">{e.domain}</code>
          baseline scan {baseline.scanDate}
          {daily && <> · daily passive check {daily.checkedDate}</>}
          {e.phase2 && <> · Phase 2 active scan {e.phase2.runDate}</>}
        </p>
      </section>

      {daily && (
        <section className="rounded-lg border s-border s-raise px-5 py-4 mb-8">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] s-accent-green font-semibold">
              Daily passive check · {daily.checkedDate}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] s-fade">
              score {daily.attentionScore}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] s-fade mb-1">
                Availability
              </p>
              <p className="m-0 s-muted text-sm">
                {daily.availability.ok
                  ? `HTTP ${daily.availability.statusCode ?? 'ok'}`
                  : daily.availability.error ?? 'No response'}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] s-fade mb-1">
                TLS
              </p>
              <p className="m-0 s-muted text-sm">
                {daily.tls.expiresOn
                  ? `${daily.tls.expiresOn} · ${daily.tls.daysToExpiry ?? 'n/a'}d`
                  : daily.tls.state}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] s-fade mb-1">
                Headers
              </p>
              <p className="m-0 s-muted text-sm">
                {daily.headerFindings.missing.length || daily.headerFindings.permissive.length
                  ? `${daily.headerFindings.missing.length} missing · ${daily.headerFindings.permissive.length} permissive`
                  : 'tracked set present'}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] s-fade mb-1">
                Email auth
              </p>
              <p className="m-0 s-muted text-sm">
                SPF {daily.emailAuth.spf} · DMARC {daily.emailAuth.dmarc}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Top row: security gauge + urgent actions */}
      <section className="grid gap-4 lg:grid-cols-[260px_1fr] mb-8">
        <SecurityGauge score={e.securityScore} label={e.riskLabel} />
        <div className="space-y-4">
          <FindingsList findings={e.findings} title="Headline findings" />
          {e.urgentActions.length > 0 && <UrgentActionsStrip actions={e.urgentActions} />}
        </div>
      </section>

      {/* Security diagnostics row */}
      <section className="grid gap-4 md:grid-cols-2 mb-8">
        <TLSSecurityCard tls={e.tls} />
        <EmailAuthStrip emailAuth={e.emailAuth} />
        <HeaderHardeningMatrix headers={e.headers} />
        <LookalikesCard lookalikes={e.lookalikes} />
      </section>

      {/* Topology */}
      <section className="mb-10">
        <TopologyGraph topology={e.topology} domain={e.domain} />
      </section>

      {/* Phase 2 — only if data exists */}
      {e.phase2 ? (
        <>
          {/* Phase 2 header banner */}
          <section className="rounded-lg border s-border s-raise px-5 py-4 mb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] s-accent-green font-semibold mb-1">
              Phase 2 · Active scan complete
            </p>
            <p className="m-0 s-dim text-[14px]">
              Authorised ethical-hacking assessment ran on {e.phase2.runDate}. Active fingerprinting,
              CVE matching, Mythos-class adversary simulation, and CISO patch list below.
            </p>
            {e.phase2.headlineQuestion && (
              <div
                className="mt-4 rounded border-l-2 border s-border bg-[rgba(239,71,111,0.06)] px-4 py-3"
                style={{ borderLeftColor: 'var(--sanket-accent)' }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-accent font-semibold mb-1.5">
                  Single-question version for MD
                </p>
                <p className="m-0 font-serif text-[15px] s-fg italic leading-snug">
                  {e.phase2.headlineQuestion}
                </p>
              </div>
            )}
          </section>

          {/* Fingerprints */}
          <section className="rounded-lg border s-border s-surface p-5 mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade mb-4">
              Active fingerprints · per host
            </p>
            <ul className="m-0 p-0 list-none space-y-3">
              {e.phase2.fingerprints.map((f, i) => (
                <li key={i} className="border-b s-border pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                    <code className="font-mono text-[13px] s-fg bg-white/5 px-1.5 py-0.5 rounded">
                      {f.host}
                    </code>
                    {f.eolFlags.length > 0 && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-red-400 font-semibold">
                        EOL × {f.eolFlags.length}
                      </span>
                    )}
                  </div>
                  <p className="m-0 s-muted text-[13.5px] leading-relaxed">{f.stack}</p>
                  {f.eolFlags.length > 0 && (
                    <ul className="mt-1.5 m-0 p-0 list-none space-y-0.5">
                      {f.eolFlags.map((flag, j) => (
                        <li key={j} className="text-[12px] text-red-300 font-mono">
                          ⚠ {flag}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Attack paths */}
          <section className="mb-8">
            <AttackPathFlow paths={e.phase2.attackPaths} />
          </section>

          {/* Mythos compression */}
          <section className="mb-8">
            <MythosCompressionChart
              compression={e.phase2.mythosCompression}
              paths={e.phase2.attackPaths}
            />
          </section>

          {/* CISO patch list */}
          <section className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade mb-3">
              CISO patch list
            </p>
            <CISOPatchTable patches={e.phase2.cisoPatchList} />
          </section>
        </>
      ) : (
        <section className="rounded-lg border s-border s-surface p-5 mb-10 opacity-80">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] s-fade font-semibold mb-2">
            Phase 2 · Pending authorisation
          </p>
          <p className="m-0 s-dim text-[14px] leading-relaxed">
            Active vulnerability assessment for this entity is pending Ministry-letter authorisation
            (or per-entity CMD acknowledgement). When authorised, this section will populate with
            active fingerprints, CVE matches, Mythos-class adversary simulation, and a CISO patch
            list — same format as the NRL entry.
          </p>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-10 pt-8 border-t s-border s-fade text-sm leading-relaxed">
        <p className="m-0 mb-2">
          Methodology is reproducible by any visitor with{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">curl</code>,{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">dig</code>, and{' '}
          <code className="font-mono text-xs s-dim bg-white/5 px-1 py-0.5 rounded">openssl</code>.
          Phase 1 (passive) findings are unconditional; Phase 2 (active) findings require
          per-entity ethical-hacking authorisation.
        </p>
        <p className="m-0">
          Sibling: <a href="https://sanjaya.amitpatnaik.com" className="s-link">Sanjaya</a> — fuel
          pricing transparency on the same Ministry portfolio. Sanjaya narrates; Sanket warns.
        </p>
      </footer>
    </div>
  );
}
