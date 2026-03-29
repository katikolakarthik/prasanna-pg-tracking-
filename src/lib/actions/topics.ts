"use server";

import { revalidatePath } from "next/cache";
import type { Types } from "mongoose";
import { requireUserId } from "../session";
import connectDB from "../db";
import Topic from "../models/Topic";
import Subject from "../models/Subject";
import Revision from "../models/Revision";
import { addDaysToKey, toDateKey } from "../date";

async function scheduleRevisionsForTopic(
  userId: string,
  topic: { _id: Types.ObjectId; title: string },
  subjectKey: string
) {
  const baseKey = toDateKey(new Date());
  const intervals = [1, 7, 15] as const;
  await Revision.deleteMany({
    userId,
    topicId: topic._id,
    status: "pending",
  });
  await Revision.insertMany(
    intervals.map((days) => ({
      userId,
      topicId: topic._id,
      topicTitle: topic.title,
      subjectKey,
      dueDateKey: addDaysToKey(baseKey, days),
      intervalDays: days,
      status: "pending" as const,
    }))
  );
}

export async function createTopicAction(subjectId: string, title: string) {
  const userId = await requireUserId();
  await connectDB();
  const sub = await Subject.findOne({ _id: subjectId, userId }).lean();
  if (!sub) throw new Error("Subject not found");
  await Topic.create({
    userId,
    subjectId,
    title,
    status: "not_started",
  });
  revalidatePath("/subjects");
  revalidatePath("/dashboard");
}

export async function updateTopicAction(
  topicId: string,
  patch: Partial<{ title: string; status: "not_started" | "in_progress" | "completed" }>
) {
  const userId = await requireUserId();
  await connectDB();
  const topic = await Topic.findOne({ _id: topicId, userId });
  if (!topic) throw new Error("Topic not found");
  const sub = await Subject.findById(topic.subjectId).lean();
  if (!sub) throw new Error("Subject missing");

  const prevStatus = topic.status;
  if (patch.title !== undefined) topic.title = patch.title;
  if (patch.status !== undefined) topic.status = patch.status;
  await topic.save();

  if (patch.status !== undefined) {
    if (patch.status === "completed" && prevStatus !== "completed") {
      await scheduleRevisionsForTopic(userId, topic, sub.key);
    } else if (patch.status !== "completed" && prevStatus === "completed") {
      await Revision.deleteMany({ userId, topicId, status: "pending" });
    }
  }

  revalidatePath("/subjects");
  revalidatePath("/revision");
  revalidatePath("/dashboard");
}

export async function deleteTopicAction(topicId: string) {
  const userId = await requireUserId();
  await connectDB();
  await Topic.deleteOne({ _id: topicId, userId });
  await Revision.deleteMany({ userId, topicId });
  revalidatePath("/subjects");
  revalidatePath("/revision");
  revalidatePath("/dashboard");
}

export async function getSubjectsWithTopicsAction() {
  const userId = await requireUserId();
  await connectDB();
  const subjects = await Subject.find({ userId }).sort({ order: 1 }).lean();
  const topics = await Topic.find({ userId }).lean();
  return { subjects, topics };
}
