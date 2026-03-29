"use server";

import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectDB from "../db";
import User from "../models/User";
import { seedSubjectsForUser } from "../session";

const COOKIE = "neet_uid";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 400,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export type EnsureUserResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "no_database" };

export async function ensureUserAction(): Promise<EnsureUserResult> {
  if (!process.env.MONGODB_URI?.trim()) {
    return { ok: false, reason: "no_database" };
  }
  await connectDB();
  const jar = await cookies();
  let id = jar.get(COOKIE)?.value;
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    const exists = await User.findById(id).lean();
    if (exists) {
      await seedSubjectsForUser(id);
      return { ok: true, userId: id };
    }
  }
  const user = await User.create({ name: "Student" });
  id = user._id.toString();
  jar.set(COOKIE, id, cookieOptions);
  await seedSubjectsForUser(id);
  return { ok: true, userId: id };
}
