import "server-only";
import Task from "./models/Task";
import HabitLog from "./models/HabitLog";
import { minutesBetween, parseDateKey, toDateKey } from "./date";
import { countsTowardStudyHours } from "./constants";
import type { Types } from "mongoose";

const MIN_TASK_MINUTES = 15;

export async function dayQualifiesAsStudied(
  userId: string | Types.ObjectId,
  dateKey: string
): Promise<boolean> {
  const habit = await HabitLog.findOne({ userId, dateKey }).lean();
  if (habit?.dayStatus === "completed" || habit?.studyCompleted) return true;
  const tasks = await Task.find({ userId, dateKey, status: "completed" }).lean();
  let mins = 0;
  for (const t of tasks) {
    if (!countsTowardStudyHours(t.subject)) continue;
    const m = minutesBetween(t.startTime, t.endTime);
    if (m > 0) mins += m;
  }
  return mins >= MIN_TASK_MINUTES;
}

export async function computeStudyStreak(userId: string | Types.ObjectId): Promise<number> {
  let key = toDateKey(new Date());
  let streak = 0;
  const maxDays = 400;
  for (let i = 0; i < maxDays; i++) {
    const ok = await dayQualifiesAsStudied(userId, key);
    if (!ok) break;
    streak++;
    const d = parseDateKey(key);
    d.setDate(d.getDate() - 1);
    key = toDateKey(d);
  }
  return streak;
}

export async function computeChallengeStreak(
  userId: string | Types.ObjectId,
  predicate: (h: { dayStatus?: string }) => boolean
): Promise<number> {
  let key = toDateKey(new Date());
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const habit = await HabitLog.findOne({ userId, dateKey: key }).lean();
    const ok = habit ? predicate(habit) : false;
    if (!ok) break;
    streak++;
    const d = parseDateKey(key);
    d.setDate(d.getDate() - 1);
    key = toDateKey(d);
  }
  return streak;
}
