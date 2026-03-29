"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "../session";
import connectDB from "../db";
import TestModel from "../models/Test";

export async function createTestAction(input: {
  date: string;
  score: number;
  totalMarks: number;
}) {
  const userId = await requireUserId();
  await connectDB();
  await TestModel.create({
    userId,
    date: new Date(input.date),
    score: input.score,
    totalMarks: input.totalMarks,
  });
  revalidatePath("/tests");
  revalidatePath("/dashboard");
}

export async function deleteTestAction(id: string) {
  const userId = await requireUserId();
  await connectDB();
  await TestModel.deleteOne({ _id: id, userId });
  revalidatePath("/tests");
  revalidatePath("/dashboard");
}

export async function getTestsAction() {
  const userId = await requireUserId();
  await connectDB();
  return TestModel.find({ userId }).sort({ date: 1 }).lean();
}
