import { getUserIdFromCookie } from "@/lib/session";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { SessionBootstrap } from "@/components/providers/session-bootstrap";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TaskToggleButton } from "@/components/dashboard/task-toggle";
import Link from "next/link";
import { plannerActivityLabel } from "@/lib/constants";

export default async function DashboardPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return (
      <>
        <SessionBootstrap />
        <DashboardSkeleton />
      </>
    );
  }

  const data = await getDashboardSnapshot(userId);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Overview of today&apos;s study block, streaks, and subject momentum.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle>Study hours today</CardTitle>
          <CardDescription>From completed study-subject blocks only</CardDescription>
          <p className="mt-4 text-3xl font-semibold text-primary">{data.studyHoursToday}h</p>
          <p className="text-xs text-muted">{data.studyMinutesToday} minutes logged</p>
        </Card>
        <Card>
          <CardTitle>Study streak</CardTitle>
          <CardDescription>Days in a row meeting your study signal</CardDescription>
          <p className="mt-4 text-3xl font-semibold text-primary">{data.streak}</p>
          <p className="text-xs text-muted">
            Counts days with ≥15 min completed study blocks, habit study tick, or challenge complete.
          </p>
        </Card>
        <Card>
          <CardTitle>Pending revisions</CardTitle>
          <CardDescription>Spaced recalls from completed topics</CardDescription>
          <p className="mt-4 text-3xl font-semibold text-primary">{data.pendingRevisions}</p>
          <Link href="/revision" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
            Open revision queue
          </Link>
        </Card>
      </div>

      <Card>
        <CardTitle>Subject progress</CardTitle>
        <CardDescription>Completion across your topic lists</CardDescription>
        <div className="mt-6 space-y-4">
          {data.subjectProgress.map((s) => (
            <div key={s._id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{s.name}</span>
                <span className="text-muted">
                  {s.done}/{s.total} topics · {s.pct}%
                </span>
              </div>
              <ProgressBar value={s.pct} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Today&apos;s pending tasks</CardTitle>
            <CardDescription>{data.todayKey} · Daily planner</CardDescription>
          </div>
          <Link
            href="/planner"
            className="text-sm font-medium text-primary hover:underline"
          >
            Go to planner
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {data.pendingTasks.length === 0 ? (
            <li className="text-sm text-muted">No pending tasks. Nice work.</li>
          ) : (
            data.pendingTasks.map((t) => (
              <li
                key={String(t._id)}
                className="flex flex-col gap-2 rounded-lg border border-card-border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{t.title}</p>
                  <p className="text-xs text-muted">
                    {plannerActivityLabel(t.subject)} · {t.startTime}–{t.endTime}
                  </p>
                </div>
                <TaskToggleButton taskId={String(t._id)} completed={false} />
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
