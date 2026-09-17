import {
  construirPrograma,
  obtenerEspaciosDeZona,
  obtenerEspaciosOrdenados,
  obtenerFichasDeSolucion,
  ordenZonas,
  tieneZona,
} from "@/motor/programaDecision";
import type {
  ColocacionDecision,
  ErrorDecision,
  NivelDecision,
  ProgramaDecision,
  ResultadoValidacionDecision,
  SolucionDecision,
  TipoErrorDecision,
  ZonaDecision,
} from "@/tipos/juego";

function sonListasIguales(
  listaA: readonly (string | null)[] | null,
  listaB: readonly (string | null)[] | null,
): boolean {
  if (listaA === null || listaB === null) {
    return listaA === listaB;
  }

  return (
    listaA.length === listaB.length &&
    listaA.every((elemento, indice) => elemento === listaB[indice])
  );
}

function coincideConSolucion(
  programa: ProgramaDecision,
  solucion: SolucionDecision,
): boolean {
  return (
    programa.condicion === solucion.condicion &&
    sonListasIguales(programa.antes, solucion.antes) &&
    sonListasIguales(programa.entonces, solucion.entonces) &&
    sonListasIguales(programa.siNo, solucion.siNo) &&
    sonListasIguales(programa.despues, solucion.despues)
  );
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function clasificarFicha(
  nivel: NivelDecision,
  solucion: SolucionDecision,
  zona: ZonaDecision,
  identificadorFicha: string,
): TipoErrorDecision {
  const ficha = nivel.fichas.find(
    (candidata) => candidata.identificador === identificadorFicha,
  );
  const esCondicionEnRama = zona !== "condicion" && ficha?.tipo === "condicion";
  const esAccionEnSi = zona === "condicion" && ficha?.tipo === "accion";

  if (esCondicionEnRama || esAccionEnSi) {
    return "tipo-incorrecto";
  }

  const zonaEsperada = ordenZonas.find((candidata) =>
    obtenerFichasDeSolucion(solucion, candidata).includes(identificadorFicha),
  );

  if (!zonaEsperada) {
    return "distractor";
  }

  return zonaEsperada === zona ? "orden-incorrecto" : "ficha-fuera-de-lugar";
}

function buscarErrores(
  nivel: NivelDecision,
  colocacion: ColocacionDecision,
  solucion: SolucionDecision,
): ErrorDecision[] {
  const errores: ErrorDecision[] = [];
  const programa = construirPrograma(nivel, colocacion);
  const ramasIntercambiadas =
    tieneZona(nivel, "siNo") &&
    solucion.siNo !== null &&
    !sonListasIguales(solucion.entonces, solucion.siNo) &&
    sonListasIguales(programa.entonces, solucion.siNo) &&
    sonListasIguales(programa.siNo, solucion.entonces);

  for (const zona of ordenZonas) {
    const espacios = obtenerEspaciosDeZona(nivel, zona);

    if (espacios.length === 0) {
      continue;
    }

    if (ramasIntercambiadas && (zona === "entonces" || zona === "siNo")) {
      errores.push({
        zona,
        tipo: "ramas-intercambiadas",
        espacios: espacios.map((espacio) => espacio.identificador),
      });
      continue;
    }

    const esperadas = obtenerFichasDeSolucion(solucion, zona);
    const erroresZona = new Map<TipoErrorDecision, string[]>();

    espacios.forEach((espacio, indice) => {
      const colocada = colocacion[espacio.identificador];

      if (!colocada || colocada === esperadas[indice]) {
        return;
      }

      const tipo = clasificarFicha(nivel, solucion, zona, colocada);
      erroresZona.set(tipo, [
        ...(erroresZona.get(tipo) ?? []),
        espacio.identificador,
      ]);
    });

    for (const [tipo, espaciosConError] of erroresZona) {
      errores.push({ zona, tipo, espacios: espaciosConError });
    }
  }

  return errores;
}

/**
 * Valida una colocación de forma pura. Orden de comprobación:
 * 1. `invalida`: estructura, espacios o fichas imposibles.
 * 2. `incompleta`: falta algún espacio; nunca se informa un error.
 * 3. `correcta`: coincide con alguna solución aceptada.
 * 4. `incorrecta`: errores clasificados por zona, en orden de lectura.
 */
export function validarDecision(
  nivel: NivelDecision,
  colocacion: unknown,
): ResultadoValidacionDecision {
  if (!esObjeto(colocacion)) {
    return { estado: "invalida", motivo: "estructura-invalida" };
  }

  const espaciosPorIdentificador = new Map(
    nivel.espacios.map((espacio) => [espacio.identificador, espacio]),
  );
  const fichasPorIdentificador = new Map(
    nivel.fichas.map((ficha) => [ficha.identificador, ficha]),
  );
  const fichasUsadas = new Set<string>();

  for (const [identificadorEspacio, valor] of Object.entries(colocacion)) {
    if (valor !== null && typeof valor !== "string") {
      return { estado: "invalida", motivo: "estructura-invalida" };
    }

    const espacio = espaciosPorIdentificador.get(identificadorEspacio);

    if (!espacio) {
      return { estado: "invalida", motivo: "espacio-desconocido" };
    }

    if (valor === null) {
      continue;
    }

    const ficha = fichasPorIdentificador.get(valor);

    if (!ficha) {
      return { estado: "invalida", motivo: "ficha-desconocida" };
    }

    if (fichasUsadas.has(valor)) {
      return { estado: "invalida", motivo: "ficha-duplicada" };
    }

    fichasUsadas.add(valor);

    if (espacio.acepta !== "cualquiera" && espacio.acepta !== ficha.tipo) {
      return { estado: "invalida", motivo: "tipo-no-aceptado" };
    }
  }

  const colocacionValida = colocacion as ColocacionDecision;
  const espaciosVacios = obtenerEspaciosOrdenados(nivel)
    .filter((espacio) => !colocacionValida[espacio.identificador])
    .map((espacio) => espacio.identificador);

  if (espaciosVacios.length > 0) {
    return { estado: "incompleta", espaciosVacios };
  }

  const programa = construirPrograma(nivel, colocacionValida);
  const indiceSolucion = nivel.soluciones.findIndex((solucion) =>
    coincideConSolucion(programa, solucion),
  );

  if (indiceSolucion !== -1) {
    return { estado: "correcta", indiceSolucion };
  }

  const errores = buscarErrores(nivel, colocacionValida, nivel.soluciones[0]);
  const [primerError, ...restoErrores] = errores;

  if (!primerError) {
    // Salvaguarda: una colocación completa y distinta siempre tiene errores.
    const primerEspacio = obtenerEspaciosOrdenados(nivel)[0];

    return {
      estado: "incorrecta",
      errores: [
        {
          zona: primerEspacio.zona,
          tipo: "ficha-fuera-de-lugar",
          espacios: [primerEspacio.identificador],
        },
      ],
    };
  }

  return { estado: "incorrecta", errores: [primerError, ...restoErrores] };
}

/** Zona que debe señalar la pista: la primera con error en orden de lectura. */
export function obtenerZonaPista(
  resultado: ResultadoValidacionDecision,
): ZonaDecision | null {
  return resultado.estado === "incorrecta" ? resultado.errores[0].zona : null;
}
