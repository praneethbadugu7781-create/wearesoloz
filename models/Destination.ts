import { Schema, models, model } from "mongoose";

const destinationSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    featured: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default models.Destination || model("Destination", destinationSchema);
