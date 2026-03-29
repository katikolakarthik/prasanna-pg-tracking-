"use client";

import { useTransition } from "react";
import { toggleRevisionAction } from "@/lib/actions/revisions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SUBJECT_OPTIONS } from "@/lib/constants";

type Rev = {
  _id: string;
  topicTitle: string;
  subjectKey: string;
  dueDateKey: string;
  intervalDays: number;
  status: "pending" | "completed";
};

function subjectLabel(key: string) {
  return SUBJECT_OPTIONS.find((s) => s.value === key)?.label ?? key;
}

export function RevisionClient({ pending, done }: { pending: Rev[]; done: Rev[] }) {
  const [pendingUi, startTransition] = useTransition();
  const refresh = () => window.location.reload();

  const toggle = (id: string) => {
    startTransition(async () => {
      try {
        await toggleRevisionAction(id);
        toast.success("Revision updated");
        refresh();
      } catch {
        toast.error("Could not update");
      }
    });
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Revision tracker</h1>
        <p className="mt-1 text-sm text-muted">
          Auto-generated at 1, 7, and 15 days after a topic is marked complete.
        </p>
      </div>

      <Card>
        <CardTitle>Upcoming</CardTitle>
        <CardDescription>Pending spaced recalls</CardDescription>
        <ul className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <li className="text-sm text-muted">No pending revisions. Complete more topics.</li>
          ) : (
            pending.map((r) => (
              <li
                key={r._id}
                className="flex flex-col gap-2 rounded-lg border border-card-border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{r.topicTitle}</p>
                  <p className="text-xs text-muted">
                    {subjectLabel(r.subjectKey)} · Due {r.dueDateKey} · Day {r.intervalDays}
                  </p>
                </div>
                <Button type="button" size="sm" disabled={pendingUi} onClick={() => toggle(r._id)}>
                  Mark done
                </Button>
              </li>
            ))
          )}
        </ul>
      </Card>

      <Card>
        <CardTitle>Recently completed</CardTitle>
        <CardDescription>Latest finished revision checks</CardDescription>
        <ul className="mt-4 space-y-2">
          {done.length === 0 ? (
            <li className="text-sm text-muted">No history yet.</li>
          ) : (
            done.map((r) => (
              <li key={r._id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{r.topicTitle}</span>
                <span className="text-muted">{r.dueDateKey}</span>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
