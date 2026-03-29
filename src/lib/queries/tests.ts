import "server-only";
import connectDB from "../db";
import TestModel from "../models/Test";

export async function getTestsForUser(userId: string) {
  await connectDB();
  const rows = await TestModel.find({ userId }).sort({ date: 1 }).lean();
  return rows.map((t) => ({
    _id: String(t._id),
    date: t.date.toISOString(),
    score: t.score,
    totalMarks: t.totalMarks,
  }));
}
