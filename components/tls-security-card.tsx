import type { EntityReport } from '../lib/entities';

type Props = { tls: EntityReport['tls'] };

function expiryColor(days?: number): string {
  if (days == null) return 's-fade';
  if (days < 14) return 'text-red-400';
  if (days < 60) return 'text-amber-400';
  return 'text-lime-400';
}

function stateColor(state: EntityReport['tls']['state']): string {
  switch (state) {
    case 'pass':
      return 'text-lime-400';
    case 'warn':
      return 'text-amber-400';
    case 'fail':
      return 'text-red-400';
    default:
      return 's-fade';
  }
}

export function TLSSecurityCard({ tls }: Props) {
  return (
    <div className="rounded-lg border s-border s-surface p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade">TLS security</p>
        <p
          className={`font-mono text-[11px] uppercase tracking-[0.16em] font-semibold ${stateColor(
            tls.state,
          )}`}
        >
          {tls.state}
        </p>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="s-fade font-mono text-[11px] uppercase tracking-[0.12em]">Issuer</dt>
          <dd className="m-0 s-muted text-right">{tls.issuer || '—'}</dd>
        </div>
        {tls.expiresOn && (
          <div className="flex justify-between gap-3">
            <dt className="s-fade font-mono text-[11px] uppercase tracking-[0.12em]">Expires</dt>
            <dd className={`m-0 text-right tabular-nums font-mono ${expiryColor(tls.daysToExpiry)}`}>
              {tls.expiresOn}
              {tls.daysToExpiry != null && (
                <span className="ml-2 s-fade">
                  ({tls.daysToExpiry < 0 ? 'EXPIRED' : `${tls.daysToExpiry}d`})
                </span>
              )}
            </dd>
          </div>
        )}
      </dl>

      {tls.note && <p className="mt-3 m-0 s-dim text-[13px] leading-relaxed">{tls.note}</p>}
    </div>
  );
}
