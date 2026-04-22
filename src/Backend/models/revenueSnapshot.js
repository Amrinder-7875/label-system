import mongoose from "mongoose";

const breakdownSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true },
    pct: { type: Number, default: 0, min: 0 },
    amount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const payoutSchema = new mongoose.Schema(
  {
    cycle: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    status: { type: String, enum: ["paid", "pending"], default: "pending" },
    amount: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const earningSchema = new mongoose.Schema(
  {
    trackId: { type: String, default: "", trim: true },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    platform: { type: String, required: true, trim: true },
    streams: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
    share: { type: Number, default: 0, min: 0 },
    recordedAt: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const revenueSnapshotSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0, min: 0 },
    pending: { type: Number, default: 0, min: 0 },
    paid: { type: Number, default: 0, min: 0 },
    avgPerTrack: { type: Number, default: 0, min: 0 },
    breakdown: { type: [breakdownSchema], default: [] },
    payouts: { type: [payoutSchema], default: [] },
    earningsByTrack: { type: [earningSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("RevenueSnapshot", revenueSnapshotSchema);
