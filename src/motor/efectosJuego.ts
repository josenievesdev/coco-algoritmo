"use client";

import { reproducirSonido } from "@/motor/sonidos";

function vibrarDispositivo(patron: number | number[]): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(patron);
  }
}

export function ejecutarEfectoAcierto(): void {
  reproducirSonido("exito");
  vibrarDispositivo([35, 30, 90]);
}

export function ejecutarEfectoError(): void {
  reproducirSonido("error");
  vibrarDispositivo(45);
}
