import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Track from "../models/track.js";
import DemoSubmission from "../models/demoSubmission.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 }).lean();
    const totalStreams = tracks.reduce((sum, track) => sum + (track.streams || 0), 0);
    const avgPerTrack = tracks.length ? Math.round(totalStreams / tracks.length) : 0;
    res.json({
      tracks: tracks.map((track) => ({
        id: track._id.toString(),
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        bpm: track.bpm,
        streams: track.streams,
        status: track.status,
        duration: track.duration,
        sourceSubmissionId: track.sourceSubmissionId?.toString?.() ?? null,
      })),
      totalStreams,
      avgPerTrack,
    });
  } catch (err) {
    console.error("Track List Error:", err.message);
    res.status(500).json({ message: "Could not fetch tracks" });
  }
});

router.post("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  try {
    const { submissionId, ...payload } = req.body;
    let sourceSubmissionId = null;

    if (submissionId) {
      const submission = await DemoSubmission.findById(submissionId).lean();

      if (!submission) {
        return res.status(404).json({ message: "Approved submission not found" });
      }

      if (submission.status !== "approved") {
        return res.status(400).json({ message: "Only approved submissions can be added as tracks" });
      }

      const existingTrack = await Track.findOne({ sourceSubmissionId: submission._id }).lean();

      if (existingTrack) {
        return res.status(400).json({ message: "A track has already been created from this submission" });
      }

      sourceSubmissionId = submission._id;
      payload.artist = payload.artist || submission.artistName;
    }

    const track = await Track.create({
      ...payload,
      sourceSubmissionId,
    });

    res.status(201).json({
      message: "Track created",
      track: {
        id: track._id.toString(),
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        bpm: track.bpm,
        streams: track.streams,
        status: track.status,
        duration: track.duration,
        sourceSubmissionId: track.sourceSubmissionId?.toString?.() ?? null,
      },
    });
  } catch (err) {
    console.error("Track Create Error:", err.message);
    res.status(400).json({ message: "Could not create track" });
  }
});

router.delete("/:id", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  try {
    const track = await Track.findByIdAndDelete(req.params.id).lean();

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    return res.json({ message: "Track deleted" });
  } catch (err) {
    console.error("Track Delete Error:", err.message);
    return res.status(500).json({ message: "Could not delete track" });
  }
});

export default router;
