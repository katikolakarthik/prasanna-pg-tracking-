import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const notesSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectKey: { type: String, required: true },
    content: { type: String, default: "" },
  },
  { timestamps: true }
);

notesSchema.index({ userId: 1, subjectKey: 1 }, { unique: true });

export type NotesDoc = InferSchemaType<typeof notesSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Notes: Model<NotesDoc> =
  mongoose.models.Notes ?? mongoose.model<NotesDoc>("Notes", notesSchema);

export default Notes;
