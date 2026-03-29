import { getUserIdFromCookie } from "@/lib/session";
import { SessionBootstrap } from "@/components/providers/session-bootstrap";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { PlannerClient, PlannerDateNav } from "@/components/planner/planner-client";
import { getTasksForDate } from "@/lib/queries/tasks";
import { toDateKey } from "@/lib/date";

type Search = { date?: string };

export default async function PlannerPage({ searchParams }: { searchParams: Search | Promise<Search> }) {
  const sp = await Promise.resolve(searchParams);
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return (
      <>
        <SessionBootstrap />
        <DashboardSkeleton />
      </>
    );
  }

  const raw = sp.date;
  const dateKey =
    raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : toDateKey(new Date());
  const tasks = await getTasksForDate(userId, dateKey);

  return (
    <>
      <PlannerDateNav dateKey={dateKey} />
      <PlannerClient initialTasks={tasks} dateKey={dateKey} />
    </>
  );
}
