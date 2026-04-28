import type { EntityReport, HeaderState } from '../lib/entities';

type Props = { headers: EntityReport['headers'] };

const HEADER_LIST: { key: keyof EntityReport['headers']; label: string }[] = [
  { key: 'hsts', label: 'HSTS' },
  { key: 'csp', label: 'CSP' },
  { key: 'xFrame', label: 'X-Frame' },
  { key: 'xContentType', label: 'X-Content-Type' },
  { key: 'referrerPolicy', label: 'Referrer-Policy' },
  { key: 'permissionsPolicy', label: 'Permissions-Policy' },
];

function dotClass(state: HeaderState): string {
  if (state === true) return 'bg-lime-500';
  if (state === 'permissive') return 'bg-amber-400';
  return 'bg-red-500';
}

function dotLabel(state: HeaderState): string {
  if (state === true) return 'present';
  if (state === 'permissive') return 'permissive';
  return 'missing';
}

export function HeaderHardeningMatrix({ headers }: Props) {
  const present = HEADER_LIST.filter((h) => headers[h.key] === true).length;
  const permissive = HEADER_LIST.filter((h) => headers[h.key] === 'permissive').length;
  const missing = HEADER_LIST.length - present - permissive;

  return (
    <div className="rounded-lg border s-border s-surface p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade">Hardening headers</p>
        <p className="font-mono text-xs s-fade tabular-nums">
          <span className="text-lime-400">{present}</span> /{' '}
          <span className="text-amber-400">{permissive}</span> /{' '}
          <span className="text-red-400">{missing}</span>
          <span className="ml-2 s-fade">present/permissive/missing</span>
        </p>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {HEADER_LIST.map(({ key, label }) => {
          const state = headers[key];
          return (
            <li key={key} className="flex items-center gap-2 text-sm">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotClass(state)}`} />
              <span className="s-muted">{label}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] s-fade ml-auto">
                {dotLabel(state)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
