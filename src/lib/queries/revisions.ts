import "server-only";
import connectDB from "../db";
import Revision from "../models/Revision";

export async function getRevisionsForUser(userId: string) {
  await connectDB();
  const pending = await Revision.find({ userId, status: "pending" })
    .sort({ dueDateKey: 1 })
    .lean();
  const done = await Revision.find({ userId, status: "completed" })
    .sort({ updatedAt: -1 })
    .limit(40)
    .lean();
  const serialize = (r: (typeof pending)[number]) => ({
    _id: String(r._id),
    topicTitle: r.topicTitle,
    subjectKey: r.subjectKey,
    dueDateKey: r.dueDateKey,
    intervalDays: r.intervalDays,
    status: r.status as "pending" | "completed",
  });
  return {
    pending: pending.map(serialize),
    done: done.map(serialize),
  };
}
