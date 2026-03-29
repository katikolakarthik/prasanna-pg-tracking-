import { getUserIdFromCookie } from "@/lib/session";
import { SessionBootstrap } from "@/components/providers/session-bootstrap";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { ChallengeCalendar } from "@/components/calendar/challenge-calendar";
import { getHabitsInRange } from "@/lib/queries/habits";
import { computeChallengeStreak, computeStudyStreak } from "@/lib/streak";
import { toDateKey } from "@/lib/date";

type Search = { y?: string; m?: string };

export default async function CalendarPage({ searchParams }: { searchParams: Search | Promise<Search> }) {
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

  const now = new Date();
  let year = sp.y ? Number(sp.y) : now.getFullYear();
  let monthNum = sp.m ? Number(sp.m) : now.getMonth() + 1;
  if (!Number.isFinite(year) || year < 1970 || year > 2100) year = now.getFullYear();
  if (!Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12) monthNum = now.getMonth() + 1;
  const monthIndex = monthNum - 1;

  const firstKey = toDateKey(new Date(year, monthIndex, 1));
  const lastKey = toDateKey(new Date(year, monthIndex + 1, 0));

  const rows = await getHabitsInRange(userId, firstKey, lastKey);
  const initialMap: Record<
    string,
    {
      dateKey: string;
      dayStatus: "completed" | "missed" | "unset";
      studyCompleted: boolean;
      walking: boolean;
      dietFollowed: boolean;
    }
  > = {};
  for (const r of rows) {
    initialMap[r.dateKey] = {
      dateKey: r.dateKey,
      dayStatus: r.dayStatus,
      studyCompleted: r.studyCompleted,
      walking: r.walking,
      dietFollowed: r.dietFollowed,
    };
  }

  const studyStreak = await computeStudyStreak(userId);
  const challengeStreak = await computeChallengeStreak(
    userId,
    (h) => h.dayStatus === "completed"
  );

  return (
    <ChallengeCalendar
      year={year}
      monthIndex={monthIndex}
      initialMap={initialMap}
      studyStreak={studyStreak}
      challengeStreak={challengeStreak}
    />
  );
}
