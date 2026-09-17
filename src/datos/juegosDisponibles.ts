import { nivelCafe } from "@/juegos/cafe";
import { nivelLavadora } from "@/juegos/lavadora";
import { nivelManos } from "@/juegos/manos";
import { nivelPaleta } from "@/juegos/paleta";
import { nivelSemilla } from "@/juegos/semilla";
import type {
  EstadoNivel,
  IdentificadorMundo,
  Mundo,
  Nivel,
} from "@/tipos/juego";

export const mundosDisponibles: Mundo[] = [
  {
    identificador: "primeros-algoritmos",
    numero: 1,
    titulo: "Primeros algoritmos",
    concepto: "Secuencias",
    descripcion: "Ordena pasos cotidianos y crea tus primeras secuencias.",
    estado: "disponible",
    icono: "secuencia",
    tema: { color: "#f7c948", sombra: "#b99732" },
  },
  {
    identificador: "decisiones",
    numero: 2,
    titulo: "Decisiones",
    concepto: "Condicionales",
    descripcion: "Elige qué hacer según lo que ocurra.",
    estado: "proximamente",
    icono: "decision",
    tema: { color: "#8be0bf", sombra: "#4d9a82" },
  },
  {
    identificador: "repeticiones",
    numero: 3,
    titulo: "Repeticiones",
    concepto: "Ciclos",
    descripcion: "Repite acciones hasta completar el reto.",
    estado: "proximamente",
    icono: "repeticion",
    tema: { color: "#ff725e", sombra: "#b64b42" },
  },
];

/** Todos los niveles jugables, agrupados por mundo y en orden de desbloqueo. */
export const nivelesDisponibles: Nivel[] = [
  nivelCafe,
  nivelSemilla,
  nivelPaleta,
  nivelLavadora,
  nivelManos,
];

export function obtenerMundo(
  identificador: IdentificadorMundo,
): Mundo | undefined {
  return mundosDisponibles.find(
    (mundo) => mundo.identificador === identificador,
  );
}

export function obtenerNivel(identificador: string): Nivel | undefined {
  return nivelesDisponibles.find(
    (nivel) => nivel.identificador === identificador,
  );
}

export function obtenerNivelesDeMundo(
  identificadorMundo: IdentificadorMundo,
): Nivel[] {
  return nivelesDisponibles
    .filter((nivel) => nivel.identificadorMundo === identificadorMundo)
    .sort((nivelA, nivelB) => nivelA.numero - nivelB.numero);
}

export function obtenerNivelSiguiente(nivel: Nivel): Nivel | undefined {
  const niveles = obtenerNivelesDeMundo(nivel.identificadorMundo);
  const indice = niveles.findIndex(
    (candidato) => candidato.identificador === nivel.identificador,
  );

  return indice === -1 ? undefined : niveles[indice + 1];
}

/**
 * El desbloqueo se deriva de los niveles completados: el primer nivel de cada
 * mundo está abierto y cada nivel siguiente se abre al superar el anterior.
 */
export function obtenerEstadoNivel(
  nivel: Nivel,
  nivelesCompletados: readonly string[],
): EstadoNivel {
  if (nivelesCompletados.includes(nivel.identificador)) {
    return "completado";
  }

  const niveles = obtenerNivelesDeMundo(nivel.identificadorMundo);
  const indice = niveles.findIndex(
    (candidato) => candidato.identificador === nivel.identificador,
  );
  const nivelAnterior = indice > 0 ? niveles[indice - 1] : undefined;

  if (
    indice === 0 ||
    (nivelAnterior &&
      nivelesCompletados.includes(nivelAnterior.identificador))
  ) {
    return "disponible";
  }

  return "bloqueado";
}

export function contarNivelesCompletados(
  identificadorMundo: IdentificadorMundo,
  nivelesCompletados: readonly string[],
): number {
  return obtenerNivelesDeMundo(identificadorMundo).filter((nivel) =>
    nivelesCompletados.includes(nivel.identificador),
  ).length;
}
