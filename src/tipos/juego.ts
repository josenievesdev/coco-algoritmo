export type ResultadoJuego = "jugando" | "exito" | "error";

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
