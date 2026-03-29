"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "../session";
import connectDB from "../db";
import Task from "../models/Task";
import { minutesBetween } from "../date";
import { countsTowardStudyHours } from "../constants";

export async function createTaskAction(input: {
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  dateKey: string;
}) {
  const userId = await requireUserId();
  await connectDB();
  await Task.create({
    userId,
    title: input.title,
    subject: input.subject,
    startTime: input.startTime,
    endTime: input.endTime,
    dateKey: input.dateKey,
    status: "pending",
  });
  revalidatePath("/planner");
  revalidatePath("/dashboard");
}

export async function toggleTaskStatusAction(taskId: string) {
  const userId = await requireUserId();
  await connectDB();
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) throw new Error("Task not found");
  task.status = task.status === "completed" ? "pending" : "completed";
  await task.save();
  revalidatePath("/planner");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(taskId: string) {
  const userId = await requireUserId();
  await connectDB();
  await Task.deleteOne({ _id: taskId, userId });
  revalidatePath("/planner");
  revalidatePath("/dashboard");
}

export async function getTasksForDateAction(dateKey: string) {
  const userId = await requireUserId();
  await connectDB();
  return Task.find({ userId, dateKey }).sort({ startTime: 1 }).lean();
}

export async function getTodayStudyMinutesAction(dateKey: string) {
  const userId = await requireUserId();
  await connectDB();
  const tasks = await Task.find({ userId, dateKey, status: "completed" }).lean();
  let mins = 0;
  for (const t of tasks) {
    if (!countsTowardStudyHours(t.subject)) continue;
    const m = minutesBetween(t.startTime, t.endTime);
    if (m > 0) mins += m;
  }
  return mins;
}
