export function validarSecuencia(
  secuenciaActual: readonly string[],
  solucionCorrecta: readonly string[],
): boolean {
  if (secuenciaActual.length !== solucionCorrecta.length) {
    return false;
  }

  return secuenciaActual.every(
    (bloque, indice) => bloque === solucionCorrecta[indice],
  );
}
