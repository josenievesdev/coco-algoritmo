"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { nivelesDisponibles } from "@/datos/juegosDisponibles";

export const CLAVE_PROGRESO = "coco-algoritmo-progreso-v1";
export const VERSION_PROGRESO = 1;

/** Lo único que se guarda en el navegador. */
interface DatosProgreso {
  nivelesCompletados: string[];
  ultimosOrdenes: Record<string, string[]>;
}

interface EstadoProgreso extends DatosProgreso {
  hidratado: boolean;
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

function esOrdenValido(
  identificadorNivel: string,
  orden: unknown,
): orden is string[] {
  const nivel = nivelesDisponibles.find(
    (candidato) => candidato.identificador === identificadorNivel,
  );

  if (!nivel || !Array.isArray(orden)) {
    return false;
  }

  const pasos = nivel.pasos.map((paso) => paso.identificador);

  return (
    orden.length === pasos.length &&
    new Set(orden).size === pasos.length &&
    orden.every((paso) => typeof paso === "string" && pasos.includes(paso))
  );
}

/**
 * Convierte cualquier contenido leído del navegador en un progreso válido.
 * Lo que no se reconoce se descarta en lugar de bloquear el juego.
 */
function sanearProgreso(valor: unknown): DatosProgreso {
  if (!esObjeto(valor)) {
    return crearDatosIniciales();
  }

  const identificadoresValidos = new Set(
    nivelesDisponibles.map((nivel) => nivel.identificador),
  );
  const nivelesCompletados = Array.isArray(valor.nivelesCompletados)
    ? [
        ...new Set(
          valor.nivelesCompletados.filter(
            (identificador): identificador is string =>
              typeof identificador === "string" &&
              identificadoresValidos.has(identificador),
          ),
        ),
      ]
    : [];
  const ultimosOrdenes: Record<string, string[]> = {};

  if (esObjeto(valor.ultimosOrdenes)) {
    for (const [identificadorNivel, orden] of Object.entries(
      valor.ultimosOrdenes,
    )) {
      if (esOrdenValido(identificadorNivel, orden)) {
        ultimosOrdenes[identificadorNivel] = [...orden];
      }
    }
  }

  return { nivelesCompletados, ultimosOrdenes };
}

/**
 * Almacenamiento que nunca lanza errores: si `localStorage` no existe, está
 * bloqueado o contiene JSON corrupto, el juego arranca con progreso inicial.
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
      // Sin almacenamiento disponible el juego sigue funcionando en memoria.
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

      marcarNivelCompletado: (identificadorNivel) => {
        const { nivelesCompletados } = get();

        if (nivelesCompletados.includes(identificadorNivel)) {
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
      migrate: () => crearDatosIniciales(),
      merge: (guardado, actual) => ({
        ...actual,
        ...sanearProgreso(guardado),
      }),
      onRehydrateStorage: () => () => {
        useProgresoJuego.setState({ hidratado: true });
      },
    },
  ),
);
