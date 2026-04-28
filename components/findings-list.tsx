type Props = { findings: string[]; title?: string };

export function FindingsList({ findings, title = 'Findings' }: Props) {
  if (findings.length === 0) return null;
  return (
    <div className="rounded-lg border s-border s-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade mb-3">{title}</p>
      <ul className="m-0 p-0 list-none space-y-2.5">
        {findings.map((f, i) => (
          <li key={i} className="flex gap-3 s-muted text-[14.5px] leading-relaxed">
            <span className="s-fade font-mono text-[11px] tabular-nums shrink-0 mt-0.5">
              {(i + 1).toString().padStart(2, '0')}
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
