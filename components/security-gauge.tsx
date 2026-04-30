import type { EntityReport } from '../lib/entities';

type Props = { score: number; label: EntityReport['riskLabel']; size?: number };

const labelColor: Record<EntityReport['riskLabel'], string> = {
  Critical: '#f87171',
  Elevated: '#fbbf24',
  Watch: '#facc15',
  Normal: '#a3d927',
};

export function SecurityGauge({ score, label, size = 220 }: Props) {
  // Semicircle: -90deg sweep, score 0-100 maps to 0-180deg arc fill
  const w = size;
  const h = size / 2 + 18;
  const cx = w / 2;
  const cy = size / 2 + 4;
  const r = size / 2 - 18;
  const arcLen = Math.PI * r;
  const fillLen = (Math.max(0, Math.min(100, score)) / 100) * arcLen;

  // Path for semicircle
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const fillColor = labelColor[label];

  return (
    <div className="rounded-lg border s-border s-surface p-4 flex flex-col items-center">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path d={arc} fill="none" stroke="var(--sanket-border)" strokeWidth={14} strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke={fillColor}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${fillLen} ${arcLen}`}
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="fill-[var(--sanket-fg)]"
          style={{ fontFamily: '"Inter", ui-sans-serif, -apple-system, sans-serif', fontSize: size * 0.32, fontWeight: 600 }}
        >
          {score}
        </text>
      </svg>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] s-fade">Security score</p>
      <p
        className="mt-1 font-mono text-xs uppercase tracking-[0.16em] font-semibold"
        style={{ color: fillColor }}
      >
        {label}
      </p>
    </div>
  );
}
