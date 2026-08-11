"use client";

import * as React from "react";

/** Rejestruje service workera (PWA). Tylko na produkcji — w devie
 *  cache'owanie tylko przeszkadza przy hot reloadzie. */
export function ServiceWorkerRegistrar() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* brak SW to nie powód, żeby psuć aplikację */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
