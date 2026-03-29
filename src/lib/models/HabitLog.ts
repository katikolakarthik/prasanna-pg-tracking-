import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const habitLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dateKey: { type: String, required: true },
    dayStatus: { type: String, enum: ["completed", "missed", "unset"], default: "unset" },
    studyCompleted: { type: Boolean, default: false },
    walking: { type: Boolean, default: false },
    dietFollowed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

habitLogSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export type HabitLogDoc = InferSchemaType<typeof habitLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

const HabitLog: Model<HabitLogDoc> =
  mongoose.models.HabitLog ?? mongoose.model<HabitLogDoc>("HabitLog", habitLogSchema);

export default HabitLog;
