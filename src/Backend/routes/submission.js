import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import DemoSubmission from "../models/demoSubmission.js";

const router = express.Router();
const ALLOWED_STATUSES = new Set(["pending", "in_review", "approved", "rejected"]);

const generateTrackingId = () => {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `XC-${randomPart}`;
};

const createUniqueTrackingId = async () => {
  let trackingId = generateTrackingId();

  while (await DemoSubmission.exists({ trackingId })) {
    trackingId = generateTrackingId();
  }

  return trackingId;
};

router.post("/", async (req, res) => {
  try {
    const { artistName, email, demoUrl, message } = req.body;

    if (!artistName || !email) {
      return res.status(400).json({ message: "Artist name and email are required" });
    }

    const trackingId = await createUniqueTrackingId();

    const submission = await DemoSubmission.create({
      trackingId,
      artistName,
      email,
      demoUrl,
      message,
    });

    res.status(201).json({
      message: "Demo submitted successfully",
      submission: {
        trackingId: submission.trackingId,
        artistName: submission.artistName,
        email: submission.email,
        demoUrl: submission.demoUrl,
        message: submission.message,
        status: submission.status,
        submittedAt: submission.createdAt,
      },
    });
  } catch (err) {
    console.error("Submission Create Error:", err.message);
    res.status(500).json({ message: "Could not submit demo" });
  }
});

router.get("/track/:trackingId", async (req, res) => {
  try {
    const trackingId = req.params.trackingId.toUpperCase();
    const submission = await DemoSubmission.findOne({ trackingId }).lean();

    if (!submission) {
      return res.status(404).json({ message: "Tracking ID not found" });
    }

    res.json({
      submission: {
        trackingId: submission.trackingId,
        artistName: submission.artistName,
        email: submission.email,
        demoUrl: submission.demoUrl,
        message: submission.message,
        status: submission.status,
        submittedAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      },
    });
  } catch (err) {
    console.error("Submission Track Error:", err.message);
    res.status(500).json({ message: "Could not fetch submission status" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const dbSubmissions = await DemoSubmission.find()
      .sort({ createdAt: -1 })
      .lean();

    const normalizedDbSubmissions = dbSubmissions.map((submission) => ({
      id: submission._id.toString(),
      source: "database",
      trackingId: submission.trackingId,
      trackTitle: "Demo Submission",
      artistName: submission.artistName,
      genre: "Unspecified",
      bpm: "—",
      status: submission.status,
      submittedAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      demoUrl: submission.demoUrl || "",
      fileUrl: submission.demoUrl || "",
      email: submission.email,
      message: submission.message,
    }));

    res.json({ submissions: normalizedDbSubmissions });
  } catch (err) {
    console.error("Submission List Error:", err.message);
    res.status(500).json({ message: "Could not fetch submissions" });
  }
});

const updateSubmissionStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const { status } = req.body;

    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid submission status" });
    }

    const submission = await DemoSubmission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).lean();

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({
      message: "Submission status updated",
      submission: {
        id: submission._id.toString(),
        trackingId: submission.trackingId,
        artistName: submission.artistName,
        email: submission.email,
        demoUrl: submission.demoUrl,
        message: submission.message,
        status: submission.status,
        submittedAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      },
    });
  } catch (err) {
    console.error("Submission Status Update Error:", err.message);
    res.status(500).json({ message: "Could not update submission status" });
  }
};

router.patch("/:id/status", authMiddleware, updateSubmissionStatus);
router.post("/:id/status", authMiddleware, updateSubmissionStatus);

export default router;
