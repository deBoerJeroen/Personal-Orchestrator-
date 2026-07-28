"use client";

import { useEffect } from "react";

/** Registreert de offline shell. Push volgt pas in fase 4. */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Zonder service worker werkt de app gewoon; alleen offline niet.
    });
  }, []);

  return null;
}
