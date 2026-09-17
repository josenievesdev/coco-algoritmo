"use client";

import { create } from "zustand";
import { nivelesDisponibles } from "@/datos/juegosDisponibles";
import { evaluarProgresoSecuencia } from "@/motor/evaluarProgresoSecuencia";
import { rotarSecuencia } from "@/motor/mezclarPasos";
import type {
  EstadoJuego,
  NivelSecuencia,
  ResultadoJuego,
} from "@/tipos/juego";

interface AccionesJuego {
  iniciarNivel: (
    nivel: NivelSecuencia,
    secuenciaInicial: readonly string[],
  ) => void;
  registrarOrden: (secuencia: string[]) => ResultadoJuego;
  limpiarResultado: () => void;
}

type EstadoJuegoGlobal = EstadoJuego & AccionesJuego;

const nivelInicial = nivelesDisponibles.find(
  (nivel): nivel is NivelSecuencia => nivel.tipo === "secuencia",
);

if (!nivelInicial) {
  throw new Error("Coco Algoritmo necesita al menos un nivel disponible.");
}

export function obtenerSolucion(nivel: NivelSecuencia): string[] {
  return nivel.pasos.map((paso) => paso.identificador);
}

/**
 * Estado de la partida en curso. No se guarda en el navegador: el progreso
 * estable vive en `progresoJuego`.
 */
export const useEstadoJuego = create<EstadoJuegoGlobal>((set, get) => ({
  nivelActual: nivelInicial,
  // Orden determinista para el primer render; cada partida real llega
  // mezclada mediante `iniciarNivel`.
  secuenciaActual: rotarSecuencia(obtenerSolucion(nivelInicial), 1),
  resultado: "jugando",
  intentos: 0,

  iniciarNivel: (nivel, secuenciaInicial) => {
    set({
      nivelActual: nivel,
      secuenciaActual: [...secuenciaInicial],
      resultado: "jugando",
      intentos: 0,
    });
  },

  registrarOrden: (secuencia) => {
    const estadoActual = get();

    if (estadoActual.resultado === "exito") {
      return "exito";
    }

    const solucion = obtenerSolucion(estadoActual.nivelActual);
    const evaluacionAnterior = evaluarProgresoSecuencia(
      estadoActual.secuenciaActual,
      solucion,
    );
    const evaluacionNueva = evaluarProgresoSecuencia(secuencia, solucion);

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
