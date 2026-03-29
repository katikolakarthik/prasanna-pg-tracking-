import "server-only";
import connectDB from "../db";
import Subject from "../models/Subject";
import Topic from "../models/Topic";

export async function getSubjectsWithTopics(userId: string) {
  await connectDB();
  const subjects = await Subject.find({ userId }).sort({ order: 1 }).lean();
  const topics = await Topic.find({ userId }).lean();
  return {
    subjects: subjects.map((s) => ({
      _id: String(s._id),
      key: s.key,
      name: s.name,
      order: s.order,
    })),
    topics: topics.map((t) => ({
      _id: String(t._id),
      subjectId: String(t.subjectId),
      title: t.title,
      status: t.status as "not_started" | "in_progress" | "completed",
    })),
  };
}
