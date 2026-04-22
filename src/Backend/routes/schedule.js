import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Release from "../models/release.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const releases = await Release.find({ status: "scheduled" }).sort({ date: 1 }).lean();
    const schedule = releases.map((release) => ({
      id: release._id.toString(),
      title: release.title,
      owner: release.artist,
      date: release.date || release.createdAt,
      status: "scheduled",
    }));
    res.json({
      schedule,
    });
  } catch (err) {
    console.error("Schedule Fetch Error:", err.message);
    res.status(500).json({ message: "Could not fetch schedule" });
  }
});

router.post("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  try {
    const item = await ScheduleItem.create(req.body);
    res.status(201).json({
      message: "Schedule item created",
      scheduleItem: {
        id: item._id.toString(),
        title: item.title,
        owner: item.owner,
        date: item.date,
        status: item.status,
      },
    });
  } catch (err) {
    console.error("Schedule Create Error:", err.message);
    res.status(400).json({ message: "Could not create schedule item" });
  }
});

export default router;
