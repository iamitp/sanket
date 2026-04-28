import type { EntityReport } from '../lib/entities';

type Props = {
  compression: NonNullable<EntityReport['phase2']>['mythosCompression'];
  paths: NonNullable<EntityReport['phase2']>['attackPaths'];
};

// Map text effort estimates to log-scale rough widths (in arbitrary units)
function unitsFor(timeStr: string): number {
  const s = timeStr.toLowerCase();
  if (s.includes('hour')) return 1;
  if (s.includes('day')) return 4;
  if (s.includes('week')) return 16;
  if (s.includes('month')) return 64;
  return 2;
}

export function MythosCompressionChart({ compression, paths }: Props) {
  const pathsById = Object.fromEntries(paths.map((p) => [p.id, p]));
  const maxUnits = Math.max(
    ...compression.paths.map((c) => Math.max(unitsFor(c.preAi), unitsFor(c.mythos))),
  );

  return (
    <div className="rounded-lg border s-border s-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade mb-1">
        Mythos compression
      </p>
      <p className="m-0 mb-5 s-dim text-[13px]">
        Discovery-time compression: pre-AI adversary vs Mythos-class adversary, per attack path.
      </p>

      <div className="space-y-5">
        {compression.paths.map((c) => {
          const path = pathsById[c.pathId];
          const preW = (unitsFor(c.preAi) / maxUnits) * 100;
          const mythosW = (unitsFor(c.mythos) / maxUnits) * 100;
          return (
            <div key={c.pathId}>
              <div className="flex items-baseline justify-between mb-2 gap-2">
                <div className="text-sm s-fg font-medium truncate">
                  Path {c.pathId} · {path?.name || ''}
                </div>
                <div className="font-mono text-[11px] s-fade tabular-nums shrink-0">
                  factor <span className="text-amber-400 font-semibold">{c.factor}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] s-fade">
                    pre-AI
                  </div>
                  <div className="flex-1 bg-black/40 rounded h-4 relative overflow-hidden">
                    <div
                      className="h-full bg-zinc-600/60 rounded"
                      style={{ width: `${preW}%` }}
                    />
                  </div>
                  <div className="w-32 shrink-0 font-mono text-[11px] s-muted text-right">
                    {c.preAi}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] s-fade">
                    Mythos
                  </div>
                  <div className="flex-1 bg-black/40 rounded h-4 relative overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${mythosW}%`,
                        background:
                          'linear-gradient(90deg, var(--sanket-accent), var(--sanket-accent-soft))',
                      }}
                    />
                  </div>
                  <div className="w-32 shrink-0 font-mono text-[11px] s-fg text-right font-semibold">
                    {c.mythos}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 m-0 s-fade text-[12px] leading-relaxed">
        The compression factor is reasoned, not measured. Mythos-class capability changes the tempo
        of attack-path traversal; the topology of the chain is unchanged.
      </p>
    </div>
  );
}
