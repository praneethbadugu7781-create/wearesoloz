import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function getOptimizedImageUrl(url: string, width = 600) {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_scale,w_${width},f_auto,q_auto/`);
}
