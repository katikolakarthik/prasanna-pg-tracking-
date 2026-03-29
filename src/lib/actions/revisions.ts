"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "../session";
import connectDB from "../db";
import Revision from "../models/Revision";

export async function toggleRevisionAction(revisionId: string) {
  const userId = await requireUserId();
  await connectDB();
  const rev = await Revision.findOne({ _id: revisionId, userId });
  if (!rev) throw new Error("Revision not found");
  rev.status = rev.status === "completed" ? "pending" : "completed";
  await rev.save();
  revalidatePath("/revision");
  revalidatePath("/dashboard");
}

export async function getRevisionsAction() {
  const userId = await requireUserId();
  await connectDB();
  const pending = await Revision.find({ userId, status: "pending" })
    .sort({ dueDateKey: 1 })
    .lean();
  const done = await Revision.find({ userId, status: "completed" })
    .sort({ updatedAt: -1 })
    .limit(30)
    .lean();
  return { pending, done };
}
