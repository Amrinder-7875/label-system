import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    validate: {
      validator(value) {
        return Boolean(this.googleId || value);
      },
      message: "Password is required for non-Google accounts"
    }
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },
  role: {
    type: String,
    enum: ["user", "artist", "admin"],
    default: "user"
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
