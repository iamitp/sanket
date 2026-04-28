import type { EntityReport } from '../lib/entities';

type Props = { emailAuth: EntityReport['emailAuth'] };

const SPF_COLOR: Record<EntityReport['emailAuth']['spf'], string> = {
  strict: 'text-lime-400 border-lime-500/40',
  present: 'text-lime-400 border-lime-500/40',
  soft: 'text-amber-400 border-amber-500/40',
  broken: 'text-red-400 border-red-500/40',
  missing: 'text-red-400 border-red-500/40',
};

const DKIM_COLOR: Record<EntityReport['emailAuth']['dkim'], string> = {
  present: 'text-lime-400 border-lime-500/40',
  missing: 'text-red-400 border-red-500/40',
  unknown: 's-fade border-zinc-700',
};

const DMARC_COLOR: Record<EntityReport['emailAuth']['dmarc'], string> = {
  reject: 'text-lime-400 border-lime-500/40',
  quarantine: 'text-amber-400 border-amber-500/40',
  none: 'text-red-400 border-red-500/40',
  absent: 'text-red-400 border-red-500/40',
};

export function EmailAuthStrip({ emailAuth }: Props) {
  return (
    <div className="rounded-lg border s-border s-surface p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade mb-3">
        Email authentication
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div className={`rounded border px-3 py-2.5 text-center ${SPF_COLOR[emailAuth.spf]}`}>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] s-fade">SPF</div>
          <div className="mt-0.5 font-mono text-sm font-semibold uppercase tracking-wider">
            {emailAuth.spf}
          </div>
        </div>
        <div className={`rounded border px-3 py-2.5 text-center ${DKIM_COLOR[emailAuth.dkim]}`}>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] s-fade">DKIM</div>
          <div className="mt-0.5 font-mono text-sm font-semibold uppercase tracking-wider">
            {emailAuth.dkim}
          </div>
        </div>
        <div className={`rounded border px-3 py-2.5 text-center ${DMARC_COLOR[emailAuth.dmarc]}`}>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] s-fade">DMARC</div>
          <div className="mt-0.5 font-mono text-sm font-semibold uppercase tracking-wider">
            {emailAuth.dmarc}
          </div>
        </div>
      </div>
      {emailAuth.note && <p className="mt-3 m-0 s-dim text-[13px] leading-relaxed">{emailAuth.note}</p>}
    </div>
  );
}
