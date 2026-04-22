import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Release from "../models/release.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const releases = await Release.find().sort({ date: -1, createdAt: -1 }).lean();
    const currentYear = new Date().getFullYear();
    const totalStreams = releases.reduce((sum, release) => sum + (release.streams ?? 0), 0);
    const ratedReleases = releases.filter((release) => typeof release.rating === "number");
    const avgRating = ratedReleases.length
      ? (ratedReleases.reduce((sum, release) => sum + release.rating, 0) / ratedReleases.length).toFixed(1)
      : "—";

    res.json({
      releases: releases.map((release) => ({
        id: release._id.toString(),
        title: release.title,
        artist: release.artist,
        type: release.type,
        status: release.status,
        date: release.date,
        trackCount: release.trackCount,
        streams: release.streams,
        year: release.year,
        coverUrl: release.coverUrl,
        rating: release.rating,
      })),
      thisYear: releases.filter((release) => release.year === currentYear).length,
      totalStreams,
      avgRating,
    });
  } catch (err) {
    console.error("Release List Error:", err.message);
    res.status(500).json({ message: "Could not fetch releases" });
  }
});

router.use(authMiddleware);

router.post("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  try {
    const release = await Release.create(req.body);
    res.status(201).json({
      message: "Release created",
      release: {
        id: release._id.toString(),
        title: release.title,
        artist: release.artist,
        type: release.type,
        status: release.status,
        date: release.date,
        trackCount: release.trackCount,
        streams: release.streams,
        year: release.year,
        coverUrl: release.coverUrl,
        rating: release.rating,
      },
    });
  } catch (err) {
    console.error("Release Create Error:", err.message);
    res.status(400).json({ message: "Could not create release" });
  }
});

export default router;
