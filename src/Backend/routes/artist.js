import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import Track from "../models/track.js";
import Release from "../models/release.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const artists = await User.find({ role: "artist" }).sort({ createdAt: -1 }).lean();
    const tracks = await Track.find().lean();
    const releases = await Release.find().lean();

    const artistsWithStats = artists.map((artist) => {
      const artistName = artist.name || artist.email?.split("@")[0] || "Artist";
      const artistTracks = tracks.filter((track) => track.artist === artistName);
      const trackCount = artistTracks.length;
      const streams = artistTracks.reduce((sum, track) => sum + (track.streams ?? 0), 0);

      return {
        id: artist._id.toString(),
        name: artistName,
        email: artist.email,
        status: "active",
        genres: [...new Set(artistTracks.map((track) => track.genre).filter(Boolean))],
        trackCount,
        streams,
      };
    });

    const combinedStreams = artistsWithStats.reduce((sum, artist) => sum + (artist.streams ?? 0), 0);

    res.json({
      artists: artistsWithStats,
      totalReleases: releases.length,
      combinedStreams,
    });
  } catch (err) {
    console.error("Artist List Error:", err.message);
    res.status(500).json({ message: "Could not fetch artists" });
  }
});

router.use(authMiddleware);

router.post("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }

  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();

    if (existingUser) {
      return res.status(400).json({ message: "Artist already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name?.trim() || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "local",
      role: "artist",
    });

    res.status(201).json({
      message: "Artist created",
      artist: {
        id: user._id.toString(),
        name: user.name || user.email.split("@")[0],
        email: user.email,
        status: "active",
        genres: [],
        trackCount: 0,
        streams: "—",
      },
    });
  } catch (err) {
    console.error("Artist Create Error:", err.message);
    res.status(500).json({ message: "Could not create artist" });
  }
});

export default router;
