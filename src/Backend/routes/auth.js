import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const TOKEN_EXPIRY = "1d";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const PUBLIC_REGISTRATION_ROLES = new Set(["artist", "user"]);

const createAuthPayload = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
};

const createLocalUser = async ({ email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { error: "User already exists", status: 400 };
  }

  const hashed = await bcrypt.hash(password, 10);
  const resolvedRole = PUBLIC_REGISTRATION_ROLES.has(role) ? role : "artist";

  const user = new User({
    email,
    password: hashed,
    authProvider: "local",
    role: resolvedRole
  });

  await user.save();

  return { user };
};

const authenticateLocalUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    return { error: "Invalid credentials", status: 400 };
  }

  if (!user.password) {
    return { error: "Use Google sign-in for this account", status: 400 };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return { error: "Invalid credentials", status: 400 };
  }

  return { user };
};

// Register (create admin manually)
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await createLocalUser({ email, password, role });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(201).json({
      message: "User created successfully",
      ...createAuthPayload(result.user)
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await authenticateLocalUser({ email, password });
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.json(createAuthPayload(result.user));
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/artist/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await createLocalUser({ email, password, role: "artist" });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(201).json({
      message: "Artist account created successfully",
      ...createAuthPayload(result.user)
    });
  } catch (err) {
    console.error("Artist Signup Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/artist/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await authenticateLocalUser({ email, password });
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    if (result.user.role !== "artist") {
      return res.status(403).json({ message: "Use member login for this account" });
    }

    res.json(createAuthPayload(result.user));
  } catch (err) {
    console.error("Artist Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google authentication is not configured" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
      return res.status(400).json({ message: "Invalid Google account payload" });
    }

    const resolvedRole = PUBLIC_REGISTRATION_ROLES.has(role) ? role : "artist";

    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }]
    });

    if (!user) {
      user = await User.create({
        email: payload.email.toLowerCase(),
        name: payload.name,
        googleId: payload.sub,
        authProvider: "google",
        role: resolvedRole
      });
    } else {
      user.googleId = user.googleId || payload.sub;
      user.name = payload.name || user.name;
      user.authProvider = "google";
      await user.save();
    }

    res.json(createAuthPayload(user));
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(401).json({ message: "Google authentication failed" });
  }
});

export default router;
