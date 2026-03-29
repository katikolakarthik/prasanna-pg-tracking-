import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const revisionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    topicTitle: { type: String, required: true },
    subjectKey: { type: String, required: true },
    dueDateKey: { type: String, required: true, index: true },
    intervalDays: { type: Number, required: true, enum: [1, 7, 15] },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
  },
  { timestamps: true }
);

export type RevisionDoc = InferSchemaType<typeof revisionSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Revision: Model<RevisionDoc> =
  mongoose.models.Revision ?? mongoose.model<RevisionDoc>("Revision", revisionSchema);

export default Revision;
