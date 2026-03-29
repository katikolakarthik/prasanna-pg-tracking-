import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    dateKey: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export type TaskDoc = InferSchemaType<typeof taskSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Task: Model<TaskDoc> =
  mongoose.models.Task ?? mongoose.model<TaskDoc>("Task", taskSchema);

export default Task;
