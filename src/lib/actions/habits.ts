"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "../session";
import connectDB from "../db";
import HabitLog from "../models/HabitLog";

export async function upsertHabitLogAction(
  dateKey: string,
  patch: Partial<{
    dayStatus: "completed" | "missed" | "unset";
    studyCompleted: boolean;
    walking: boolean;
    dietFollowed: boolean;
  }>
) {
  const userId = await requireUserId();
  await connectDB();
  await HabitLog.findOneAndUpdate(
    { userId, dateKey },
    { $set: patch },
    { upsert: true, new: true }
  );
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function getHabitRangeAction(fromKey: string, toKey: string) {
  const userId = await requireUserId();
  await connectDB();
  return HabitLog.find({
    userId,
    dateKey: { $gte: fromKey, $lte: toKey },
  }).lean();
}
