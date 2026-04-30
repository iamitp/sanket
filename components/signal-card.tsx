'use client';

import { useState } from 'react';

type Severity = 'Critical' | 'High' | 'Watch';

type Signal = {
  id: string;
  severity: Severity;
  title: string;
  summary: string;
  body: string;
  keyAction: string;
  decisionRole: string;
  decisionPoint: string;
};

const sevClass: Record<Severity, string> = {
  Critical: 'text-red-400 border-l-red-500',
  High: 'text-amber-400 border-l-amber-500',
  Watch: 'text-lime-400 border-l-lime-500',
};

export function SignalCard({ signal }: { signal: Signal }) {
  const [open, setOpen] = useState(false);
  const [sevColor, sevBorder] = sevClass[signal.severity].split(' ');

  return (
    <article
      className={`rounded-lg border-l-2 border s-border s-surface p-5 transition hover-s-border ${sevBorder}`}
    >
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.2em] font-semibold ${sevColor}`}
      >
        {signal.severity}
      </span>
      <h3 className="mt-2 font-sans font-semibold text-[18px] s-fg leading-snug tracking-tight">{signal.title}</h3>
      <p className="mt-2 s-dim text-[15px] leading-relaxed">{signal.summary}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] s-fade hover:s-fg transition"
      >
        {open ? 'Hide detail ↑' : 'Detail ↓'}
      </button>
      {open && (
        <div className="mt-4 pt-4 border-t s-border space-y-4">
          <p className="s-muted text-[14.5px] leading-relaxed m-0">{signal.body}</p>
          <dl className="space-y-3">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade font-semibold">
                Key action
              </dt>
              <dd className="mt-1 m-0 s-muted text-[14.5px] leading-relaxed">
                {signal.keyAction}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] s-fade font-semibold">
                Decision point for {signal.decisionRole}
              </dt>
              <dd className="mt-1 m-0 s-muted text-[14.5px] leading-relaxed italic">
                {signal.decisionPoint}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </article>
  );
}
