import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const testSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
  },
  { timestamps: true }
);

export type TestDoc = InferSchemaType<typeof testSchema> & {
  _id: mongoose.Types.ObjectId;
};

const TestModel: Model<TestDoc> =
  mongoose.models.MockTest ?? mongoose.model<TestDoc>("MockTest", testSchema);

export default TestModel;
