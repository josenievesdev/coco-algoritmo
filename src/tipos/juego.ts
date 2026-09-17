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

export type IdentificadorMundo =
  | "primeros-algoritmos"
  | "decisiones"
  | "repeticiones";

export type EstadoMundo = "disponible" | "proximamente";

export type EstadoNivel = "completado" | "disponible" | "bloqueado";

export type TipoAnimacionNivel =
  | "cafe"
  | "semilla"
  | "paleta"
  | "lavadora"
  | "manos";

export type TipoIcono =
  | "taza"
  | "brote"
  | "paleta"
  | "lavadora"
  | "manos"
  | "secuencia"
  | "decision"
  | "repeticion"
  | "candado";

export interface TemaVisual {
  color: string;
  sombra: string;
}

export interface PasoNivel {
  identificador: string;
  texto: string;
}

export interface MensajesNivel {
  pendiente: string;
  completa: string;
  error: string;
  celebracion: string;
}

export interface Nivel {
  identificador: string;
  identificadorMundo: IdentificadorMundo;
  numero: number;
  titulo: string;
  descripcion: string;
  instruccion: string;
  /** Pasos en el orden correcto: este orden es la solución del nivel. */
  pasos: PasoNivel[];
  icono: TipoIcono;
  tema: TemaVisual;
  tipoAnimacion: TipoAnimacionNivel;
  mensajes: MensajesNivel;
}

export interface Mundo {
  identificador: IdentificadorMundo;
  numero: number;
  titulo: string;
  concepto: string;
  descripcion: string;
  estado: EstadoMundo;
  icono: TipoIcono;
  tema: TemaVisual;
}

export interface EstadoJuego {
  nivelActual: Nivel;
  /** Identificadores de los pasos en el orden que tiene el tablero. */
  secuenciaActual: string[];
  resultado: ResultadoJuego;
  intentos: number;
}
