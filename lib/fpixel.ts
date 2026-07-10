export const PIXEL_ID = "996033406530849";

export const fbq = (...args: any[]) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq(...args);
  }
};

export const trackEvent = (name: string, options = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", name, options);
  }
};

export const trackCustomEvent = (name: string, options = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("trackCustom", name, options);
  }
};
