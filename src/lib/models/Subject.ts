import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const subjectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, required: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

subjectSchema.index({ userId: 1, key: 1 }, { unique: true });

export type SubjectDoc = InferSchemaType<typeof subjectSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Subject: Model<SubjectDoc> =
  mongoose.models.Subject ?? mongoose.model<SubjectDoc>("Subject", subjectSchema);

export default Subject;
