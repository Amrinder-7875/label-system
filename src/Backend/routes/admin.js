import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/user.js";
import DemoSubmission from "../models/demoSubmission.js";
import Track from "../models/track.js";
import Release from "../models/release.js";
import RevenueSnapshot from "../models/revenueSnapshot.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  try {
    const [artistCount, submissionCount, trackCount, releaseCount, revenueSnapshot] = await Promise.all([
      User.countDocuments({ role: "artist" }),
      DemoSubmission.countDocuments(),
      Track.countDocuments(),
      Release.countDocuments(),
      RevenueSnapshot.findOne().sort({ updatedAt: -1 }).lean(),
    ]);

    res.json({
      message: "Admin dashboard loaded",
      stats: {
        tracks: trackCount,
        artists: artistCount,
        submissions: submissionCount,
        releases: releaseCount,
        revenue: Number(revenueSnapshot?.total ?? 0),
        paidOut: Number(revenueSnapshot?.paid ?? 0),
      },
    });
  } catch (err) {
    console.error("Admin Summary Error:", err.message);
    res.status(500).json({ message: "Could not load admin dashboard" });
  }
});

export default router;
