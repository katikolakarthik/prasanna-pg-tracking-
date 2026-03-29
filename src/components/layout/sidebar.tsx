"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/planner", label: "Daily Planner" },
  { href: "/subjects", label: "Subjects" },
  { href: "/revision", label: "Revision" },
  { href: "/tests", label: "Mock Tests" },
  { href: "/calendar", label: "30-Day Challenge" },
  { href: "/notes", label: "Notes" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        aria-hidden
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-sidebar text-sidebar-fg transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            N
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">NEET PG Tracker</p>
            <p className="text-xs text-sidebar-muted">MBBS prep workspace</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-fg"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}

export function MobileHeader() {
  const { toggleSidebar } = useUiStore();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-card-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
      <Button type="button" variant="secondary" size="sm" onClick={toggleSidebar} aria-label="Open menu">
        Menu
      </Button>
      <span className="text-sm font-semibold text-foreground">NEET PG Tracker</span>
    </header>
  );
}
