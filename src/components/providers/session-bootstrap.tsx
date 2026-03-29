"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureUserAction } from "@/lib/actions/session";

export function SessionBootstrap() {
  const router = useRouter();
  const ran = useRef(false);
  const [missingDb, setMissingDb] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void ensureUserAction()
      .then((result) => {
        if (!result.ok) {
          if (result.reason === "no_database") setMissingDb(true);
          return;
        }
        router.refresh();
      })
      .catch(() => {
        setMissingDb(true);
      });
  }, [router]);

  if (!missingDb) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] border-b border-amber-500/40 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-950/90 dark:text-amber-100"
    >
      <strong className="font-semibold">MongoDB is not configured.</strong> Add{" "}
      <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">MONGODB_URI</code> to{" "}
      <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">.env.local</code>, restart{" "}
      <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">npm run dev</code>, then refresh.
    </div>
  );
}
