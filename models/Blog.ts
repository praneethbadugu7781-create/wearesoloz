import { Schema, models, model } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    readTime: { type: String, default: "5 min" },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "published" }
  },
  { timestamps: true }
);

export default models.Blog || model("Blog", blogSchema);
