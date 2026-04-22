import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import AudienceSnapshot from "../models/audienceSnapshot.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const snapshot = await AudienceSnapshot.findOne().sort({ updatedAt: -1 }).lean();
    res.json(snapshot ?? {
      monthlyListeners: "—",
      followers: "—",
      saveRate: "—",
      engagement: "—",
      topCities: [],
      demographics: [],
    });
  } catch (err) {
    console.error("Audience Fetch Error:", err.message);
    res.status(500).json({ message: "Could not fetch audience" });
  }
});

router.put("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  try {
    const snapshot = await AudienceSnapshot.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({
      message: "Audience updated",
      audience: snapshot,
    });
  } catch (err) {
    console.error("Audience Update Error:", err.message);
    res.status(400).json({ message: "Could not update audience" });
  }
});

export default router;
