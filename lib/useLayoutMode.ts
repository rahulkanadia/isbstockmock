"use client";
import { useState, useEffect } from "react";

export type LayoutMode = "compact" | "medium" | "expanded";

export function useLayoutMode() {
  const [mode, setMode] = useState<LayoutMode>("expanded");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = /iphone|ipad|ipod|android|blackberry|mini|windows\sphone/g.test(ua);

      if (width < 768 || (isMobileUA && width < 1024)) {
        setMode("compact");
      } else if (width < 1280) {
        setMode("medium");
      } else {
        setMode("expanded");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return mode;
}