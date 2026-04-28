import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] s-fade mb-3">404</p>
      <h1 className="font-serif text-3xl s-fg mb-3">Entity not found</h1>
      <p className="s-dim mb-6">No Sanket assessment exists for this slug.</p>
      <Link
        href="/"
        className="font-mono text-[11px] uppercase tracking-[0.16em] s-link"
      >
        ← Sanket directory
      </Link>
    </div>
  );
}
