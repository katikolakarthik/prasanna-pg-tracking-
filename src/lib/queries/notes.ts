import "server-only";
import connectDB from "../db";
import Notes from "../models/Notes";

export async function getNotesMap(userId: string) {
  await connectDB();
  const rows = await Notes.find({ userId }).lean();
  const map: Record<string, string> = {};
  for (const n of rows) {
    map[n.subjectKey] = n.content ?? "";
  }
  return map;
}
