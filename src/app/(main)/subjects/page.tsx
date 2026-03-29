import { getUserIdFromCookie } from "@/lib/session";
import { SessionBootstrap } from "@/components/providers/session-bootstrap";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { SubjectsClient } from "@/components/subjects/subjects-client";
import { getSubjectsWithTopics } from "@/lib/queries/subjects";

export default async function SubjectsPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return (
      <>
        <SessionBootstrap />
        <DashboardSkeleton />
      </>
    );
  }
  const { subjects, topics } = await getSubjectsWithTopics(userId);
  return <SubjectsClient subjects={subjects} topics={topics} />;
}
