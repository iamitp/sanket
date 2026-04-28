import type { EntityReport, AttackPathDetection, AttackPathEffort } from '../lib/entities';

type AttackPath = NonNullable<EntityReport['phase2']>['attackPaths'][number];

type Props = { paths: AttackPath[] };

const EFFORT_LABEL: Record<AttackPathEffort, string> = {
  hours: 'hours',
  days: 'days',
  weeks: 'weeks',
};

const EFFORT_COLOR: Record<AttackPathEffort, string> = {
  hours: 'text-red-400',
  days: 'text-amber-400',
  weeks: 'text-lime-400',
};

const DETECTION_COLOR: Record<AttackPathDetection, string> = {
  low: 'text-red-400',
  medium: 'text-amber-400',
  high: 'text-lime-400',
};

const DETECTION_LABEL: Record<AttackPathDetection, string> = {
  low: 'low (bad)',
  medium: 'medium',
  high: 'high (good)',
};

function priorityBadge(p: number): { label: string; color: string } {
  if (p === 1) return { label: '#1', color: 'bg-red-500/20 text-red-400 border-red-500/50' };
  if (p === 2) return { label: '#2', color: 'bg-amber-500/20 text-amber-400 border-amber-500/50' };
  if (p === 3) return { label: '#3', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
  return { label: `#${p}`, color: 's-fade border-zinc-700' };
}

export function AttackPathFlow({ paths }: Props) {
  const sorted = [...paths].sort((a, b) => a.priority - b.priority);
  return (
    <div className="rounded-lg border s-border s-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade mb-1">
        Attack-path simulation
      </p>
      <p className="m-0 mb-5 s-dim text-[13px]">
        Mythos-class adversary analytical chain · paths ranked by exploitability × access value.
      </p>

      <div className="space-y-4">
        {sorted.map((p) => {
          const pri = priorityBadge(p.priority);
          return (
            <article
              key={p.id}
              className="rounded-md border s-border bg-black/20 p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <span
                  className={`shrink-0 rounded border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold ${pri.color}`}
                >
                  {pri.label}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="m-0 font-serif text-lg s-fg leading-snug">
                    Path {p.id}: {p.name}
                  </h4>
                </div>
                <div className="shrink-0 text-right text-[11px] font-mono">
                  <div>
                    <span className="s-fade">effort </span>
                    <span className={`${EFFORT_COLOR[p.effort]} font-semibold`}>
                      {EFFORT_LABEL[p.effort]}
                    </span>
                  </div>
                  <div>
                    <span className="s-fade">detect </span>
                    <span className={`${DETECTION_COLOR[p.detection]} font-semibold`}>
                      {DETECTION_LABEL[p.detection]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PathStep label="Entry" body={p.entry} />
                <PathArrow />
                <PathStep label="Pivot" body={p.pivot} />
                <PathArrow />
                <PathStep label="Objective" body={p.objective} accent />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PathStep({ label, body, accent = false }: { label: string; body: string; accent?: boolean }) {
  return (
    <div
      className={`rounded p-3 border ${
        accent
          ? 'border-[var(--sanket-accent)]/40 bg-[rgba(239,71,111,0.06)]'
          : 's-border bg-black/30'
      }`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] s-fade mb-1.5">{label}</div>
      <div className={`text-[13px] leading-relaxed ${accent ? 's-fg' : 's-muted'}`}>{body}</div>
    </div>
  );
}

function PathArrow() {
  return (
    <div className="hidden sm:flex items-center justify-center text-2xl s-fade -mx-3">→</div>
  );
}
