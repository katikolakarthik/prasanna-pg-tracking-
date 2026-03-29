"use client";

import { useState, useTransition } from "react";
import { createTopicAction, deleteTopicAction, updateTopicAction } from "@/lib/actions/topics";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

type SubjectRow = { _id: string; key: string; name: string };
type TopicRow = {
  _id: string;
  subjectId: string;
  title: string;
  status: "not_started" | "in_progress" | "completed";
};

export function SubjectsClient({
  subjects,
  topics,
}: {
  subjects: SubjectRow[];
  topics: TopicRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [titles, setTitles] = useState<Record<string, string>>({});

  const refresh = () => window.location.reload();

  const pctForSubject = (sid: string) => {
    const ts = topics.filter((t) => t.subjectId === sid);
    if (!ts.length) return 0;
    const done = ts.filter((t) => t.status === "completed").length;
    return Math.round((done / ts.length) * 100);
  };

  const addTopic = (subjectId: string) => {
    const title = (titles[subjectId] ?? "").trim();
    if (!title) {
      toast.error("Enter a topic name");
      return;
    }
    startTransition(async () => {
      try {
        await createTopicAction(subjectId, title);
        setTitles((m) => ({ ...m, [subjectId]: "" }));
        toast.success("Topic added");
        refresh();
      } catch {
        toast.error("Could not add topic");
      }
    });
  };

  const setStatus = (topicId: string, status: TopicRow["status"]) => {
    startTransition(async () => {
      try {
        await updateTopicAction(topicId, { status });
        toast.success("Status updated");
        refresh();
      } catch {
        toast.error("Update failed");
      }
    });
  };

  const rename = (topicId: string, title: string) => {
    const t = title.trim();
    if (!t) return;
    startTransition(async () => {
      try {
        await updateTopicAction(topicId, { title: t });
        toast.success("Saved");
        refresh();
      } catch {
        toast.error("Could not save");
      }
    });
  };

  const remove = (topicId: string) => {
    startTransition(async () => {
      try {
        await deleteTopicAction(topicId);
        toast.success("Topic removed");
        refresh();
      } catch {
        toast.error("Could not delete");
      }
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Subject tracker</h1>
        <p className="mt-1 text-sm text-muted">
          Topics drive completion percentages and trigger spaced revision when marked complete.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {subjects.map((s) => {
          const ts = topics.filter((t) => t.subjectId === s._id);
          const pct = pctForSubject(s._id);
          return (
            <Card key={s._id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{s.name}</CardTitle>
                  <CardDescription>
                    {ts.filter((t) => t.status === "completed").length}/{ts.length || 0} topics done
                  </CardDescription>
                </div>
                <div className="w-full max-w-xs space-y-1 sm:w-48">
                  <ProgressBar value={pct} />
                  <p className="text-right text-xs text-muted">{pct}%</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  className="flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
                  placeholder="New topic"
                  value={titles[s._id] ?? ""}
                  onChange={(e) => setTitles((m) => ({ ...m, [s._id]: e.target.value }))}
                />
                <Button type="button" disabled={pending} onClick={() => addTopic(s._id)}>
                  Add topic
                </Button>
              </div>

              <ul className="mt-4 space-y-3">
                {ts.length === 0 ? (
                  <li className="text-sm text-muted">No topics yet.</li>
                ) : (
                  ts.map((t) => (
                    <li
                      key={t._id}
                      className="flex flex-col gap-3 rounded-lg border border-card-border bg-background/50 p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <input
                        defaultValue={t.title}
                        className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-medium focus:border-card-border"
                        onBlur={(e) => {
                          if (e.target.value !== t.title) rename(t._id, e.target.value);
                        }}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="rounded-lg border border-card-border bg-background px-2 py-1 text-xs"
                          value={t.status}
                          disabled={pending}
                          onChange={(e) =>
                            setStatus(t._id, e.target.value as TopicRow["status"])
                          }
                        >
                          <option value="not_started">Not started</option>
                          <option value="in_progress">In progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <Button type="button" variant="danger" size="sm" disabled={pending} onClick={() => remove(t._id)}>
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
