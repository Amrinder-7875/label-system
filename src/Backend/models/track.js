import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
      default: "",
    },
    bpm: {
      type: Number,
      default: null,
    },
    streams: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["released", "draft", "scheduled"],
      default: "draft",
    },
    duration: {
      type: String,
      trim: true,
      default: "",
    },
    sourceSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DemoSubmission",
      default: null,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Track", trackSchema);
