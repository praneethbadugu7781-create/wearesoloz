"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PIXEL_ID } from "@/lib/fpixel";

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Load Meta Pixel script on client side
    if (typeof window !== "undefined") {
      /* eslint-disable no-unused-expressions */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        "script",
        "https://connect.facebook.net/en_US/fbevents.js"
      );

      // Initialize pixel
      (window as any).fbq("init", PIXEL_ID);
    }
  }, []);

  useEffect(() => {
    // 2. Fire PageView on route changes
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (typeof window === "undefined" || !(window as any).fbq) return;

      const target = e.target as HTMLElement;
      if (!target) return;

      const buttonOrLink = target.closest("button, a") as HTMLElement;
      if (!buttonOrLink) return;

      const text = (buttonOrLink.innerText || buttonOrLink.textContent || "").trim().toLowerCase();
      const href = buttonOrLink.getAttribute("href") || "";
      const className = buttonOrLink.className || "";

      // 1. WhatsApp Button/Link Clicks
      if (
        text.includes("whatsapp") || 
        href.includes("wa.me") || 
        href.includes("whatsapp.com") || 
        className.includes("whatsapp")
      ) {
        (window as any).fbq("track", "Contact", {
          content_name: "WhatsApp Click",
          button_text: text || "WhatsApp Link",
          url: window.location.href
        });
        return;
      }

      // 2. Book Now Clicks
      if (text.includes("book now") || text.includes("book seat") || text.includes("reserve")) {
        (window as any).fbq("trackCustom", "BookNowClick", {
          button_text: text,
          url: window.location.href
        });
        return;
      }

      // 3. Contact Us Clicks
      if (text.includes("contact us") || text.includes("contact")) {
        (window as any).fbq("trackCustom", "ContactUsClick", {
          button_text: text,
          url: window.location.href
        });
        return;
      }

      // 4. Enquiry Clicks
      if (text.includes("enquiry") || text.includes("inquire") || text.includes("send message") || text.includes("submit")) {
        (window as any).fbq("trackCustom", "EnquiryClick", {
          button_text: text,
          url: window.location.href
        });
        return;
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
