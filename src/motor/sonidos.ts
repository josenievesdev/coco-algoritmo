"use client";

import { Howl } from "howler";

export type NombreSonido = "exito" | "error";

const fuentesSonido: Record<NombreSonido, string | null> = {
  exito: null,
  error: null,
};

const sonidosCargados = new Map<NombreSonido, Howl>();

export function registrarFuenteSonido(
  nombre: NombreSonido,
  ruta: string,
): void {
  fuentesSonido[nombre] = ruta;
  sonidosCargados.delete(nombre);
}

export function reproducirSonido(nombre: NombreSonido): void {
  if (typeof window === "undefined") {
    return;
  }

  const ruta = fuentesSonido[nombre];

  if (!ruta) {
    return;
  }

  const sonido =
    sonidosCargados.get(nombre) ??
    new Howl({
      src: [ruta],
      volume: 0.42,
      preload: true,
    });

  sonidosCargados.set(nombre, sonido);
  sonido.play();
}
