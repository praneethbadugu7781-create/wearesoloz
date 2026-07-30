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
  if (url.includes("ik.imagekit.io")) {
    if (url.includes("/tr:")) return url;
    return url.replace("https://ik.imagekit.io/wearesoloz/", `https://ik.imagekit.io/wearesoloz/tr:w-${width},f-auto/`);
  }
  if (url.includes("cloudinary.com")) {
    return url.replace("/upload/", `/upload/c_scale,w_${width},f_auto,q_auto/`);
  }
  return url;
}

export function isUpcomingTrip(trip: any): boolean {
  if (!trip) return false;
  if (trip.status && trip.status !== "published") return false;

  // Sabarimala is a recurring trip
  if (trip.destination?.toLowerCase().includes("sabarimala")) return true;

  const todayStart = new Date().setHours(0, 0, 0, 0);

  // Check batches first
  if (trip.batches && Array.isArray(trip.batches) && trip.batches.length > 0) {
    const hasFutureBatch = trip.batches.some((b: any) => {
      const bDate = b.endDate || b.startDate;
      if (!bDate) return false;
      return new Date(bDate).getTime() >= todayStart;
    });
    if (hasFutureBatch) return true;
  }

  // Check main endDate or startDate or date
  const tripDate = trip.endDate || trip.startDate || trip.date;
  if (!tripDate) return false;

  return new Date(tripDate).getTime() >= todayStart;
}
