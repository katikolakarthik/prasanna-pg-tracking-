import { getUserIdFromCookie } from "@/lib/session";
import { SessionBootstrap } from "@/components/providers/session-bootstrap";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { NotesPageClient } from "@/components/notes/notes-page-client";
import { getNotesMap } from "@/lib/queries/notes";

export default async function NotesPage() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return (
      <>
        <SessionBootstrap />
        <DashboardSkeleton />
      </>
    );
  }
  const notesBySubject = await getNotesMap(userId);
  return <NotesPageClient notesBySubject={notesBySubject} />;
}
