import { Schema, models, model } from "mongoose";

const contactSchema = new Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    destination: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" }
  },
  { timestamps: true }
);

export default models.Contact || model("Contact", contactSchema);
