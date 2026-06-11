import { Schema, models, model } from "mongoose";

const siteSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export default models.SiteSetting || model("SiteSetting", siteSettingSchema);
