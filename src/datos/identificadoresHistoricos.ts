/**
 * Registro cerrado de todos los identificadores de nivel publicados alguna vez.
 *
 * Reglas:
 * - Solo crece: nunca se elimina ni se cambia una entrada.
 * - Un identificador publicado jamás se reutiliza para otro nivel.
 * - El progreso guardado solo conserva identificadores de esta lista.
 *
 * Así, un identificador inventado nunca puede coincidir en el futuro con un
 * nivel real, y retirar un nivel del catálogo no borra su progreso.
 */
export const identificadoresHistoricos = [
  // Mundo 1 · Primeros algoritmos
  "preparar-cafe",
  "sembrar-semilla",
  "preparar-paleta",
  "lavar-ropa",
  "lavar-manos",
  // Mundo 2 · Decisiones
  "salir-lluvia",
  "cruzar-calle",
  "cargar-celular",
  "cuidar-planta",
  "prepararse-salir",
] as const;

const conjuntoHistorico: ReadonlySet<string> = new Set(
  identificadoresHistoricos,
);

export function esIdentificadorHistorico(identificador: unknown): boolean {
  return (
    typeof identificador === "string" && conjuntoHistorico.has(identificador)
  );
}
