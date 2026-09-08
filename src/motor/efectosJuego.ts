"use client";

import { reproducirSonido } from "@/motor/sonidos";

function vibrarDispositivo(patron: number | number[]): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(patron);
  }
}

export function ejecutarEfectoMovimiento(): void {
  reproducirSonido("mover");
}

export function ejecutarEfectoEncaje(): void {
  reproducirSonido("encaje");
  vibrarDispositivo(12);
}

export function ejecutarEfectoAcierto(): void {
  reproducirSonido("exito");
  vibrarDispositivo([28, 24, 72]);
}

export function ejecutarEfectoError(): void {
  reproducirSonido("error");
  vibrarDispositivo(32);
}
