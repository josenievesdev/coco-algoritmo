"use client";

import { create } from "zustand";
import { juegosDisponibles } from "@/datos/juegosDisponibles";
import { evaluarProgresoSecuencia } from "@/motor/evaluarProgresoSecuencia";
import type { EstadoJuego, Juego, ResultadoJuego } from "@/tipos/juego";

interface AccionesJuego {
  iniciarJuego: (juego?: Juego) => void;
  registrarOrden: (secuencia: string[]) => ResultadoJuego;
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

export const useEstadoJuego = create<EstadoJuegoGlobal>((set, get) => ({
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
    const estadoActual = get();

    if (estadoActual.resultado === "exito") {
      return "exito";
    }

    const evaluacionAnterior = evaluarProgresoSecuencia(
      estadoActual.secuenciaActual,
      estadoActual.juegoActual.solucion,
    );
    const evaluacionNueva = evaluarProgresoSecuencia(
      secuencia,
      estadoActual.juegoActual.solucion,
    );

    let resultado: ResultadoJuego = "error";

    if (evaluacionNueva.estado === "completa") {
      resultado = "exito";
    } else if (
      evaluacionNueva.pasosConsecutivosCorrectos >
      evaluacionAnterior.pasosConsecutivosCorrectos
    ) {
      resultado = "progreso";
    } else if (
      evaluacionNueva.pasosConsecutivosCorrectos ===
        evaluacionAnterior.pasosConsecutivosCorrectos &&
      evaluacionNueva.cantidadEnPosicionCorrecta >
        evaluacionAnterior.cantidadEnPosicionCorrecta
    ) {
      resultado = "encaje";
    }

    set({
      secuenciaActual: secuencia,
      resultado,
      intentos: estadoActual.intentos + 1,
    });

    return resultado;
  },

  limpiarResultado: () => {
    set({ resultado: "jugando" });
  },
}));
