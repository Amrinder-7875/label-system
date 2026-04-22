import mongoose from "mongoose";

const scheduleItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "done"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ScheduleItem", scheduleItemSchema);
