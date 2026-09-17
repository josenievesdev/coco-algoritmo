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

export type EstadoMundoCalculado =
  | "proximamente"
  | "bloqueado"
  | "disponible"
  | "completado";

export type TipoNivel = "secuencia" | "decision";

export type TipoAnimacionNivel =
  | "cafe"
  | "semilla"
  | "paleta"
  | "lavadora"
  | "manos"
  | "lluvia"
  | "semaforo"
  | "celular"
  | "planta"
  | "salir";

export type TipoIcono =
  | "taza"
  | "brote"
  | "paleta"
  | "lavadora"
  | "manos"
  | "paraguas"
  | "semaforo"
  | "bateria"
  | "regadera"
  | "termometro"
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

interface NivelBase {
  identificador: string;
  identificadorMundo: IdentificadorMundo;
  numero: number;
  titulo: string;
  descripcion: string;
  instruccion: string;
  icono: TipoIcono;
  tema: TemaVisual;
  tipoAnimacion: TipoAnimacionNivel;
  mensajes: MensajesNivel;
}

export interface NivelSecuencia extends NivelBase {
  tipo: "secuencia";
  /** Pasos en el orden correcto: este orden es la solución del nivel. */
  pasos: PasoNivel[];
}

export type TipoFicha = "condicion" | "accion";

export interface FichaDecision {
  identificador: string;
  texto: string;
  tipo: TipoFicha;
}

export type ZonaDecision =
  | "antes"
  | "condicion"
  | "entonces"
  | "siNo"
  | "despues";

export type AceptacionEspacio = TipoFicha | "cualquiera";

export interface EspacioDecision {
  identificador: string;
  zona: ZonaDecision;
  /** Posición dentro de la zona. */
  orden: number;
  /** Niveles guiados: un tipo de ficha. Niveles libres: "cualquiera". */
  acepta: AceptacionEspacio;
}

/** Colocación del tablero: espacio → ficha o vacío. */
export type ColocacionDecision = Readonly<Record<string, string | null>>;

/**
 * Programa derivado de una colocación. Es la base de la validación y, en el
 * futuro, de las representaciones en pseudocódigo y código.
 */
export interface ProgramaDecision {
  antes: readonly (string | null)[];
  condicion: string | null;
  entonces: readonly (string | null)[];
  /** `null` cuando el nivel no tiene rama SI NO. */
  siNo: readonly (string | null)[] | null;
  despues: readonly (string | null)[];
}

export interface SolucionDecision {
  antes: readonly string[];
  condicion: string;
  entonces: readonly string[];
  siNo: readonly string[] | null;
  despues: readonly string[];
}

export interface EscenarioSimulacion {
  identificador: string;
  texto: string;
  condicionCumplida: boolean;
}

export interface NivelDecision extends NivelBase {
  tipo: "decision";
  situacion: string;
  objetivo: string;
  espacios: readonly EspacioDecision[];
  /** Orden canónico: primero la solución y después los distractores. */
  fichas: readonly FichaDecision[];
  soluciones: readonly [SolucionDecision, ...SolucionDecision[]];
  escenarios: readonly [EscenarioSimulacion, EscenarioSimulacion];
}

export type Nivel = NivelSecuencia | NivelDecision;

export type TipoErrorDecision =
  | "ramas-intercambiadas"
  | "orden-incorrecto"
  | "tipo-incorrecto"
  | "distractor"
  | "ficha-fuera-de-lugar";

export interface ErrorDecision {
  zona: ZonaDecision;
  tipo: TipoErrorDecision;
  espacios: readonly string[];
}

export type MotivoColocacionInvalida =
  | "estructura-invalida"
  | "espacio-desconocido"
  | "ficha-desconocida"
  | "ficha-duplicada"
  | "tipo-no-aceptado";

export type ResultadoValidacionDecision =
  | { estado: "incompleta"; espaciosVacios: readonly string[] }
  | { estado: "correcta"; indiceSolucion: number }
  | {
      estado: "incorrecta";
      errores: readonly [ErrorDecision, ...ErrorDecision[]];
    }
  | { estado: "invalida"; motivo: MotivoColocacionInvalida };

export interface RequisitoMundo {
  tipo: "niveles-completados";
  /** Lista explícita: añadir niveles al mundo previo no vuelve a bloquear. */
  niveles: readonly string[];
}

export interface MensajesMundo {
  completado: string;
  siguiente: string | null;
}

export interface Mundo {
  identificador: IdentificadorMundo;
  numero: number;
  titulo: string;
  concepto: string;
  descripcion: string;
  /** Disponibilidad del contenido; el bloqueo por progreso se calcula aparte. */
  estado: EstadoMundo;
  requisito: RequisitoMundo | null;
  mensajes: MensajesMundo;
  icono: TipoIcono;
  tema: TemaVisual;
}

export interface EstadoJuego {
  nivelActual: NivelSecuencia;
  /** Identificadores de los pasos en el orden que tiene el tablero. */
  secuenciaActual: string[];
  resultado: ResultadoJuego;
  intentos: number;
}
