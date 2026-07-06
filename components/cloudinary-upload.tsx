"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export function CloudinaryUpload({ value, onChange, label = "Upload Image", accept = "image/*" }: CloudinaryUploadProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0].toLowerCase();
    return (
      cleanUrl.endsWith(".mp4") ||
      cleanUrl.endsWith(".webm") ||
      cleanUrl.endsWith(".ogg") ||
      cleanUrl.endsWith(".mov") ||
      url.includes("/video/upload/")
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);

    try {
      // 1. Get signed configuration from our backend API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      const isPublic = !token || window.location.pathname.includes("/trip-memories");
      const sigUrl = isPublic ? `${API_URL}/upload/signature-public` : `${API_URL}/admin/upload/signature`;
      const headersObj: any = isPublic ? {} : (token ? { Authorization: `Bearer ${token}` } : {});
      
      const sigRes = await fetch(sigUrl, {
        method: "POST",
        headers: headersObj,
      });
      if (!sigRes.ok) {
        throw new Error("Failed to get upload signature. Make sure you are logged in.");
      }
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

      // 2. Build FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      // Determine resource type
      const isVideoFile = file.type.startsWith("video/");
      const resourceType = isVideoFile ? "video" : "image";

      // 3. Upload to Cloudinary with progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error("Cloudinary upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("XHR Network error"));
      });

      xhr.send(formData);

      const uploadedUrl = await uploadPromise;
      onChange(uploadedUrl);
    } catch (error: any) {
      alert(error.message || "Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold uppercase tracking-wider text-soloz-ash">{label}</label>}

      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/45 flex items-center justify-center">
          {isVideo(value) ? (
            <video
              src={value}
              controls
              playsInline
              className="object-contain w-full h-full max-h-full rounded-xl"
            />
          ) : (
            <Image
              src={value}
              alt="Uploaded Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-soloz-ember transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-6 hover:border-soloz-ember/50 hover:bg-white/10 transition"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-center text-soloz-ash">
              <Loader2 className="animate-spin text-soloz-ember" size={36} />
              <p className="text-sm font-medium">Uploading file... {progress}%</p>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-soloz-ember transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center text-soloz-ash">
              <UploadCloud className="text-soloz-ember" size={36} />
              <p className="text-sm font-medium">
                {accept === "*" 
                  ? "Click to select image or video" 
                  : accept.includes("video") 
                    ? "Click to select video" 
                    : "Click to select image"}
              </p>
              <p className="text-xs text-white/40">
                {accept === "*"
                  ? "PNG, JPG, WEBP, MP4, or MOV"
                  : accept.includes("video")
                    ? "MP4, WebM, MOV, or OGG"
                    : "PNG, JPG, WEBP, or GIF"}
              </p>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept={accept}
        className="hidden"
        disabled={loading}
      />
    </div>
  );
}
