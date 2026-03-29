import "server-only";
import connectDB from "../db";
import HabitLog from "../models/HabitLog";

export async function getHabitsInRange(userId: string, fromKey: string, toKey: string) {
  await connectDB();
  const rows = await HabitLog.find({
    userId,
    dateKey: { $gte: fromKey, $lte: toKey },
  }).lean();
  return rows.map((h) => ({
    _id: String(h._id),
    dateKey: h.dateKey,
    dayStatus: h.dayStatus as "completed" | "missed" | "unset",
    studyCompleted: h.studyCompleted,
    walking: h.walking,
    dietFollowed: h.dietFollowed,
  }));
}
