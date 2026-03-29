import { getUserIdFromCookie } from "@/lib/session";
import { SessionBootstrap } from "@/components/providers/session-bootstrap";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { TestsClient } from "@/components/tests/tests-client";
import { getTestsForUser } from "@/lib/queries/tests";

export default async function TestsPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return (
      <>
        <SessionBootstrap />
        <DashboardSkeleton />
      </>
    );
  }
  const tests = await getTestsForUser(userId);
  return <TestsClient tests={tests} />;
}
