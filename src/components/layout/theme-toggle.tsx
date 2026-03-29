"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-context";

export function ThemeToggle() {
  const { resolvedTheme, setTheme, mounted } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="w-full justify-start text-sidebar-muted hover:text-sidebar-fg hover:bg-white/5"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span suppressHydrationWarning>
        {!mounted ? "Theme" : isDark ? "Light mode" : "Dark mode"}
      </span>
    </Button>
  );
}
