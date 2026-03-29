"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createTestAction, deleteTestAction } from "@/lib/actions/tests";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type TestRow = {
  _id: string;
  date: string;
  score: number;
  totalMarks: number;
};

export function TestsClient({ tests }: { tests: TestRow[] }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [score, setScore] = useState("");
  const [total, setTotal] = useState("100");
  const [isPending, startTransition] = useTransition();

  const chartData = useMemo(
    () =>
      tests.map((t) => ({
        id: t._id,
        label: t.date.slice(0, 10),
        pct: t.totalMarks ? Math.round((t.score / t.totalMarks) * 1000) / 10 : 0,
        score: t.score,
        total: t.totalMarks,
      })),
    [tests]
  );

  const refresh = () => window.location.reload();

  const onAdd = () => {
    const s = Number(score);
    const tot = Number(total);
    if (!Number.isFinite(s) || !Number.isFinite(tot) || tot <= 0) {
      toast.error("Enter valid score and total");
      return;
    }
    startTransition(async () => {
      try {
        await createTestAction({ date, score: s, totalMarks: tot });
        setScore("");
        toast.success("Mock recorded");
        refresh();
      } catch {
        toast.error("Could not save");
      }
    });
  };

  const onDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteTestAction(id);
        toast.success("Removed");
        refresh();
      } catch {
        toast.error("Delete failed");
      }
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Mock test tracker</h1>
        <p className="mt-1 text-sm text-muted">Log scores and watch accuracy trend as percentage.</p>
      </div>

      <Card>
        <CardTitle>Add mock</CardTitle>
        <CardDescription>Date, score obtained, and paper total</CardDescription>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium">
            Date
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="text-sm font-medium">
            Score
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 420"
            />
          </label>
          <label className="text-sm font-medium">
            Total marks
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4">
          <Button type="button" disabled={isPending} onClick={onAdd}>
            Save mock
          </Button>
        </div>
      </Card>

      <Card className="min-h-[320px]">
        <CardTitle>Performance</CardTitle>
        <CardDescription>Percentage score over time</CardDescription>
        <div className="mt-6 h-64 w-full min-w-0">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted">Add at least one mock to see the graph.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-card-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: 8 }}
                  formatter={(value, _name, item) => {
                    const p = item?.payload as { score?: number; total?: number } | undefined;
                    return [`${value}% (${p?.score ?? "—"}/${p?.total ?? "—"})`, "Score"];
                  }}
                />
                <Line type="monotone" dataKey="pct" stroke="var(--color-primary)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>History</CardTitle>
        <ul className="mt-4 space-y-2">
          {tests.length === 0 ? (
            <li className="text-sm text-muted">No mocks yet.</li>
          ) : (
            [...tests]
              .reverse()
              .map((t) => (
                <li
                  key={t._id}
                  className="flex flex-col gap-2 rounded-lg border border-card-border bg-background/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{t.date.slice(0, 10)}</p>
                    <p className="text-xs text-muted">
                      {t.score}/{t.totalMarks} (
                      {t.totalMarks ? Math.round((t.score / t.totalMarks) * 100) : 0}%)
                    </p>
                  </div>
                  <Button type="button" variant="danger" size="sm" disabled={isPending} onClick={() => onDelete(t._id)}>
                    Delete
                  </Button>
                </li>
              ))
          )}
        </ul>
      </Card>
    </div>
  );
}
