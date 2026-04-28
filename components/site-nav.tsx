export function SiteNav() {
  return (
    <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-start justify-between gap-4 px-6 pt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
      <div className="flex min-w-0 flex-col gap-1">
        <a
          href="https://amitpatnaik.com"
          className="font-semibold text-zinc-100 hover:text-zinc-400"
        >
          Amit Patnaik
        </a>
        <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Product house · Sanket
        </span>
      </div>
      <ul className="m-0 flex list-none flex-wrap items-baseline gap-[14px] p-0 sm:gap-[22px]">
        <li>
          <a href="https://amitpatnaik.com/essays/" className="text-zinc-500 hover-s-fg">
            Essays
          </a>
        </li>
        <li>
          <a href="https://sanjaya.amitpatnaik.com" className="text-zinc-500 hover-s-fg">
            Sanjaya
          </a>
        </li>
        <li>
          <span className="s-fg">Sanket</span>
        </li>
        <li>
          <a href="https://amitpatnaik.com/tools/" className="text-zinc-500 hover-s-fg">
            Tools
          </a>
        </li>
      </ul>
    </nav>
  );
}
