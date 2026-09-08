import { validarSecuencia } from "@/motor/validarSecuencia";
import type { EvaluacionSecuencia } from "@/tipos/juego";

export function evaluarProgresoSecuencia(
  secuenciaActual: readonly string[],
  solucionCorrecta: readonly string[],
): EvaluacionSecuencia {
  const posicionesCorrectas = solucionCorrecta.map(
    (bloque, indice) => secuenciaActual[indice] === bloque,
  );
  const cantidadEnPosicionCorrecta = posicionesCorrectas.filter(Boolean).length;
  let pasosConsecutivosCorrectos = 0;

  while (posicionesCorrectas[pasosConsecutivosCorrectos]) {
    pasosConsecutivosCorrectos += 1;
  }

  const estaCompleta = validarSecuencia(secuenciaActual, solucionCorrecta);
  const porcentajeProgreso = solucionCorrecta.length
    ? Math.round(
        (pasosConsecutivosCorrectos / solucionCorrecta.length) * 100,
      )
    : 100;

  return {
    estado: estaCompleta
      ? "completa"
      : pasosConsecutivosCorrectos > 0
        ? "parcial"
        : "incorrecta",
    posicionesCorrectas,
    cantidadEnPosicionCorrecta,
    pasosConsecutivosCorrectos,
    porcentajeProgreso,
  };
}
