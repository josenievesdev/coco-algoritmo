"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { esIdentificadorHistorico } from "@/datos/identificadoresHistoricos";
import { nivelesDisponibles } from "@/datos/juegosDisponibles";
import { esPermutacionDelNivel } from "@/motor/mezclarNivel";

export const CLAVE_PROGRESO = "coco-algoritmo-progreso-v1";
export const VERSION_PROGRESO = 1;
export const MAXIMO_NIVELES_GUARDADOS = 128;

const CLAVE_COMPROBACION = "coco-algoritmo-comprobacion";

/** Lo único que se guarda en el navegador. */
export interface DatosProgreso {
  nivelesCompletados: string[];
  ultimosOrdenes: Record<string, string[]>;
}

interface EstadoProgreso extends DatosProgreso {
  hidratado: boolean;
  /** No se guarda: indica si el navegador permite conservar el progreso. */
  almacenamientoDisponible: boolean;
  marcarNivelCompletado: (identificadorNivel: string) => void;
  registrarOrdenInicial: (
    identificadorNivel: string,
    orden: readonly string[],
  ) => void;
}

function crearDatosIniciales(): DatosProgreso {
  return { nivelesCompletados: [], ultimosOrdenes: {} };
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/**
 * Convierte cualquier contenido leído del navegador en un progreso válido.
 *
 * - `nivelesCompletados`: solo identificadores del registro histórico, sin
 *   duplicados y con un máximo de `MAXIMO_NIVELES_GUARDADOS`.
 * - `ultimosOrdenes`: solo niveles del catálogo actual con una permutación
 *   exacta de sus pasos o fichas.
 *
 * Lo que no se reconoce se descarta en lugar de bloquear el juego.
 */
export function sanearProgreso(valor: unknown): DatosProgreso {
  if (!esObjeto(valor)) {
    return crearDatosIniciales();
  }

  const nivelesCompletados = Array.isArray(valor.nivelesCompletados)
    ? [
        ...new Set(
          valor.nivelesCompletados.filter(
            (identificador): identificador is string =>
              esIdentificadorHistorico(identificador),
          ),
        ),
      ].slice(0, MAXIMO_NIVELES_GUARDADOS)
    : [];
  const ultimosOrdenes: Record<string, string[]> = {};

  if (esObjeto(valor.ultimosOrdenes)) {
    for (const [identificadorNivel, orden] of Object.entries(
      valor.ultimosOrdenes,
    )) {
      const nivel = nivelesDisponibles.find(
        (candidato) => candidato.identificador === identificadorNivel,
      );

      if (nivel && esPermutacionDelNivel(nivel, orden)) {
        ultimosOrdenes[identificadorNivel] = [...orden];
      }
    }
  }

  return { nivelesCompletados, ultimosOrdenes };
}

/** Comprueba si el navegador permite escribir y borrar en `localStorage`. */
export function comprobarAlmacenamiento(): boolean {
  try {
    window.localStorage.setItem(CLAVE_COMPROBACION, "1");
    window.localStorage.removeItem(CLAVE_COMPROBACION);
    return true;
  } catch {
    return false;
  }
}

function marcarAlmacenamientoNoDisponible(): void {
  // Evita un ciclo: el cambio de estado vuelve a intentar guardar, pero en
  // ese segundo intento la bandera ya es falsa.
  if (useProgresoJuego.getState().almacenamientoDisponible) {
    useProgresoJuego.setState({ almacenamientoDisponible: false });
  }
}

/**
 * Almacenamiento que nunca lanza errores: si `localStorage` no existe, está
 * bloqueado o contiene JSON corrupto, el juego arranca con progreso inicial y
 * sigue funcionando en memoria.
 */
const almacenamientoSeguro: PersistStorage<DatosProgreso> = {
  getItem: (nombre) => {
    try {
      const texto = window.localStorage.getItem(nombre);

      if (!texto) {
        return null;
      }

      const contenido: unknown = JSON.parse(texto);

      return esObjeto(contenido)
        ? (contenido as StorageValue<DatosProgreso>)
        : null;
    } catch {
      return null;
    }
  },
  setItem: (nombre, valor) => {
    try {
      window.localStorage.setItem(nombre, JSON.stringify(valor));
    } catch {
      marcarAlmacenamientoNoDisponible();
    }
  },
  removeItem: (nombre) => {
    try {
      window.localStorage.removeItem(nombre);
    } catch {
      // Nada que limpiar.
    }
  },
};

export const useProgresoJuego = create<EstadoProgreso>()(
  persist(
    (set, get) => ({
      ...crearDatosIniciales(),
      hidratado: false,
      almacenamientoDisponible: true,

      marcarNivelCompletado: (identificadorNivel) => {
        const { nivelesCompletados } = get();

        if (
          nivelesCompletados.includes(identificadorNivel) ||
          !esIdentificadorHistorico(identificadorNivel) ||
          nivelesCompletados.length >= MAXIMO_NIVELES_GUARDADOS
        ) {
          return;
        }

        set({
          nivelesCompletados: [...nivelesCompletados, identificadorNivel],
        });
      },

      registrarOrdenInicial: (identificadorNivel, orden) => {
        set({
          ultimosOrdenes: {
            ...get().ultimosOrdenes,
            [identificadorNivel]: [...orden],
          },
        });
      },
    }),
    {
      name: CLAVE_PROGRESO,
      version: VERSION_PROGRESO,
      storage: almacenamientoSeguro,
      // Se hidrata manualmente después del montaje para que el HTML estático
      // y el primer render del cliente coincidan.
      skipHydration: true,
      partialize: ({ nivelesCompletados, ultimosOrdenes }) => ({
        nivelesCompletados,
        ultimosOrdenes,
      }),
      // Una versión desconocida no se intenta interpretar: se reinicia.
      // Si algún día existe la versión 2, aquí deberá transformarse la 1.
      migrate: () => crearDatosIniciales(),
      merge: (guardado, actual) => ({
        ...actual,
        ...sanearProgreso(guardado),
      }),
      onRehydrateStorage: () => () => {
        useProgresoJuego.setState({
          hidratado: true,
          almacenamientoDisponible: comprobarAlmacenamiento(),
        });
      },
    },
  ),
);
