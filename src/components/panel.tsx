export function Panel({
  id, title, meta, actions, className = "", flush = false, children,
}: {
  id?: string;
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  flush?: boolean; // no inner padding, for tables that run edge to edge
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`min-w-0 scroll-mt-20 border border-line bg-panel ${className}`}>
      <header className="flex min-h-10 items-center justify-between gap-3 border-b border-line bg-panel-head px-4 py-2">
        <div className="flex items-baseline gap-3">
          <h2 className="label !text-ink">{title}</h2>
          {meta && <span className="text-xs text-muted">{meta}</span>}
        </div>
        {actions}
      </header>
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}
