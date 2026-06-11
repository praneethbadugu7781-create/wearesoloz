import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadToCloudinary(file: string, folder = "wearesoloz") {
  return cloudinary.uploader.upload(file, {
    folder,
    resource_type: "auto",
    transformation: [{ quality: "auto" }, { fetch_format: "auto" }]
  });
}

export { cloudinary };
