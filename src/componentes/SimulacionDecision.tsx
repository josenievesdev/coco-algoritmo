"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import EscenaAnimacion from "@/componentes/EscenaAnimacion";
import type { EvaluacionSecuencia } from "@/tipos/juego";

/** Propiedades comunes de las animaciones de nivel de decisión. */
export interface PropiedadesAnimacionDecision {
  /**
   * Evaluación neutral: `pasosConsecutivosCorrectos` indica cuántos espacios
   * están llenos, nunca si son correctos.
   */
  evaluacion: EvaluacionSecuencia;
  modoCelebracion?: boolean;
  indicador?: ReactNode;
}

export interface ContextoDibujo {
  reducirMovimiento: boolean;
  /** Retraso inicial del panel, en segundos. */
  retraso: number;
}

/**
 * `true`: la condición se cumple. `false`: no se cumple.
 * `null`: escena neutral mientras el jugador construye la decisión.
 */
export type EstadoEscenario = boolean | null;

interface PropiedadesSimulacionDecision extends PropiedadesAnimacionDecision {
  etiqueta: string;
  colorHalo: string;
  textoFinal: string;
  escenarios: readonly [string, string];
  dibujar: (estado: EstadoEscenario, contexto: ContextoDibujo) => ReactNode;
}

/** Crea evaluaciones neutrales para las escenas de decisión. */
export function crearEvaluacionDecision(
  llenos: number,
  total: number,
  completada: boolean,
): EvaluacionSecuencia {
  const posiciones = Array.from({ length: total }, (_, indice) => indice < llenos);

  return {
    estado: completada ? "completa" : llenos > 0 ? "parcial" : "incorrecta",
    posicionesCorrectas: posiciones,
    cantidadEnPosicionCorrecta: llenos,
    pasosConsecutivosCorrectos: llenos,
    porcentajeProgreso: total ? Math.round((llenos / total) * 100) : 0,
  };
}

function crearEtapas(total: number, textoFinal: string): string[] {
  return [
    "Esperando tu decisión",
    ...Array.from({ length: total }, (_, indice) =>
      indice + 1 === total
        ? "Espacios completos"
        : `${indice + 1} de ${total} espacios`,
    ),
    textoFinal,
  ];
}

const ANCHO_PANEL = 138;

function PanelEscenario({
  x,
  texto,
  cumplida,
  retraso,
  reducirMovimiento,
  children,
}: {
  x: number;
  texto: string;
  cumplida: boolean;
  retraso: number;
  reducirMovimiento: boolean;
  children: ReactNode;
}) {
  return (
    <motion.g
      initial={reducirMovimiento ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducirMovimiento ? 0.01 : 0.3, delay: reducirMovimiento ? 0 : retraso }}
    >
      <g transform={`translate(${x} 26)`}>
        <rect
          width={ANCHO_PANEL}
          height="178"
          rx="18"
          fill="#17122f"
          fillOpacity="0.55"
          stroke={cumplida ? "#8be0bf" : "#f7c948"}
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        <rect x="8" y="8" width="24" height="16" rx="8" fill={cumplida ? "#8be0bf" : "#f7c948"} />
        <text
          x="20"
          y="20"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fill="#17122f"
        >
          {cumplida ? "SÍ" : "NO"}
        </text>
        <text x="38" y="20" fontSize="11" fontWeight="800" fill="#f9efdb" fillOpacity="0.85">
          {texto}
        </text>
        <g transform="translate(0 26)">{children}</g>
      </g>
    </motion.g>
  );
}

/**
 * Marco de las escenas de decisión. Durante la partida muestra una escena
 * neutral; al acertar simula la regla en los dos escenarios posibles.
 */
export default function SimulacionDecision({
  evaluacion,
  modoCelebracion = false,
  indicador,
  etiqueta,
  colorHalo,
  textoFinal,
  escenarios,
  dibujar,
}: PropiedadesSimulacionDecision) {
  const etapas = crearEtapas(evaluacion.posicionesCorrectas.length, textoFinal);

  return (
    <EscenaAnimacion
      evaluacion={evaluacion}
      modoCelebracion={modoCelebracion}
      etiqueta={etiqueta}
      etapas={etapas}
      colorHalo={colorHalo}
      indicador={indicador}
    >
      {({ completado, reducirMovimiento }) =>
        completado ? (
          <>
            <PanelEscenario
              x={40}
              texto={escenarios[0]}
              cumplida
              retraso={0}
              reducirMovimiento={reducirMovimiento}
            >
              {dibujar(true, { reducirMovimiento, retraso: 0.15 })}
            </PanelEscenario>
            <PanelEscenario
              x={182}
              texto={escenarios[1]}
              cumplida={false}
              retraso={0.3}
              reducirMovimiento={reducirMovimiento}
            >
              {dibujar(false, { reducirMovimiento, retraso: 0.45 })}
            </PanelEscenario>
          </>
        ) : (
          <g transform="translate(111 40)">
            {dibujar(null, { reducirMovimiento, retraso: 0 })}
          </g>
        )
      }
    </EscenaAnimacion>
  );
}

/** Signo de interrogación de la escena neutral. */
export function Interrogacion({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="11" fill="#f7c948" />
      <text y="5" textAnchor="middle" fontSize="15" fontWeight="900" fill="#17122f">
        ?
      </text>
    </g>
  );
}

/** Personaje sencillo compartido por varias escenas. */
export function Personaje({
  x,
  y,
  colorRopa = "#6b4fa3",
}: {
  x: number;
  y: number;
  colorRopa?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-6 30 V44 M6 30 V44" stroke="#2b2151" strokeWidth="5" strokeLinecap="round" />
      <rect x="-12" y="4" width="24" height="30" rx="9" fill={colorRopa} />
      <circle cy="-6" r="10" fill="#f2c29b" stroke="#c98f68" strokeWidth="1.5" />
      <circle cx="-3.5" cy="-7" r="1.3" fill="#2b2151" />
      <circle cx="3.5" cy="-7" r="1.3" fill="#2b2151" />
      <path d="M-3 -2 Q0 1 3 -2" stroke="#2b2151" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </g>
  );
}
