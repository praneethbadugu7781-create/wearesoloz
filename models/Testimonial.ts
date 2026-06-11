import { Schema, models, model } from "mongoose";

const testimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "Traveler" },
    quote: { type: String, required: true },
    image: { type: String, default: "" },
    rating: { type: Number, default: 5 }
  },
  { timestamps: true }
);

export default models.Testimonial || model("Testimonial", testimonialSchema);
