import { Schema, models, model } from "mongoose";

const gallerySchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    alt: { type: String, default: "" }
  },
  { timestamps: true }
);

export default models.Gallery || model("Gallery", gallerySchema);
