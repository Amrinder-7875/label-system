import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    listeners: { type: String, required: true, trim: true },
    growth: { type: String, default: "", trim: true },
  },
  { _id: false, suppressReservedKeysWarning: true }
);

const demographicSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    pct: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const audienceSnapshotSchema = new mongoose.Schema(
  {
    monthlyListeners: { type: String, default: "—", trim: true },
    followers: { type: String, default: "—", trim: true },
    saveRate: { type: String, default: "—", trim: true },
    engagement: { type: String, default: "—", trim: true },
    topCities: { type: [citySchema], default: [] },
    demographics: { type: [demographicSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("AudienceSnapshot", audienceSnapshotSchema);
