export function SiteNav() {
  return (
    <nav className="mx-auto flex w-full max-w-[1480px] flex-wrap items-start justify-between gap-4 px-5 sm:px-6 pt-6 font-mono text-[11px] uppercase tracking-[0.2em] s-fade">
      <div className="flex min-w-0 flex-col gap-1">
        <a
          href="https://amitpatnaik.com"
          className="font-semibold s-fg hover-s-dim"
        >
          Amit Patnaik
        </a>
        <span className="text-[10px] uppercase tracking-[0.16em]">
          Product house · Sanket
        </span>
      </div>
      <ul className="m-0 flex list-none flex-wrap items-baseline gap-[14px] p-0 sm:gap-[22px]">
        <li>
          <a href="https://amitpatnaik.com/products/" className="s-fade hover-s-fg">
            Products
          </a>
        </li>
        <li>
          <a href="https://amitpatnaik.com/writing/" className="s-fade hover-s-fg">
            Writing
          </a>
        </li>
        <li>
          <a href="https://amitpatnaik.com/about/" className="s-fade hover-s-fg">
            About
          </a>
        </li>
        <li>
          <a href="https://amitpatnaik.com/search/" className="s-fade hover-s-fg">
            Search
          </a>
        </li>
      </ul>
    </nav>
  );
}
