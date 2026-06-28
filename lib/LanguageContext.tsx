"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, translations } from "./translations";

interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("wearesoloz-locale") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "te" || savedLocale === "hi")) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("wearesoloz-locale", newLocale);
    }
  };

  const t = (key: string, fallback?: string): string => {
    // Return translation if it exists, otherwise fall back to English dictionary, then to the provided fallback or the key itself
    const dict = translations[locale] || translations["en"];
    const fallbackDict = translations["en"];
    
    if (dict && dict[key]) {
      return dict[key];
    }
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {/* Optionally avoid rendering children until mounted to prevent flash of English, 
          but for SEO and layout SSR stability we render normally */}
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
