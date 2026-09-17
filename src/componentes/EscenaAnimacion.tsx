"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import type { ReactNode } from "react";
import IndicadorProgresoCafe from "@/componentes/IndicadorProgresoCafe";
import type { EvaluacionSecuencia } from "@/tipos/juego";

export interface ContextoEscena {
  /** Prefijo único para los identificadores internos del SVG. */
  id: string;
  /** Cantidad de pasos conectados desde el inicio (0 a total). */
  etapa: number;
  completado: boolean;
  reducirMovimiento: boolean;
  /** `Infinity` para animaciones en bucle, o 0 si se reduce el movimiento. */
  repetir: number;
}

interface PropiedadesEscenaAnimacion {
  evaluacion: EvaluacionSecuencia;
  modoCelebracion?: boolean;
  etiqueta: string;
  etapas: string[];
  colorHalo: string;
  children: (contexto: ContextoEscena) => ReactNode;
  /**
   * Indicador bajo la escena. Si no se indica, se usa el indicador de cadena
   * de las secuencias; `null` lo oculta.
   */
  indicador?: ReactNode;
}

/**
 * Marco compartido por las animaciones de los niveles nuevos. Reproduce la
 * misma composición que `AnimacionCafe`: tarjeta, etapa en vivo, escena SVG
 * de 360×230 e indicador de cadena.
 */
export default function EscenaAnimacion({
  evaluacion,
  modoCelebracion = false,
  etiqueta,
  etapas,
  colorHalo,
  children,
  indicador,
}: PropiedadesEscenaAnimacion) {
  const reducirMovimiento = Boolean(useReducedMotion());
  const id = `escena-${useId().replace(/:/g, "")}`;
  const etapa = Math.min(
    evaluacion.pasosConsecutivosCorrectos,
    etapas.length - 1,
  );
  const completado = evaluacion.estado === "completa";
  const repetir = reducirMovimiento ? 0 : Infinity;
  const nombreEtapa = etapas[completado ? etapas.length - 1 : etapa];

  return (
    <section
      className={
        modoCelebracion
          ? "relative w-full"
          : "relative overflow-hidden rounded-[1.7rem] border border-[#f9efdb]/12 bg-[#1b1538] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_42px_rgba(0,0,0,0.24)]"
      }
      aria-label={`${etiqueta}: ${nombreEtapa}`}
    >
      {!modoCelebracion && (
        <div className="relative z-10 mb-1 flex items-center justify-between">
          <span className="text-[0.58rem] font-black tracking-[0.2em] text-[#f9efdb]/42">
            PROCESO EN VIVO
          </span>
          <motion.span
            key={nombreEtapa}
            initial={reducirMovimiento ? false : { opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducirMovimiento ? 0.01 : 0.24 }}
            className="rounded-full border border-[#8be0bf]/20 bg-[#8be0bf]/10 px-2.5 py-1 text-[0.58rem] font-black tracking-[0.1em] text-[#8be0bf]"
          >
            {nombreEtapa}
          </motion.span>
        </div>
      )}

      <div
        className={`relative mx-auto [perspective:800px] ${
          modoCelebracion ? "h-40 max-w-[20rem]" : "h-36 max-w-[21rem] sm:h-40"
        }`}
      >
        <motion.div
          className="absolute inset-0 [transform-style:preserve-3d]"
          animate={
            reducirMovimiento
              ? undefined
              : completado
                ? { rotateX: [0, -3, 0], rotateY: [0, 4, 0], scale: [1, 1.04, 1] }
                : { y: [0, -2, 0], rotateY: [-1.5, 1.5, -1.5] }
          }
          transition={{
            duration: completado ? 1.15 : 4.8,
            repeat: completado ? 0 : repetir,
            ease: "easeInOut",
          }}
        >
          <svg
            viewBox="0 0 360 230"
            className="h-full w-full overflow-visible"
            role="img"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`${id}-fondo`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#352766" />
                <stop offset="0.55" stopColor="#211943" />
                <stop offset="1" stopColor="#17122f" />
              </linearGradient>
              <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
                <stop
                  offset="0"
                  stopColor={completado ? "#f7c948" : colorHalo}
                  stopOpacity="0.34"
                />
                <stop offset="1" stopColor="#17122f" stopOpacity="0" />
              </radialGradient>
              <filter id={`${id}-sombra`} x="-30%" y="-30%" width="160%" height="180%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#090616" floodOpacity="0.62" />
              </filter>
              <filter id={`${id}-brillo`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="4" result="desenfoque" />
                <feMerge>
                  <feMergeNode in="desenfoque" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect
              x="28"
              y="18"
              width="304"
              height="194"
              rx="36"
              fill={`url(#${id}-fondo)`}
              opacity={modoCelebracion ? 0.58 : 0.9}
            />
            <motion.ellipse
              cx="180"
              cy="128"
              rx="112"
              ry="82"
              fill={`url(#${id}-halo)`}
              initial={false}
              animate={
                reducirMovimiento
                  ? { opacity: etapa > 0 ? 0.58 : 0.12, scale: 1 }
                  : {
                      opacity:
                        etapa > 0
                          ? completado
                            ? [0.55, 0.92, 0.58]
                            : 0.5
                          : 0.12,
                      scale: completado ? [0.85, 1.12, 1] : 1,
                    }
              }
              transition={{
                duration: reducirMovimiento ? 0.01 : 1.1,
                ease: "easeOut",
              }}
              style={{ transformOrigin: "180px 128px" }}
            />

            {children({ id, etapa, completado, reducirMovimiento, repetir })}

            {completado && (
              <Destellos id={id} reducirMovimiento={reducirMovimiento} />
            )}
          </svg>
        </motion.div>
      </div>

      {!modoCelebracion && (
        <div className="relative z-10 mt-1">
          {indicador === undefined ? (
            <IndicadorProgresoCafe evaluacion={evaluacion} />
          ) : (
            indicador
          )}
        </div>
      )}
    </section>
  );
}

const posicionesDestellos = [
  [72, 70],
  [292, 62],
  [84, 168],
  [288, 160],
];

function Destellos({
  id,
  reducirMovimiento,
}: {
  id: string;
  reducirMovimiento: boolean;
}) {
  return (
    <g>
      {posicionesDestellos.map(([x, y], indice) => (
        <g key={indice} transform={`translate(${x} ${y})`}>
          <motion.g
            initial={
              reducirMovimiento ? false : { opacity: 0, scale: 0, rotate: -30 }
            }
            animate={
              reducirMovimiento
                ? { opacity: 0.8, scale: 1, rotate: 0 }
                : {
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.55],
                    rotate: [-30, 20, 45],
                  }
            }
            transition={{
              duration: reducirMovimiento ? 0.01 : 0.8,
              delay: reducirMovimiento ? 0 : 0.9 + indice * 0.1,
            }}
            filter={`url(#${id}-brillo)`}
          >
            <path
              d="M0 -8 V8 M-8 0 H8"
              stroke={indice % 2 ? "#8be0bf" : "#f7c948"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </motion.g>
        </g>
      ))}
    </g>
  );
}
