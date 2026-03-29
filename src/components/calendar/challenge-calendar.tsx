"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { upsertHabitLogAction } from "@/lib/actions/habits";
import { toast } from "sonner";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { toDateKey } from "@/lib/date";

type HabitRow = {
  dateKey: string;
  dayStatus: "completed" | "missed" | "unset";
  studyCompleted: boolean;
  walking: boolean;
  dietFollowed: boolean;
};

function buildMonthCells(year: number, monthIndex: number): (number | null)[] {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function navMonth(y: number, monthIndex: number, delta: number) {
  const d = new Date(y, monthIndex + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}

export function ChallengeCalendar({
  year,
  monthIndex,
  initialMap,
  studyStreak,
  challengeStreak,
}: {
  year: number;
  monthIndex: number;
  initialMap: Record<string, HabitRow>;
  studyStreak: number;
  challengeStreak: number;
}) {
  const [map, setMap] = useState(initialMap);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMap(initialMap);
  }, [initialMap]);

  const cells = useMemo(() => buildMonthCells(year, monthIndex), [year, monthIndex]);

  const keyFor = (day: number) => toDateKey(new Date(year, monthIndex, day));

  const merge = (dateKey: string, patch: Partial<HabitRow>) => {
    setMap((prev) => {
      const prevRow = prev[dateKey];
      const next: HabitRow = {
        dateKey,
        dayStatus: prevRow?.dayStatus ?? "unset",
        studyCompleted: prevRow?.studyCompleted ?? false,
        walking: prevRow?.walking ?? false,
        dietFollowed: prevRow?.dietFollowed ?? false,
        ...patch,
      };
      return { ...prev, [dateKey]: next };
    });
  };

  const cycleDay = (dateKey: string) => {
    const cur = map[dateKey]?.dayStatus ?? "unset";
    const order: HabitRow["dayStatus"][] = ["unset", "completed", "missed"];
    const idx = order.indexOf(cur);
    const next = order[(idx + 1) % order.length];
    merge(dateKey, { dayStatus: next });
    startTransition(async () => {
      try {
        await upsertHabitLogAction(dateKey, { dayStatus: next });
        toast.success("Day updated");
      } catch {
        toast.error("Could not save day");
      }
    });
  };

  const toggleBit = (dateKey: string, field: "studyCompleted" | "walking" | "dietFollowed") => {
    const v = !(map[dateKey]?.[field] ?? false);
    merge(dateKey, { [field]: v });
    startTransition(async () => {
      try {
        await upsertHabitLogAction(dateKey, { [field]: v });
        toast.success("Habit saved");
      } catch {
        toast.error("Could not save habit");
      }
    });
  };

  const label = new Date(year, monthIndex, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const prev = navMonth(year, monthIndex, -1);
  const next = navMonth(year, monthIndex, 1);
  const navClass =
    "inline-flex h-8 items-center justify-center rounded-lg border border-card-border bg-accent px-3 text-xs font-medium text-foreground hover:bg-accent/80";
  const ghostNav =
    "inline-flex h-8 items-center justify-center rounded-lg border border-card-border bg-transparent px-3 text-xs font-medium text-foreground hover:bg-accent/40";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">30-day challenge</h1>
        <p className="mt-1 text-sm text-muted">
          Mark challenge days, habits, and watch streaks align with your study rhythm.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle>Study streak</CardTitle>
          <CardDescription>Planner + habits</CardDescription>
          <p className="mt-3 text-3xl font-semibold text-primary">{studyStreak}</p>
        </Card>
        <Card>
          <CardTitle>Challenge streak</CardTitle>
          <CardDescription>Days marked completed</CardDescription>
          <p className="mt-3 text-3xl font-semibold text-primary">{challengeStreak}</p>
        </Card>
        <Card>
          <CardTitle>Today</CardTitle>
          <CardDescription>{toDateKey(new Date())}</CardDescription>
          <p className="mt-3 text-sm text-muted">Tap status to cycle completed → missed → clear.</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl">{label}</CardTitle>
          <div className="flex gap-2">
            <Link href={`/calendar?y=${prev.y}&m=${prev.m}`} className={navClass}>
              Prev
            </Link>
            <Link href={`/calendar?y=${next.y}&m=${next.m}`} className={navClass}>
              Next
            </Link>
            <Link href="/calendar" className={ghostNav}>
              This month
            </Link>
          </div>
        </div>
        <CardDescription className="mt-2">Monday-start grid</CardDescription>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) =>
            day === null ? (
              <div key={`e-${i}`} className="aspect-square" />
            ) : (
              <div
                key={day}
                className="flex aspect-square flex-col gap-1 rounded-lg border border-card-border bg-background/60 p-1 text-left text-[10px] sm:p-2 sm:text-xs"
              >
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => cycleDay(keyFor(day))}
                  className="flex flex-1 flex-col rounded-md text-left font-semibold text-foreground"
                >
                  <span>{day}</span>
                  <span
                    className={`mt-1 inline-block max-w-full truncate rounded px-1 py-0.5 text-[9px] font-medium sm:text-[10px] ${
                      (map[keyFor(day)]?.dayStatus ?? "unset") === "completed"
                        ? "bg-success/20 text-success"
                        : (map[keyFor(day)]?.dayStatus ?? "unset") === "missed"
                          ? "bg-danger/20 text-danger"
                          : "bg-accent text-muted"
                    }`}
                  >
                    {(map[keyFor(day)]?.dayStatus ?? "unset") === "unset"
                      ? "—"
                      : map[keyFor(day)]?.dayStatus}
                  </span>
                </button>
                <div className="mt-auto flex flex-col gap-0.5 border-t border-card-border pt-1">
                  {(
                    [
                      ["studyCompleted", "Study"],
                      ["walking", "Walk"],
                      ["dietFollowed", "Diet"],
                    ] as const
                  ).map(([k, lab]) => (
                    <label key={k} className="flex cursor-pointer items-center gap-1">
                      <input
                        type="checkbox"
                        className="h-3 w-3 accent-primary"
                        checked={map[keyFor(day)]?.[k] ?? false}
                        disabled={isPending}
                        onChange={() => toggleBit(keyFor(day), k)}
                      />
                      <span className="text-[9px] text-muted sm:text-[10px]">{lab}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
