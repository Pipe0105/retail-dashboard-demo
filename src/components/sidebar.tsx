import type { Session } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import { longDate } from "@/lib/format";
import { Wordmark } from "./logo";

interface NavItem {
  href: string;
  label: string;
  badge?: number;
}

export function Sidebar({
  session, dataThrough, lowStockCount, showStores,
}: { session: Session; dataThrough: string; lowStockCount: number; showStores: boolean }) {
  const nav: NavItem[] = [
    { href: "#overview", label: "Overview" },
    { href: "#categories", label: "Categories" },
    ...(showStores ? [{ href: "#stores", label: "Stores" }] : []),
    { href: "#products", label: "Products" },
    { href: "#inventory", label: "Inventory", badge: lowStockCount },
  ];
  const scope = session.role === "admin" ? "Administrator · all stores" : `Store manager · ${session.storeName}`;
  const initials = session.name.split(" ").map((p) => p[0]).join("").slice(0, 2);

  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col bg-rail text-rail-ink lg:flex">
        <div className="border-b border-rail-2 px-5 py-5">
          <Wordmark />
        </div>

        <nav className="flex-1 px-3 py-4" aria-label="Sections">
          <p className="label px-2 pb-2 !text-rail-muted">Sales</p>
          <ul className="space-y-px">
            {nav.map((n, i) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className={`flex items-center justify-between border-l-2 px-3 py-2 text-[13px] transition-colors hover:bg-rail-2 hover:text-white ${
                    i === 0 ? "border-[#f0a020] bg-rail-2 text-white" : "border-transparent"
                  }`}
                >
                  {n.label}
                  {n.badge ? (
                    <span className="num rounded-sm bg-[#f0a020] px-1.5 text-[11px] font-medium text-rail" title="Items below reorder point">
                      {n.badge}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-rail-2 px-5 py-3 text-[11px] text-rail-muted">
          <p>
            Data through <span className="num text-rail-ink">{longDate(dataThrough)}</span>
          </p>
          <p className="mt-0.5">Synthetic demo dataset</p>
        </div>

        <div className="flex items-center gap-3 border-t border-rail-2 px-5 py-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-rail-2 text-xs font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] text-white">{session.name}</p>
            <p className="truncate text-[11px] text-rail-muted">{scope}</p>
          </div>
          <form action={logout}>
            <button className="text-[11px] text-rail-muted underline-offset-2 hover:text-white hover:underline">Sign out</button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between bg-rail px-4 py-3 text-rail-ink lg:hidden">
        <Wordmark />
        <div className="flex items-center gap-3 text-right">
          <div className="leading-tight">
            <p className="text-xs text-white">{session.name}</p>
            <p className="text-[10px] text-rail-muted">{session.role === "admin" ? "Admin" : session.storeName}</p>
          </div>
          <form action={logout}>
            <button className="border border-rail-2 px-2 py-1 text-[11px] hover:text-white">Sign out</button>
          </form>
        </div>
      </header>
    </>
  );
}
