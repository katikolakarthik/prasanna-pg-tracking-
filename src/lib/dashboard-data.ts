import "server-only";
import connectDB from "./db";
import Task from "./models/Task";
import Subject from "./models/Subject";
import Topic from "./models/Topic";
import Revision from "./models/Revision";
import { minutesBetween, toDateKey } from "./date";
import { computeStudyStreak } from "./streak";
import { countsTowardStudyHours } from "./constants";

export async function getDashboardSnapshot(userId: string) {
  await connectDB();
  const todayKey = toDateKey(new Date());
  const tasksToday = await Task.find({ userId, dateKey: todayKey })
    .sort({ startTime: 1 })
    .lean();

  let studyMinutesToday = 0;
  for (const t of tasksToday) {
    if (t.status !== "completed") continue;
    if (!countsTowardStudyHours(t.subject)) continue;
    studyMinutesToday += Math.max(0, minutesBetween(t.startTime, t.endTime));
  }

  const pendingTasks = tasksToday.filter((t) => t.status === "pending");
  const streak = await computeStudyStreak(userId);

  const subjects = await Subject.find({ userId }).sort({ order: 1 }).lean();
  const topics = await Topic.find({ userId }).lean();

  const subjectProgress = subjects.map((s) => {
    const ts = topics.filter((t) => String(t.subjectId) === String(s._id));
    const total = ts.length;
    const done = ts.filter((t) => t.status === "completed").length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return {
      _id: String(s._id),
      key: s.key,
      name: s.name,
      total,
      done,
      pct,
    };
  });

  const pendingRevisions = await Revision.countDocuments({
    userId,
    status: "pending",
  });

  return {
    todayKey,
    studyHoursToday: Math.round((studyMinutesToday / 60) * 10) / 10,
    studyMinutesToday,
    streak,
    pendingTasks,
    subjectProgress,
    pendingRevisions,
  };
}
