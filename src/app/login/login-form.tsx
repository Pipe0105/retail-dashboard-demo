"use client";

import { useActionState, useRef } from "react";
import { login, type LoginState } from "./actions";

const DEMO_ACCOUNTS = [
  { role: "Administrator", scope: "All 6 stores", email: "admin@lumenmarket.demo" },
  { role: "Store manager", scope: "Downtown only", email: "manager@lumenmarket.demo" },
];
const DEMO_PASSWORD = "demo1234";

const input =
  "mt-1 h-10 w-full border border-line-strong bg-panel px-3 text-sm outline-none focus:border-data focus:ring-1 focus:ring-data";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const formRef = useRef<HTMLFormElement>(null);

  function signInAs(email: string) {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("email") as HTMLInputElement).value = email;
    (form.elements.namedItem("password") as HTMLInputElement).value = DEMO_PASSWORD;
    form.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={action} className="mt-6 space-y-4">
        <label className="block">
          <span className="label !text-[10px]">Email</span>
          <input name="email" type="email" autoComplete="username" required className={input} />
        </label>
        <label className="block">
          <span className="label !text-[10px]">Password</span>
          <input name="password" type="password" autoComplete="current-password" required className={input} />
        </label>
        {state.error && (
          <p role="alert" className="border-l-2 border-red bg-red-bg px-3 py-2 text-sm text-red">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-10 w-full bg-rail text-sm font-medium text-white hover:bg-rail-2 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-8 border border-line">
        <p className="label border-b border-line bg-panel-head px-3 py-2 !text-[10px]">
          Demo accounts · password <span className="num normal-case tracking-normal text-ink">{DEMO_PASSWORD}</span>
        </p>
        {DEMO_ACCOUNTS.map((a) => (
          <button
            key={a.email}
            type="button"
            disabled={pending}
            onClick={() => signInAs(a.email)}
            className="flex w-full items-center justify-between border-b border-line px-3 py-2.5 text-left last:border-0 hover:bg-panel-head disabled:opacity-60"
          >
            <span>
              <span className="block text-[13px] font-medium">{a.role}</span>
              <span className="num block text-[11px] text-muted">{a.email}</span>
            </span>
            <span className="text-right">
              <span className="block text-[11px] text-ink-2">{a.scope}</span>
              <span className="block text-[11px] font-medium text-data">Sign in →</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
