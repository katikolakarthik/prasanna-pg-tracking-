"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { createTaskAction, deleteTaskAction, toggleTaskStatusAction } from "@/lib/actions/tasks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  LIFE_ACTIVITY_OPTIONS,
  SUBJECT_OPTIONS,
  isLifePlannerActivity,
  plannerActivityLabel,
} from "@/lib/constants";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";

export type PlannerTaskRow = {
  _id: string;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  status: "pending" | "completed";
  dateKey: string;
};

const navBtn =
  "inline-flex h-8 items-center justify-center rounded-lg border border-card-border bg-accent px-3 text-xs font-medium text-foreground transition hover:bg-accent/80";

export function PlannerClient({ initialTasks, dateKey }: { initialTasks: PlannerTaskRow[]; dateKey: string }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0]?.value ?? "anatomy");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(
    () => [...initialTasks].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [initialTasks]
  );

  const refresh = () => {
    window.location.reload();
  };

  const onCreate = () => {
    if (!title.trim()) {
      toast.error("Add a title");
      return;
    }
    startTransition(async () => {
      try {
        await createTaskAction({
          title: title.trim(),
          subject,
          startTime,
          endTime,
          dateKey,
        });
        setTitle("");
        toast.success("Task added");
        refresh();
      } catch {
        toast.error("Could not create task");
      }
    });
  };

  const onToggle = (id: string) => {
    startTransition(async () => {
      try {
        await toggleTaskStatusAction(id);
        toast.success("Updated");
        refresh();
      } catch {
        toast.error("Update failed");
      }
    });
  };

  const onDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteTaskAction(id);
        toast.success("Removed");
        refresh();
      } catch {
        toast.error("Could not delete");
      }
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Daily Planner</h1>
        <p className="mt-1 text-sm text-muted">Timeline for {dateKey}</p>
      </div>

      <Card>
        <CardTitle>New task</CardTitle>
        <CardDescription>
          Study subjects count toward dashboard study hours. Daily &amp; personal blocks still show on your timeline.
        </CardDescription>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-medium text-foreground">
            Title
            <input
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cardiac cycle revision, or Evening walk"
            />
          </label>
          <label className="text-sm font-medium text-foreground">
            Category
            <select
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <optgroup label="Study (NEET subjects)">
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Daily &amp; personal">
                {LIFE_ACTIVITY_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="text-sm font-medium text-foreground">
            Start
            <input
              type="time"
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-foreground">
            End
            <input
              type="time"
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4">
          <Button type="button" onClick={onCreate} disabled={pending}>
            Add to timeline
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Sorted by start time</CardDescription>
        <div className="relative mt-6 border-l-2 border-primary/30 pl-6">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted">No tasks yet for this day.</p>
          ) : (
            <ul className="space-y-6">
              {sorted.map((t) => (
                <li key={String(t._id)} className="relative">
                  <span
                    className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-background ${
                      isLifePlannerActivity(t.subject) ? "bg-sky-500" : "bg-primary"
                    }`}
                  />
                  <div className="rounded-xl border border-card-border bg-card/80 p-4 dark:bg-card/40">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{t.title}</p>
                        <p className="text-xs text-muted">
                          {plannerActivityLabel(t.subject)} · {t.startTime}–{t.endTime}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              isLifePlannerActivity(t.subject)
                                ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {isLifePlannerActivity(t.subject) ? "Personal" : "Study"}
                          </span>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              t.status === "completed"
                                ? "bg-success/15 text-success"
                                : "bg-warning/15 text-warning"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={pending}
                          onClick={() => onToggle(String(t._id))}
                        >
                          {t.status === "completed" ? "Mark pending" : "Mark complete"}
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          disabled={pending}
                          onClick={() => onDelete(String(t._id))}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

export function PlannerDateNav({ dateKey }: { dateKey: string }) {
  const d = new Date(dateKey + "T12:00:00");
  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  const prevKey = toDateKey(prev);
  const nextKey = toDateKey(next);
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <Link href={`/planner?date=${prevKey}`} className={navBtn}>
        Previous day
      </Link>
      <Link href={`/planner?date=${nextKey}`} className={navBtn}>
        Next day
      </Link>
      <Link
        href={`/planner?date=${toDateKey(new Date())}`}
        className={cn(navBtn, "border-transparent bg-transparent hover:bg-accent/60")}
      >
        Today
      </Link>
    </div>
  );
}
