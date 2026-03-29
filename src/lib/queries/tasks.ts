import "server-only";
import connectDB from "../db";
import Task from "../models/Task";

export async function getTasksForDate(userId: string, dateKey: string) {
  await connectDB();
  const rows = await Task.find({ userId, dateKey }).sort({ startTime: 1 }).lean();
  return rows.map((t) => ({
    _id: String(t._id),
    title: t.title,
    subject: t.subject,
    startTime: t.startTime,
    endTime: t.endTime,
    status: t.status as "pending" | "completed",
    dateKey: t.dateKey,
  }));
}
