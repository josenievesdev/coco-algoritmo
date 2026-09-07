"use client";

import { useEffect } from "react";

export default function RegistrarPwa() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    const registrar = () => {
      navigator.serviceWorker
        .register("/trabajador-servicio.js")
        .catch(() => undefined);
    };

    window.addEventListener("load", registrar, { once: true });

    return () => window.removeEventListener("load", registrar);
  }, []);

  return null;
}
