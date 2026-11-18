/** Lumen Market mark: three ascending shelves, the top one lit in amber. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden>
      <rect x="0.5" y="0.5" width="27" height="27" rx="2" fill="#13263f" stroke="#2c4566" />
      <rect x="6" y="17" width="16" height="3" fill="#6f8299" />
      <rect x="6" y="12" width="12" height="3" fill="#c5d0de" />
      <rect x="6" y="7" width="8" height="3" fill="#f0a020" />
    </svg>
  );
}

export function Wordmark({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <div className="leading-none">
        <p className={`text-[13px] font-semibold tracking-[0.14em] ${dark ? "text-white" : "text-ink"}`}>LUMEN MARKET</p>
        <p className={`mt-1 text-[10px] tracking-[0.12em] ${dark ? "text-rail-muted" : "text-muted"}`}>RETAIL OPERATIONS</p>
      </div>
    </div>
  );
}
