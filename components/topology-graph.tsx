import type { EntityReport, SubdomainCategory } from '../lib/entities';

type Props = { topology: EntityReport['topology']; domain: string };

const CATEGORY_LABEL: Record<SubdomainCategory, string> = {
  auth: 'Authentication',
  dev: 'Dev / Test / UAT',
  admin: 'Admin',
  docmgmt: 'Document mgmt',
  api: 'API / AI',
  portal: 'Portals',
  infra: 'Infrastructure',
  app: 'Applications',
  web: 'Web',
};

const CATEGORY_COLOR: Record<SubdomainCategory, string> = {
  auth: 'text-red-400 border-red-500/40 bg-red-500/5',
  dev: 'text-amber-400 border-amber-500/40 bg-amber-500/5',
  admin: 'text-red-400 border-red-500/40 bg-red-500/5',
  docmgmt: 'text-amber-400 border-amber-500/40 bg-amber-500/5',
  api: 'text-amber-400 border-amber-500/40 bg-amber-500/5',
  portal: 's-muted border-zinc-700',
  infra: 's-muted border-zinc-700',
  app: 's-muted border-zinc-700',
  web: 's-muted border-zinc-700',
};

export function TopologyGraph({ topology, domain }: Props) {
  // Group sensitive subdomains by category
  const grouped = topology.sensitive.reduce<Record<SubdomainCategory, string[]>>(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s.name);
      return acc;
    },
    {} as Record<SubdomainCategory, string[]>,
  );
  const categories = (Object.keys(grouped) as SubdomainCategory[]).sort((a, b) => {
    const order: SubdomainCategory[] = ['auth', 'admin', 'dev', 'docmgmt', 'api', 'portal', 'infra', 'app', 'web'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="rounded-lg border s-border s-surface p-5">
      <div className="flex items-baseline justify-between mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade">
          Public topology · CT logs
        </p>
        <p className="font-mono text-xs s-fade tabular-nums">
          <span className="s-fg font-semibold">{topology.totalSubdomains}</span> total
          {topology.sensitiveCount > 0 && (
            <>
              {' · '}
              <span className="text-amber-400 font-semibold">{topology.sensitiveCount}</span>{' '}
              <span className="s-fade">sensitive</span>
            </>
          )}
        </p>
      </div>

      {topology.totalSubdomains === 0 ? (
        <p className="m-0 s-fade text-sm italic text-center py-6">
          No subdomains in CT logs — minimal external attack surface.
        </p>
      ) : topology.sensitive.length === 0 ? (
        <p className="m-0 s-dim text-sm">
          {topology.totalSubdomains} subdomain{topology.totalSubdomains === 1 ? '' : 's'} in CT logs;
          no sensitive categories flagged.
        </p>
      ) : (
        <div className="relative">
          {/* Apex node */}
          <div className="flex justify-center mb-4">
            <span className="rounded-md border s-border s-raise px-3 py-1.5 font-mono text-sm s-fg">
              {domain}
            </span>
          </div>

          {/* Category groups */}
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((cat) => (
              <div
                key={cat}
                className={`rounded-md border px-3 py-3 ${CATEGORY_COLOR[cat]}`}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2 font-semibold">
                  {CATEGORY_LABEL[cat]}
                </div>
                <ul className="space-y-1 m-0 p-0 list-none">
                  {grouped[cat].map((name) => (
                    <li key={name} className="font-mono text-[12px] truncate" title={name}>
                      <code className="bg-white/5 px-1 py-0.5 rounded text-[11px]">{name}</code>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 m-0 s-fade text-[12px] leading-relaxed">
        Certificate-transparency logs are immutable and public. Sensitive subdomains advertised here
        cannot be retracted; the mitigation is forward-only — new internal services route through a
        private CA that does not submit to public CT.
      </p>
    </div>
  );
}
