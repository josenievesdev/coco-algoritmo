"use client";

import { create } from "zustand";
import { juegosDisponibles } from "@/datos/juegosDisponibles";
import { validarSecuencia } from "@/motor/validarSecuencia";
import type { EstadoJuego, Juego } from "@/tipos/juego";

interface AccionesJuego {
  iniciarJuego: (juego?: Juego) => void;
  registrarOrden: (secuencia: string[]) => void;
  limpiarResultado: () => void;
}

type EstadoJuegoGlobal = EstadoJuego & AccionesJuego;

const juegoInicial = juegosDisponibles[0];

if (!juegoInicial) {
  throw new Error("Coco Algoritmo necesita al menos un juego disponible.");
}

function obtenerSecuenciaInicial(juego: Juego): string[] {
  return [...(juego.secuenciaInicial ?? juego.bloques)];
}

export const useEstadoJuego = create<EstadoJuegoGlobal>((set) => ({
  juegoActual: juegoInicial,
  secuenciaActual: obtenerSecuenciaInicial(juegoInicial),
  resultado: "jugando",
  intentos: 0,

  iniciarJuego: (juego = juegoInicial) => {
    set({
      juegoActual: juego,
      secuenciaActual: obtenerSecuenciaInicial(juego),
      resultado: "jugando",
      intentos: 0,
    });
  },

  registrarOrden: (secuencia) => {
    set((estadoActual) => {
      if (estadoActual.resultado === "exito") {
        return estadoActual;
      }

      const esCorrecta = validarSecuencia(
        secuencia,
        estadoActual.juegoActual.solucion,
      );

      return {
        secuenciaActual: secuencia,
        resultado: esCorrecta ? "exito" : "error",
        intentos: estadoActual.intentos + 1,
      };
    });
  },

  limpiarResultado: () => {
    set({ resultado: "jugando" });
  },
}));
