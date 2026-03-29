"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "../session";
import connectDB from "../db";
import Notes from "../models/Notes";

export async function saveNotesAction(subjectKey: string, content: string) {
  const userId = await requireUserId();
  await connectDB();
  await Notes.findOneAndUpdate(
    { userId, subjectKey },
    { $set: { content } },
    { upsert: true, new: true }
  );
  revalidatePath("/notes");
}

export async function getNotesBySubjectAction(subjectKey: string) {
  const userId = await requireUserId();
  await connectDB();
  const doc = await Notes.findOne({ userId, subjectKey }).lean();
  return doc?.content ?? "";
}

export async function getAllNotesAction() {
  const userId = await requireUserId();
  await connectDB();
  return Notes.find({ userId }).lean();
}
