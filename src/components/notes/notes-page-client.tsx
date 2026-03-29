"use client";

import { useState } from "react";
import { PREDEFINED_SUBJECTS, type SubjectKey } from "@/lib/constants";
import { NotesEditor } from "./notes-editor";
import { cn } from "@/lib/utils";

export function NotesPageClient({ notesBySubject }: { notesBySubject: Record<string, string> }) {
  const [active, setActive] = useState<SubjectKey>(PREDEFINED_SUBJECTS[0]?.key ?? "anatomy");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Notes</h1>
        <p className="mt-1 text-sm text-muted">Per-subject notebook with a lightweight rich editor.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-card-border pb-3">
        {PREDEFINED_SUBJECTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition",
              active === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-foreground hover:bg-accent/80"
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      {PREDEFINED_SUBJECTS.map((s) =>
        s.key === active ? (
          <NotesEditor
            key={s.key}
            subjectKey={s.key}
            initialHtml={notesBySubject[s.key] ?? ""}
          />
        ) : null
      )}
    </div>
  );
}
