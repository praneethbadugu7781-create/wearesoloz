"use client";

import { useEffect } from "react";

export default function AdSense() {
  useEffect(() => {
    const loadAdSense = () => {
      // Prevent duplicate script injection
      if (document.querySelector('script[src*="adsbygoogle.js"]')) {
        return;
      }
      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2231310894436146";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    };

    // Detect bots/crawlers to run instantly for verification bots
    const isBot = /bot|google|crawler|spider|robot|crawling|lighthouse/i.test(navigator.userAgent);
    if (isBot) {
      loadAdSense();
      return;
    }

    // Lazy load after 3 seconds, or as soon as the user interacts/scrolls
    const timer = setTimeout(loadAdSense, 3000);

    const events = ["mousedown", "touchstart", "scroll", "mousemove"];
    const handler = () => {
      loadAdSense();
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, handler));
    };

    events.forEach((event) => window.addEventListener(event, handler, { passive: true }));

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, handler));
    };
  }, []);

  return null;
}
