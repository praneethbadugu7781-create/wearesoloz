import { Schema, models, model } from "mongoose";

const tripSchema = new Schema(
  {
    destination: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    duration: { type: String, required: true },
    price: { type: String, required: true },
    seats: { type: Number, required: true },
    description: { type: String, default: "" },
    itinerary: [{ day: String, title: String, description: String }],
    inclusions: [String],
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "published" }
  },
  { timestamps: true }
);

export default models.Trip || model("Trip", tripSchema);
