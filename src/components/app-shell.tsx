"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ListTodo,
  CalendarDays,
  Briefcase,
  Dumbbell,
  Heart,
  Wallet,
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";
import type { Area } from "@/lib/enums";

// Kalendarz i lista zadań to osobne zakładki — na telefonie „Główna"
// robiła się długą stroną z dwiema niezależnymi rzeczami.
const NAV = [
  { href: "/", label: "Dziś", icon: ListTodo, area: undefined },
  { href: "/kalendarz", label: "Kalendarz", icon: CalendarDays, area: undefined },
  { href: "/biznes", label: "Biznes", icon: Briefcase, area: "BIZNES" as Area },
  { href: "/sport", label: "Sport", icon: Dumbbell, area: "SPORT" as Area },
  { href: "/zycie", label: "Życie", icon: Heart, area: "ZYCIE" as Area },
  { href: "/finanse", label: "Finanse", icon: Wallet, area: undefined },
];

function areaForPath(path: string): Area | undefined {
  return NAV.find((n) => n.href !== "/" && path.startsWith(n.href))?.area;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { openAdd } = useApp();

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card px-3 py-4 md:flex">
        <div className="flex items-center justify-between px-2 pb-4">
          <span className="text-lg font-bold">
            Tobiasz<span className="text-accent">CRM</span>
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1 border-t border-border pt-3">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex h-11 flex-1 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted"
          >
            <LogOut className="h-5 w-5" />
            Wyloguj
          </button>
        </div>
      </aside>

      {/* Górny pasek (mobile) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 pt-safe backdrop-blur md:hidden">
        <span className="text-lg font-bold">
          Tobiasz<span className="text-accent">CRM</span>
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Wyloguj"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Treść */}
      <main className="px-4 pb-28 pt-4 md:ml-60 md:px-8 md:pb-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      {/* FAB — w zasięgu kciuka */}
      <button
        onClick={() => openAdd({ area: areaForPath(pathname) })}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform active:scale-95 md:bottom-8 md:right-8"
        aria-label="Dodaj"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* Dolna nawigacja (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card pb-safe md:hidden">
        {NAV.map((n) => {
          const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-accent" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="w-full truncate text-center">{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
