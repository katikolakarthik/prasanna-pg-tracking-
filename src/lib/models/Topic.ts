import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const topicSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
  },
  { timestamps: true }
);

export type TopicDoc = InferSchemaType<typeof topicSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Topic: Model<TopicDoc> =
  mongoose.models.Topic ?? mongoose.model<TopicDoc>("Topic", topicSchema);

export default Topic;
