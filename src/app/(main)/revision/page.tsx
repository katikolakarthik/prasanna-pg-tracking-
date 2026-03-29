import { getUserIdFromCookie } from "@/lib/session";
import { SessionBootstrap } from "@/components/providers/session-bootstrap";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { RevisionClient } from "@/components/revision/revision-client";
import { getRevisionsForUser } from "@/lib/queries/revisions";

export default async function RevisionPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return (
      <>
        <SessionBootstrap />
        <DashboardSkeleton />
      </>
    );
  }
  const { pending, done } = await getRevisionsForUser(userId);
  return <RevisionClient pending={pending} done={done} />;
}
