"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signInAction } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/tasks";
  const [state, formAction] = useFormState(signInAction, { error: null });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    setFormError(state?.error || null);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <label className="block space-y-2">
        <span className="text-sm text-zinc-300">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-400/60"
          placeholder="you@example.com"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-zinc-300">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-400/60"
          placeholder="••••••••"
        />
      </label>

      {formError ? <p className="text-sm text-rose-300">{formError}</p> : null}

      <SubmitButton />
    </form>
  );
}