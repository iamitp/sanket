import type { EntityReport } from '../lib/entities';

type Props = { lookalikes: EntityReport['lookalikes'] };

export function LookalikesCard({ lookalikes }: Props) {
  if (lookalikes.length === 0) {
    return (
      <div className="rounded-lg border s-border s-surface p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade mb-2">
          Lookalike domains
        </p>
        <p className="m-0 s-fade text-sm italic">No typosquats identified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border s-border s-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade mb-3">
        Lookalike domains
      </p>
      <ul className="space-y-2 m-0 p-0 list-none">
        {lookalikes.map((l, i) => (
          <li key={i} className="text-sm border-b s-border pb-2 last:border-b-0 last:pb-0">
            <code className="font-mono text-[12px] s-muted bg-white/5 px-1.5 py-0.5 rounded">
              {l.domain}
            </code>
            {l.resolvesTo && (
              <span className="ml-2 s-fade text-[12px]">→ {l.resolvesTo}</span>
            )}
            {l.note && <p className="mt-1 m-0 s-fade text-[12px] italic">{l.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
