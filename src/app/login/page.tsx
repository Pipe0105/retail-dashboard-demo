import { LoginForm } from "./login-form";
import { Wordmark } from "@/components/logo";

const STATS = [
  { k: "Stores", v: "6" },
  { k: "SKUs", v: "48" },
  { k: "Days of sales", v: "184" },
  { k: "Sales rows", v: "52,992" },
];

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_480px]">
      <section
        className="relative hidden flex-col justify-between overflow-hidden bg-rail p-10 text-rail-ink lg:flex"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <Wordmark />

        <div className="max-w-xl">
          <p className="label !text-[#f0a020]">Store operations console</p>
          <h1 className="mt-3 text-[34px] font-semibold leading-[1.15] text-white">
            Daily sales, margin and stock position across the chain.
          </h1>
          <dl className="mt-10 grid grid-cols-4 border-y border-rail-2">
            {STATS.map((s, i) => (
              <div key={s.k} className={`py-4 ${i ? "border-l border-rail-2 pl-4" : ""}`}>
                <dt className="label !text-[10px] !text-rail-muted">{s.k}</dt>
                <dd className="num mt-1 text-xl text-white">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-xs text-rail-muted">
          Portfolio demo. Lumen Market is a fictional company; every figure is synthetic.
        </p>
      </section>

      <section className="flex items-center justify-center bg-panel p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <div className="inline-block bg-rail p-3"><Wordmark /></div>
          </div>
          <p className="label">Sign in</p>
          <h2 className="mt-1 text-xl font-semibold">Access the console</h2>
          <LoginForm />
          <p className="mt-10 text-xs text-muted lg:hidden">
            Portfolio demo. Lumen Market is a fictional company; every figure is synthetic.
          </p>
        </div>
      </section>
    </main>
  );
}
