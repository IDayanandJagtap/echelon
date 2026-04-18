"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BrainCircuit, Flame, LogOut, LayoutDashboard } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

const navItems = [
  { href: "/tasks", label: "Tasks", icon: LayoutDashboard },
  { href: "/visualize", label: "Visualize", icon: BarChart3 },
  { href: "/ai", label: "AI", icon: BrainCircuit },
];

export function Sidebar({ streak = 0, user }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col justify-between gap-6 border-r border-white/10 bg-black/20 px-4 py-5 backdrop-blur xl:w-[240px]">
      <div className="space-y-8">
        <Link href="/tasks" className="block font-serif text-3xl tracking-tight text-white">
          Echelon
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Flame className="text-orange-400" size={18} />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Streak</p>
            <p className="text-sm text-white">{streak} days</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          <p className="truncate">{user?.email || user?.user_metadata?.name || "Signed in"}</p>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}