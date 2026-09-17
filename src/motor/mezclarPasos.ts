export function sonSecuenciasIguales(
  secuenciaA: readonly string[],
  secuenciaB?: readonly string[],
): boolean {
  if (!secuenciaB || secuenciaA.length !== secuenciaB.length) {
    return false;
  }

  return secuenciaA.every((elemento, indice) => elemento === secuenciaB[indice]);
}

export function rotarSecuencia(
  secuencia: readonly string[],
  desplazamiento: number,
): string[] {
  if (secuencia.length === 0) {
    return [];
  }

  const inicio =
    ((desplazamiento % secuencia.length) + secuencia.length) %
    secuencia.length;

  return [...secuencia.slice(inicio), ...secuencia.slice(0, inicio)];
}

function barajarFisherYates(
  secuencia: readonly string[],
  aleatorio: () => number,
): string[] {
  const resultado = [...secuencia];

  for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
    const indiceAleatorio = Math.min(
      indice,
      Math.floor(aleatorio() * (indice + 1)),
    );
    [resultado[indice], resultado[indiceAleatorio]] = [
      resultado[indiceAleatorio],
      resultado[indice],
    ];
  }

  return resultado;
}

/**
 * Devuelve un orden inicial para los pasos de un nivel que nunca coincide con
 * la solución ni con el último orden inicial usado en ese nivel.
 *
 * Primero intenta con Fisher–Yates. Si tras varios intentos no encuentra un
 * orden válido, recorre las rotaciones de la solución: con tres o más pasos
 * siempre existe al menos una rotación distinta de ambas secuencias.
 */
export function mezclarPasos(
  solucion: readonly string[],
  ordenAnterior?: readonly string[],
  aleatorio: () => number = Math.random,
  intentosMaximos = 24,
): string[] {
  if (solucion.length < 2) {
    return [...solucion];
  }

  const esValido = (candidato: readonly string[]) =>
    !sonSecuenciasIguales(candidato, solucion) &&
    !sonSecuenciasIguales(candidato, ordenAnterior);

  for (let intento = 0; intento < intentosMaximos; intento += 1) {
    const candidato = barajarFisherYates(solucion, aleatorio);

    if (esValido(candidato)) {
      return candidato;
    }
  }

  for (
    let desplazamiento = 1;
    desplazamiento < solucion.length;
    desplazamiento += 1
  ) {
    const candidato = rotarSecuencia(solucion, desplazamiento);

    if (esValido(candidato)) {
      return candidato;
    }
  }

  // Solo ocurre con dos pasos: la única alternativa a la solución.
  return rotarSecuencia(solucion, 1);
}
