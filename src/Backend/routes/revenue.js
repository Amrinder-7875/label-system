import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import RevenueSnapshot from "../models/revenueSnapshot.js";

const router = express.Router();

const EMPTY_REVENUE = {
  total: 0,
  pending: 0,
  paid: 0,
  avgPerTrack: 0,
  breakdown: [],
  payouts: [],
  earningsByTrack: [],
};

const isWithinPeriod = (value, period) => {
  if (!value || !period) {
    return true;
  }

  const target = new Date(value);

  if (Number.isNaN(target.getTime())) {
    return false;
  }

  const now = new Date();

  if (period === "Weekly") {
    const diffMs = now - target;
    return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
  }

  if (period === "Monthly") {
    return target.getFullYear() === now.getFullYear() && target.getMonth() === now.getMonth();
  }

  if (period === "Quarterly") {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const targetQuarter = Math.floor(target.getMonth() / 3);
    return target.getFullYear() === now.getFullYear() && currentQuarter === targetQuarter;
  }

  if (period === "Yearly") {
    return target.getFullYear() === now.getFullYear();
  }

  return true;
};

const buildRevenueSnapshot = (payload = {}) => {
  const earningsByTrack = (payload.earningsByTrack ?? []).map((entry) => ({
    trackId: entry.trackId ?? "",
    title: entry.title?.trim() ?? "",
    artist: entry.artist?.trim() ?? "",
    platform: entry.platform?.trim() ?? "",
    streams: Number(entry.streams ?? 0),
    revenue: Number(entry.revenue ?? 0),
    share: Number(entry.share ?? 0),
    recordedAt: entry.recordedAt ?? new Date().toISOString().slice(0, 10),
  }));

  const payouts = (payload.payouts ?? []).map((entry) => ({
    cycle: entry.cycle?.trim() ?? "",
    date: entry.date ?? new Date().toISOString().slice(0, 10),
    status: entry.status === "paid" ? "paid" : "pending",
    amount: Number(entry.amount ?? 0),
  }));

  const total = earningsByTrack.reduce((sum, entry) => sum + entry.revenue, 0);
  const paid = payouts.filter((entry) => entry.status === "paid").reduce((sum, entry) => sum + entry.amount, 0);
  const pending = payouts.filter((entry) => entry.status === "pending").reduce((sum, entry) => sum + entry.amount, 0);
  const avgPerTrack = earningsByTrack.length ? total / earningsByTrack.length : 0;

  const platformMap = earningsByTrack.reduce((acc, entry) => {
    acc[entry.platform] = (acc[entry.platform] ?? 0) + entry.revenue;
    return acc;
  }, {});

  const breakdown = Object.entries(platformMap)
    .map(([platform, amount]) => ({
      platform,
      amount: Number(amount.toFixed(2)),
      pct: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    total: Number(total.toFixed(2)),
    pending: Number(pending.toFixed(2)),
    paid: Number(paid.toFixed(2)),
    avgPerTrack: Number(avgPerTrack.toFixed(2)),
    breakdown,
    payouts: payouts.sort((a, b) => new Date(b.date) - new Date(a.date)),
    earningsByTrack: earningsByTrack.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)),
  };
};

const filterRevenueSnapshot = (snapshot, period) => {
  if (!period) {
    return snapshot;
  }

  const filteredEarnings = (snapshot.earningsByTrack ?? []).filter((entry) =>
    isWithinPeriod(entry.recordedAt, period)
  );
  const filteredPayouts = (snapshot.payouts ?? []).filter((entry) =>
    isWithinPeriod(entry.date, period)
  );

  return buildRevenueSnapshot({
    earningsByTrack: filteredEarnings,
    payouts: filteredPayouts,
  });
};

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const snapshot = await RevenueSnapshot.findOne().sort({ updatedAt: -1 }).lean();
    const resolvedSnapshot = snapshot ?? EMPTY_REVENUE;
    const filteredSnapshot = filterRevenueSnapshot(resolvedSnapshot, req.query.period);

    res.json({
      ...filteredSnapshot,
      period: req.query.period || "All",
      allTime: resolvedSnapshot,
    });
  } catch (err) {
    console.error("Revenue Fetch Error:", err.message);
    res.status(500).json({ message: "Could not fetch revenue" });
  }
});

router.put("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  try {
    const snapshotPayload = buildRevenueSnapshot(req.body);
    const snapshot = await RevenueSnapshot.findOneAndUpdate(
      {},
      snapshotPayload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({
      message: "Revenue updated",
      revenue: snapshot,
    });
  } catch (err) {
    console.error("Revenue Update Error:", err.message);
    res.status(400).json({ message: "Could not update revenue" });
  }
});

export default router;
