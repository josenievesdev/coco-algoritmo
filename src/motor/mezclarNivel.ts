import { mezclarPasos } from "@/motor/mezclarPasos";
import type { Nivel } from "@/tipos/juego";

/**
 * Orden canónico de los elementos que se mezclan al empezar un nivel:
 * - Secuencia: los pasos en el orden correcto (su solución).
 * - Decisión: las fichas de la bandeja, con la solución primero.
 */
export function obtenerOrdenCanonico(nivel: Nivel): string[] {
  return nivel.tipo === "secuencia"
    ? nivel.pasos.map((paso) => paso.identificador)
    : nivel.fichas.map((ficha) => ficha.identificador);
}

/** Comprueba que un orden guardado es una permutación exacta del nivel. */
export function esPermutacionDelNivel(
  nivel: Nivel,
  orden: unknown,
): orden is string[] {
  if (!Array.isArray(orden)) {
    return false;
  }

  const canonico = obtenerOrdenCanonico(nivel);

  return (
    orden.length === canonico.length &&
    orden.every((elemento) => typeof elemento === "string") &&
    new Set(orden).size === canonico.length &&
    orden.every((elemento) => canonico.includes(elemento))
  );
}

/**
 * Adaptador de `mezclarPasos` para cualquier tipo de nivel. Nunca devuelve el
 * orden canónico ni el último orden inicial usado en ese nivel.
 */
export function mezclarOrdenInicial(
  nivel: Nivel,
  ordenAnterior?: readonly string[],
  aleatorio: () => number = Math.random,
): string[] {
  const anteriorValido = esPermutacionDelNivel(nivel, ordenAnterior)
    ? ordenAnterior
    : undefined;

  return mezclarPasos(obtenerOrdenCanonico(nivel), anteriorValido, aleatorio);
}
