import type { EntityReport } from '../lib/entities';

type PatchItem = NonNullable<EntityReport['phase2']>['cisoPatchList'][number];
type Props = { patches: PatchItem[] };

const SEVERITY_COLOR: Record<PatchItem['severity'], string> = {
  critical: 'text-red-400 border-red-500/50 bg-red-500/5',
  high: 'text-amber-400 border-amber-500/50 bg-amber-500/5',
  medium: 'text-lime-400 border-lime-500/40 bg-lime-500/5',
};

const TIER_LABEL: Record<PatchItem['tier'], string> = {
  1: 'Tier 1 · within 7 days',
  2: 'Tier 2 · within 30 days',
  3: 'Tier 3 · within 90 days',
};

const TIER_COLOR: Record<PatchItem['tier'], string> = {
  1: 'text-red-400',
  2: 'text-amber-400',
  3: 'text-lime-400',
};

export function CISOPatchTable({ patches }: Props) {
  const grouped = [1, 2, 3].map((tier) => ({
    tier: tier as PatchItem['tier'],
    items: patches.filter((p) => p.tier === tier),
  }));

  return (
    <div className="space-y-5">
      {grouped.map(({ tier, items }) =>
        items.length === 0 ? null : (
          <div key={tier} className="rounded-lg border s-border s-surface overflow-hidden">
            <div className="s-raise border-b s-border px-4 py-3">
              <p
                className={`font-mono text-[11px] uppercase tracking-[0.18em] font-semibold ${TIER_COLOR[tier]}`}
              >
                {TIER_LABEL[tier]}
              </p>
            </div>
            <ul className="m-0 p-0 list-none">
              {items.map((p, i) => (
                <li
                  key={i}
                  className="border-b s-border last:border-b-0 px-4 py-4 hover:bg-white/[0.02]"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span
                      className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold ${SEVERITY_COLOR[p.severity]}`}
                    >
                      {p.severity}
                    </span>
                    <h4 className="m-0 flex-1 font-sans font-semibold text-[15px] s-fg leading-snug tracking-tight">
                      {p.title}
                    </h4>
                  </div>
                  <dl className="ml-0 sm:ml-[3.5rem] grid grid-cols-1 sm:grid-cols-[6rem_1fr] gap-x-4 gap-y-1.5 text-[13px]">
                    <Row label="Host" value={<code className="font-mono s-dim">{p.host}</code>} />
                    {p.cve && <Row label="CVE" value={<code className="font-mono text-amber-300">{p.cve}</code>} />}
                    <Row label="Fix" value={<span className="s-muted">{p.fix}</span>} />
                    <Row label="Owner" value={<span className="s-muted">{p.owner}</span>} />
                    <Row
                      label="Validation"
                      value={
                        <code className="font-mono text-[12px] s-dim bg-white/5 px-1.5 py-0.5 rounded inline-block">
                          {p.validation}
                        </code>
                      }
                    />
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        ),
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] s-fade mt-0.5">{label}</dt>
      <dd className="m-0 leading-relaxed">{value}</dd>
    </>
  );
}
