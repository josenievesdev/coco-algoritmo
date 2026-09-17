import { nivelCafe } from "@/juegos/cafe";
import { nivelCargarCelular } from "@/juegos/cargarCelular";
import { nivelCruzarCalle } from "@/juegos/cruzarCalle";
import { nivelCuidarPlanta } from "@/juegos/cuidarPlanta";
import { nivelLavadora } from "@/juegos/lavadora";
import { nivelManos } from "@/juegos/manos";
import { nivelPaleta } from "@/juegos/paleta";
import { nivelPrepararseSalir } from "@/juegos/prepararseSalir";
import { nivelSalirLluvia } from "@/juegos/salirLluvia";
import { nivelSemilla } from "@/juegos/semilla";
import type {
  EstadoMundoCalculado,
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
    requisito: null,
    mensajes: {
      completado: "Ya sabes convertir tareas cotidianas en secuencias.",
      siguiente: "¡Se abrió el mundo Decisiones!",
    },
    icono: "secuencia",
    tema: { color: "#f7c948", sombra: "#b99732" },
  },
  {
    identificador: "decisiones",
    numero: 2,
    titulo: "Decisiones",
    concepto: "Condicionales",
    descripcion: "Elige qué hacer según lo que ocurra.",
    estado: "disponible",
    requisito: {
      tipo: "niveles-completados",
      niveles: [
        "preparar-cafe",
        "sembrar-semilla",
        "preparar-paleta",
        "lavar-ropa",
        "lavar-manos",
      ],
    },
    mensajes: {
      completado: "Ya sabes elegir qué hacer según lo que ocurra.",
      siguiente: "El mundo Repeticiones está en construcción. ¡Muy pronto!",
    },
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
    requisito: {
      tipo: "niveles-completados",
      niveles: [
        "salir-lluvia",
        "cruzar-calle",
        "cargar-celular",
        "cuidar-planta",
        "prepararse-salir",
      ],
    },
    mensajes: { completado: "", siguiente: null },
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
  nivelSalirLluvia,
  nivelCruzarCalle,
  nivelCargarCelular,
  nivelCuidarPlanta,
  nivelPrepararseSalir,
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

export function obtenerMundoSiguiente(mundo: Mundo): Mundo | undefined {
  return mundosDisponibles.find(
    (candidato) => candidato.numero === mundo.numero + 1,
  );
}

/** Un nivel cuenta como superado solo si existe en el catálogo actual. */
function estaCompletadoEnCatalogo(
  identificador: string,
  nivelesCompletados: readonly string[],
): boolean {
  return (
    nivelesCompletados.includes(identificador) &&
    nivelesDisponibles.some((nivel) => nivel.identificador === identificador)
  );
}

/**
 * El estado de un mundo se deriva del catálogo y de los niveles completados.
 * Nada de esto se guarda, así que no requiere migraciones.
 */
export function obtenerEstadoMundo(
  mundo: Mundo,
  nivelesCompletados: readonly string[],
): EstadoMundoCalculado {
  if (mundo.estado === "proximamente") {
    return "proximamente";
  }

  if (
    mundo.requisito &&
    !mundo.requisito.niveles.every((identificador) =>
      estaCompletadoEnCatalogo(identificador, nivelesCompletados),
    )
  ) {
    return "bloqueado";
  }

  const niveles = obtenerNivelesDeMundo(mundo.identificador);

  if (
    niveles.length > 0 &&
    niveles.every((nivel) =>
      nivelesCompletados.includes(nivel.identificador),
    )
  ) {
    return "completado";
  }

  return "disponible";
}

/**
 * El desbloqueo se deriva de los niveles completados: si el mundo está abierto,
 * su primer nivel también lo está y cada nivel siguiente se abre al superar el
 * anterior.
 */
export function obtenerEstadoNivel(
  nivel: Nivel,
  nivelesCompletados: readonly string[],
): EstadoNivel {
  const mundo = obtenerMundo(nivel.identificadorMundo);
  const estadoMundo = mundo
    ? obtenerEstadoMundo(mundo, nivelesCompletados)
    : "proximamente";

  if (estadoMundo === "proximamente" || estadoMundo === "bloqueado") {
    return "bloqueado";
  }

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
