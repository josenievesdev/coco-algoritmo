export type ResultadoJuego =
  | "jugando"
  | "encaje"
  | "progreso"
  | "exito"
  | "error";

export type EstadoProgresoSecuencia = "completa" | "parcial" | "incorrecta";

export interface EvaluacionSecuencia {
  estado: EstadoProgresoSecuencia;
  posicionesCorrectas: boolean[];
  cantidadEnPosicionCorrecta: number;
  pasosConsecutivosCorrectos: number;
  porcentajeProgreso: number;
}

export interface Juego {
  identificador: string;
  nombre: string;
  descripcion: string;
  instruccion: string;
  bloques: string[];
  solucion: string[];
  secuenciaInicial?: string[];
}

export interface EstadoJuego {
  juegoActual: Juego;
  secuenciaActual: string[];
  resultado: ResultadoJuego;
  intentos: number;
}
