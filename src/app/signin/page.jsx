import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/signin-form";
import { getCurrentUser } from "@/lib/auth";

export default async function SignInPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/tasks");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1020]/85 p-8 shadow-glow backdrop-blur">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.28em] text-violet-300">Echelon</p>
          <h1 className="mt-3 font-serif text-3xl text-white">Sign in to continue</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Use Supabase Auth to access your tasks, charts, and AI roadmaps.</p>
        </div>
        <SignInForm />
      </div>
    </main>
  );
}