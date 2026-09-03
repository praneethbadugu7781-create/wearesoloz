"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, File } from "lucide-react";
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

  const isDocument = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0].toLowerCase();
    return (
      cleanUrl.endsWith(".pdf") ||
      cleanUrl.endsWith(".doc") ||
      cleanUrl.endsWith(".docx") ||
      cleanUrl.endsWith(".xls") ||
      cleanUrl.endsWith(".xlsx") ||
      cleanUrl.endsWith(".txt")
    );
  };

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

  const compressImageIfNeeded = async (file: File): Promise<Blob | File> => {
    // Only compress images, leave PDFs and Videos untouched
    if (!file.type.startsWith("image/") || file.type.includes("gif")) {
      return file;
    }

    // If file is already smaller than 800KB, no compression needed
    if (file.size < 800 * 1024) {
      return file;
    }

    return new Promise((resolve) => {
      const img = document.createElement("img");
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.82
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = url;
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    setLoading(true);
    setProgress(0);

    try {
      // 1. Compress image client-side if it's large
      const processedFile = await compressImageIfNeeded(originalFile);

      // 2. Read file as base64 string
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(processedFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      // 3. Prepare request URL and headers
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      const isPublic = !token || window.location.pathname.includes("/trip-memories");
      const uploadUrl = isPublic ? `${API_URL}/upload/file-public` : `${API_URL}/admin/upload/file`;
      
      const headersObj: any = {
        "Content-Type": "application/json",
        ...(isPublic ? {} : (token ? { Authorization: `Bearer ${token}` } : {}))
      };

      // 4. Upload via Express API proxy using XHR to track progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      Object.keys(headersObj).forEach(key => {
        xhr.setRequestHeader(key, headersObj[key]);
      });

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              if (response.url) {
                resolve(response.url);
              } else {
                reject(new Error(response.error || "Upload failed"));
              }
            } else {
              const response = JSON.parse(xhr.responseText || "{}");
              reject(new Error(response.error || `Upload failed (${xhr.status})`));
            }
          } catch (e) {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
      });

      xhr.send(JSON.stringify({
        file: base64File,
        fileName: originalFile.name,
        folder: "/wearesoloz"
      }));

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
          {isDocument(value) ? (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-soloz-ember/15 flex items-center justify-center">
                <File className="w-6 h-6 text-soloz-ember" />
              </div>
              <a 
                href={value} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-semibold text-soloz-ember hover:underline max-w-[240px] truncate"
              >
                View Uploaded Document
              </a>
              <span className="text-[10px] text-white/50 block mt-1">Click X to remove and upload another</span>
            </div>
          ) : isVideo(value) ? (
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
                    : accept.includes("pdf") || accept.includes("doc")
                      ? "Click to select document (PDF/Word)"
                      : "Click to select image"}
              </p>
              <p className="text-xs text-white/40">
                {accept === "*"
                  ? "PNG, JPG, WEBP, MP4, or MOV"
                  : accept.includes("video")
                    ? "MP4, WebM, MOV, or OGG"
                    : accept.includes("pdf") || accept.includes("doc")
                      ? "PDF, DOC, DOCX, TXT, or Image"
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
