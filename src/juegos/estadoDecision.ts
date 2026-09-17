"use client";

import { create } from "zustand";
import {
  crearColocacionVacia,
  obtenerEspaciosOrdenados,
} from "@/motor/programaDecision";
import { obtenerZonaPista, validarDecision } from "@/motor/validarDecision";
import type {
  NivelDecision,
  ResultadoValidacionDecision,
  ZonaDecision,
} from "@/tipos/juego";

export const ERRORES_PARA_PISTA = 3;

export type ResultadoPartidaDecision = "jugando" | "exito" | "error";

export type AccionTablero =
  | "colocada"
  | "intercambiada"
  | "retirada"
  | "rechazada"
  | "sin-cambio";

export type EvaluacionTablero =
  | "incompleta"
  | "correcta"
  | "incorrecta"
  | "repetida"
  | "reiniciada";

export interface RespuestaMovimiento {
  accion: AccionTablero;
  evaluacion: EvaluacionTablero;
}

interface EstadoPartidaDecision {
  nivelActual: NivelDecision | null;
  /** Orden de la bandeja: se decide al iniciar y no cambia en la partida. */
  bandeja: string[];
  colocacion: Record<string, string | null>;
  resultado: ResultadoPartidaDecision;
  ultimaValidacion: ResultadoValidacionDecision | null;
  /** Firma de la última colocación completa evaluada. */
  firmaEvaluada: string | null;
  erroresCompletos: number;
  zonaPista: ZonaDecision | null;
  /** Aumenta con cada evaluación completa; sirve como clave de avisos. */
  numeroEvaluacion: number;
}

interface AccionesPartidaDecision {
  iniciarNivel: (nivel: NivelDecision, ordenBandeja: readonly string[]) => void;
  colocarFicha: (
    identificadorFicha: string,
    identificadorEspacio: string,
  ) => RespuestaMovimiento;
  retirarFicha: (identificadorEspacio: string) => RespuestaMovimiento;
}

export type EstadoDecision = EstadoPartidaDecision & AccionesPartidaDecision;

function crearEstadoInicial(): EstadoPartidaDecision {
  return {
    nivelActual: null,
    bandeja: [],
    colocacion: {},
    resultado: "jugando",
    ultimaValidacion: null,
    firmaEvaluada: null,
    erroresCompletos: 0,
    zonaPista: null,
    numeroEvaluacion: 0,
  };
}

export function obtenerEspacioDeFicha(
  colocacion: Readonly<Record<string, string | null>>,
  identificadorFicha: string,
): string | null {
  const entrada = Object.entries(colocacion).find(
    ([, ficha]) => ficha === identificadorFicha,
  );

  return entrada ? entrada[0] : null;
}

function crearFirma(
  nivel: NivelDecision,
  colocacion: Readonly<Record<string, string | null>>,
): string {
  return obtenerEspaciosOrdenados(nivel)
    .map((espacio) => `${espacio.identificador}=${colocacion[espacio.identificador] ?? ""}`)
    .join("|");
}

function aceptaFicha(
  nivel: NivelDecision,
  identificadorEspacio: string,
  identificadorFicha: string,
): boolean {
  const espacio = nivel.espacios.find(
    (candidato) => candidato.identificador === identificadorEspacio,
  );
  const ficha = nivel.fichas.find(
    (candidata) => candidata.identificador === identificadorFicha,
  );

  return Boolean(
    espacio &&
      ficha &&
      (espacio.acepta === "cualquiera" || espacio.acepta === ficha.tipo),
  );
}

export const useEstadoDecision = create<EstadoDecision>((set, get) => {
  /** Evalúa la colocación actual y actualiza el estado de la partida. */
  function evaluar(
    nivel: NivelDecision,
    colocacion: Record<string, string | null>,
  ): EvaluacionTablero {
    const validacion = validarDecision(nivel, colocacion);
    const estado = get();

    if (validacion.estado === "invalida") {
      // Datos imposibles: se reinicia el tablero sin penalización.
      set({
        colocacion: crearColocacionVacia(nivel),
        resultado: "jugando",
        ultimaValidacion: null,
        firmaEvaluada: null,
      });
      return "reiniciada";
    }

    if (validacion.estado === "incompleta") {
      set({ colocacion, resultado: "jugando", ultimaValidacion: validacion });
      return "incompleta";
    }

    const firma = crearFirma(nivel, colocacion);

    if (firma === estado.firmaEvaluada) {
      // Colocación ya evaluada: se muestra su resultado sin contar de nuevo.
      set({
        colocacion,
        resultado: validacion.estado === "correcta" ? "exito" : "error",
        ultimaValidacion: validacion,
      });
      return "repetida";
    }

    if (validacion.estado === "correcta") {
      set({
        colocacion,
        resultado: "exito",
        ultimaValidacion: validacion,
        firmaEvaluada: firma,
        numeroEvaluacion: estado.numeroEvaluacion + 1,
      });
      return "correcta";
    }

    const erroresCompletos = estado.erroresCompletos + 1;

    set({
      colocacion,
      resultado: "error",
      ultimaValidacion: validacion,
      firmaEvaluada: firma,
      erroresCompletos,
      zonaPista:
        erroresCompletos >= ERRORES_PARA_PISTA
          ? obtenerZonaPista(validacion)
          : estado.zonaPista,
      numeroEvaluacion: estado.numeroEvaluacion + 1,
    });
    return "incorrecta";
  }

  return {
    ...crearEstadoInicial(),

    iniciarNivel: (nivel, ordenBandeja) => {
      set({
        ...crearEstadoInicial(),
        nivelActual: nivel,
        bandeja: [...ordenBandeja],
        colocacion: crearColocacionVacia(nivel),
      });
    },

    colocarFicha: (identificadorFicha, identificadorEspacio) => {
      const { nivelActual: nivel, colocacion, resultado } = get();

      if (
        !nivel ||
        resultado === "exito" ||
        !(identificadorEspacio in colocacion) ||
        !nivel.fichas.some(
          (ficha) => ficha.identificador === identificadorFicha,
        )
      ) {
        return { accion: "rechazada", evaluacion: "incompleta" };
      }

      if (!aceptaFicha(nivel, identificadorEspacio, identificadorFicha)) {
        return { accion: "rechazada", evaluacion: "incompleta" };
      }

      const espacioOrigen = obtenerEspacioDeFicha(colocacion, identificadorFicha);

      if (espacioOrigen === identificadorEspacio) {
        return { accion: "sin-cambio", evaluacion: "incompleta" };
      }

      const ocupante = colocacion[identificadorEspacio];
      const nuevaColocacion = { ...colocacion };
      let accion: AccionTablero = "colocada";

      nuevaColocacion[identificadorEspacio] = identificadorFicha;

      if (espacioOrigen) {
        // La ficha anterior pasa al espacio de origen si lo acepta; si no,
        // vuelve a la bandeja.
        nuevaColocacion[espacioOrigen] =
          ocupante && aceptaFicha(nivel, espacioOrigen, ocupante)
            ? ocupante
            : null;
        accion = ocupante ? "intercambiada" : "colocada";
      } else if (ocupante) {
        accion = "intercambiada";
      }

      return { accion, evaluacion: evaluar(nivel, nuevaColocacion) };
    },

    retirarFicha: (identificadorEspacio) => {
      const { nivelActual: nivel, colocacion, resultado } = get();

      if (
        !nivel ||
        resultado === "exito" ||
        !colocacion[identificadorEspacio]
      ) {
        return { accion: "sin-cambio", evaluacion: "incompleta" };
      }

      return {
        accion: "retirada",
        evaluacion: evaluar(nivel, {
          ...colocacion,
          [identificadorEspacio]: null,
        }),
      };
    },
  };
});
