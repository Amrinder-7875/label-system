import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import trackRoutes from "./routes/track.js";
import artistRoutes from "./routes/artist.js";
import submissionRoutes from "./routes/submission.js";
import revenueRoutes from "./routes/revenue.js";
import releaseRoutes from "./routes/release.js";
import audienceRoutes from "./routes/audience.js";
import scheduleRoutes from "./routes/schedule.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tracks", trackRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/submission", submissionRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/releases", releaseRoutes);
app.use("/api/audience", audienceRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(express.static(path.join(__dirname, "../../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist", "index.html"));
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong" });

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => console.log(err));
console.log("MONGO_URI:", process.env.MONGO_URI);
