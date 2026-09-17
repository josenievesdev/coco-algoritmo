import type {
  ColocacionDecision,
  EspacioDecision,
  NivelDecision,
  ProgramaDecision,
  SolucionDecision,
  ZonaDecision,
} from "@/tipos/juego";

export const ordenZonas: readonly ZonaDecision[] = [
  "antes",
  "condicion",
  "entonces",
  "siNo",
  "despues",
];

export const nombresZona: Record<ZonaDecision, string> = {
  antes: "ANTES",
  condicion: "SI",
  entonces: "ENTONCES",
  siNo: "SI NO",
  despues: "DESPUÉS",
};

export function obtenerEspaciosDeZona(
  nivel: NivelDecision,
  zona: ZonaDecision,
): EspacioDecision[] {
  return nivel.espacios
    .filter((espacio) => espacio.zona === zona)
    .sort((espacioA, espacioB) => espacioA.orden - espacioB.orden);
}

/** Espacios del nivel en orden de lectura: por zona y por posición. */
export function obtenerEspaciosOrdenados(
  nivel: NivelDecision,
): EspacioDecision[] {
  return ordenZonas.flatMap((zona) => obtenerEspaciosDeZona(nivel, zona));
}

export function tieneZona(nivel: NivelDecision, zona: ZonaDecision): boolean {
  return nivel.espacios.some((espacio) => espacio.zona === zona);
}

export function crearColocacionVacia(
  nivel: NivelDecision,
): Record<string, string | null> {
  return Object.fromEntries(
    nivel.espacios.map((espacio) => [espacio.identificador, null]),
  );
}

/** Convierte la colocación del tablero en un programa ordenado por zonas. */
export function construirPrograma(
  nivel: NivelDecision,
  colocacion: ColocacionDecision,
): ProgramaDecision {
  const fichasDeZona = (zona: ZonaDecision) =>
    obtenerEspaciosDeZona(nivel, zona).map(
      (espacio) => colocacion[espacio.identificador] ?? null,
    );

  return {
    antes: fichasDeZona("antes"),
    condicion: fichasDeZona("condicion")[0] ?? null,
    entonces: fichasDeZona("entonces"),
    siNo: tieneZona(nivel, "siNo") ? fichasDeZona("siNo") : null,
    despues: fichasDeZona("despues"),
  };
}

/** Colocación que representa una solución; útil para pruebas y pistas. */
export function construirColocacionDesdeSolucion(
  nivel: NivelDecision,
  solucion: SolucionDecision,
): Record<string, string | null> {
  const colocacion = crearColocacionVacia(nivel);
  const asignar = (zona: ZonaDecision, fichas: readonly string[]) => {
    obtenerEspaciosDeZona(nivel, zona).forEach((espacio, indice) => {
      colocacion[espacio.identificador] = fichas[indice] ?? null;
    });
  };

  asignar("antes", solucion.antes);
  asignar("condicion", [solucion.condicion]);
  asignar("entonces", solucion.entonces);
  asignar("siNo", solucion.siNo ?? []);
  asignar("despues", solucion.despues);

  return colocacion;
}

/** Fichas esperadas en cada zona según una solución. */
export function obtenerFichasDeSolucion(
  solucion: SolucionDecision,
  zona: ZonaDecision,
): readonly string[] {
  switch (zona) {
    case "antes":
      return solucion.antes;
    case "condicion":
      return [solucion.condicion];
    case "entonces":
      return solucion.entonces;
    case "siNo":
      return solucion.siNo ?? [];
    case "despues":
      return solucion.despues;
  }
}
