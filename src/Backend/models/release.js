import mongoose from "mongoose";

const releaseSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["Album", "EP", "Single", "Compilation"],
      default: "Single",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "live"],
      default: "draft",
    },
    date: {
      type: Date,
      default: null,
    },
    trackCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    streams: {
      type: Number,
      default: 0,
      min: 0,
    },
    year: {
      type: Number,
      default: null,
    },
    rating: {
      type: Number,
      default: null,
      min: 0,
      max: 5,
    },
    coverUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Release", releaseSchema);
