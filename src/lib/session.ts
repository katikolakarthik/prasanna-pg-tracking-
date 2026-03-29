import "server-only";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectDB from "./db";
import User from "./models/User";
import Subject from "./models/Subject";
import { PREDEFINED_SUBJECTS } from "./constants";

const COOKIE = "neet_uid";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 400,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function getUserIdFromCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

export async function requireUserId(): Promise<string> {
  const id = await getUserIdFromCookie();
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Session required. Refresh the page.");
  }
  await connectDB();
  const exists = await User.findById(id).lean();
  if (!exists) throw new Error("Invalid session.");
  await seedSubjectsForUser(id);
  return id;
}

export async function seedSubjectsForUser(userId: string) {
  await connectDB();
  const count = await Subject.countDocuments({ userId });
  if (count > 0) return;
  await Subject.insertMany(
    PREDEFINED_SUBJECTS.map((s, i) => ({
      userId,
      key: s.key,
      name: s.name,
      order: i,
    }))
  );
}
