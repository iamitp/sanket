import type { EntityReport } from '../lib/entities';

type Props = { actions: EntityReport['urgentActions'] };

export function UrgentActionsStrip({ actions }: Props) {
  if (actions.length === 0) return null;
  return (
    <div
      className="rounded-lg border-l-2 border s-border bg-[rgba(239,71,111,0.06)] px-5 py-4"
      style={{ borderLeftColor: 'var(--sanket-accent)' }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-accent font-semibold mb-3">
        Urgent · time-bound actions
      </p>
      <ul className="m-0 p-0 list-none space-y-2">
        {actions.map((a, i) => (
          <li key={i} className="flex items-baseline gap-3 text-sm s-muted">
            <span
              className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums font-semibold ${
                a.days <= 7 ? 'text-red-400' : a.days <= 30 ? 'text-amber-400' : 's-fade'
              }`}
            >
              {a.days}d
            </span>
            <span className="flex-1">{a.what}</span>
            <span className="s-fade text-[11px] font-mono shrink-0">{a.due}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
