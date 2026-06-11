import { Schema, models, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "editor"], default: "admin" }
  },
  { timestamps: true }
);

export default models.User || model("User", userSchema);
