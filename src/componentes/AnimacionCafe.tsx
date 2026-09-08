"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import IndicadorProgresoCafe from "@/componentes/IndicadorProgresoCafe";
import type { EvaluacionSecuencia } from "@/tipos/juego";

interface PropiedadesAnimacionCafe {
  evaluacion: EvaluacionSecuencia;
  modoCelebracion?: boolean;
}

const nombresEtapa = [
  "Taza en espera",
  "Agua caliente",
  "Café entrando",
  "Azúcar lista",
  "Mezcla en marcha",
  "Café servido",
];

export default function AnimacionCafe({
  evaluacion,
  modoCelebracion = false,
}: PropiedadesAnimacionCafe) {
  const reducirMovimiento = useReducedMotion();
  const identificador = `cafe-${useId().replace(/:/g, "")}`;
  const total = evaluacion.posicionesCorrectas.length;
  const nivelVisual = total
    ? Math.min(
        5,
        Math.round((evaluacion.pasosConsecutivosCorrectos / total) * 5),
      )
    : 5;
  const completado = evaluacion.estado === "completa";
  const colorLiquido = nivelVisual >= 2 ? "#6f351d" : "#8bc8bd";
  const repetir = reducirMovimiento ? 0 : Infinity;

  return (
    <section
      className={
        modoCelebracion
          ? "relative w-full"
          : "relative overflow-hidden rounded-[1.7rem] border border-[#f9efdb]/12 bg-[#1b1538] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_42px_rgba(0,0,0,0.24)]"
      }
      aria-label={`Progreso del café: ${nombresEtapa[nivelVisual]}`}
    >
      {!modoCelebracion && (
        <div className="relative z-10 mb-1 flex items-center justify-between">
          <span className="text-[0.58rem] font-black tracking-[0.2em] text-[#f9efdb]/42">
            PROCESO EN VIVO
          </span>
          <motion.span
            key={nivelVisual}
            initial={
              reducirMovimiento ? false : { opacity: 0, x: 5 }
            }
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducirMovimiento ? 0.01 : 0.24 }}
            className="rounded-full border border-[#8be0bf]/20 bg-[#8be0bf]/10 px-2.5 py-1 text-[0.58rem] font-black tracking-[0.1em] text-[#8be0bf]"
          >
            {nombresEtapa[nivelVisual]}
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
              <linearGradient id={`${identificador}-fondo`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#352766" />
                <stop offset="0.55" stopColor="#211943" />
                <stop offset="1" stopColor="#17122f" />
              </linearGradient>
              <linearGradient id={`${identificador}-taza`} x1="0" y1="0" x2="0.92" y2="1">
                <stop offset="0" stopColor="#fffdf5" />
                <stop offset="0.48" stopColor="#f5e9cf" />
                <stop offset="1" stopColor="#c8b38f" />
              </linearGradient>
              <linearGradient id={`${identificador}-borde`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#a58b67" />
                <stop offset="0.45" stopColor="#fffaf0" />
                <stop offset="1" stopColor="#8c7555" />
              </linearGradient>
              <linearGradient id={`${identificador}-cafetera`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8be0bf" />
                <stop offset="0.48" stopColor="#3d8d7b" />
                <stop offset="1" stopColor="#1e4d49" />
              </linearGradient>
              <radialGradient id={`${identificador}-liquido`} cx="40%" cy="25%" r="70%">
                <stop offset="0" stopColor={nivelVisual >= 2 ? "#d18a4f" : "#c6fff3"} />
                <stop offset="0.52" stopColor={colorLiquido} />
                <stop offset="1" stopColor={nivelVisual >= 2 ? "#2b160f" : "#397b75"} />
              </radialGradient>
              <radialGradient id={`${identificador}-halo`} cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor={completado ? "#f7c948" : "#8be0bf"} stopOpacity="0.34" />
                <stop offset="1" stopColor="#17122f" stopOpacity="0" />
              </radialGradient>
              <filter id={`${identificador}-sombra`} x="-30%" y="-30%" width="160%" height="180%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#090616" floodOpacity="0.62" />
              </filter>
              <filter id={`${identificador}-brillo`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="4" result="desenfoque" />
                <feMerge>
                  <feMergeNode in="desenfoque" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="28" y="18" width="304" height="194" rx="36" fill={`url(#${identificador}-fondo)`} opacity={modoCelebracion ? 0.58 : 0.9} />
            <motion.ellipse
              cx="180"
              cy="128"
              rx="112"
              ry="82"
              fill={`url(#${identificador}-halo)`}
              initial={false}
              animate={
                reducirMovimiento
                  ? {
                      opacity: nivelVisual > 0 ? 0.58 : 0.12,
                      scale: 1,
                    }
                  : {
                      opacity:
                        nivelVisual > 0
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

            <ellipse cx="180" cy="198" rx="105" ry="16" fill="#090616" opacity="0.34" />
            <ellipse cx="180" cy="188" rx="100" ry="19" fill={`url(#${identificador}-borde)`} filter={`url(#${identificador}-sombra)`} />
            <ellipse cx="180" cy="185" rx="76" ry="11" fill="#7a684e" opacity="0.28" />

            {nivelVisual >= 1 && (
              <g>
                {[0, 1, 2].map((indice) => (
                  <motion.path
                    key={indice}
                    d={`M${145 + indice * 34} 86 C${128 + indice * 36} 65, ${165 + indice * 27} 57, ${148 + indice * 34} 34`}
                    fill="none"
                    stroke="#d7fff1"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={
                      reducirMovimiento
                        ? false
                        : { pathLength: 0, opacity: 0, y: 8 }
                    }
                    animate={
                      reducirMovimiento
                        ? { pathLength: 1, opacity: 0.42, y: 0 }
                        : {
                            pathLength: [0, 1, 1],
                            opacity: [0, completado ? 0.88 : 0.48, 0],
                            y: [8, 0, -10],
                          }
                    }
                    transition={{
                      duration: reducirMovimiento ? 0.01 : 2.25,
                      repeat: repetir,
                      delay: indice * 0.28,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </g>
            )}

            <motion.g
              animate={completado && !reducirMovimiento ? { y: [0, -5, 0] } : { y: 0 }}
              transition={{ duration: 0.92, ease: "easeOut" }}
            >
              <path
                d="M254 112 C318 102 320 171 251 171"
                fill="none"
                stroke={`url(#${identificador}-borde)`}
                strokeWidth="22"
                strokeLinecap="round"
                filter={`url(#${identificador}-sombra)`}
              />
              <path
                d="M257 121 C299 114 300 158 254 160"
                fill="none"
                stroke="#30244d"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M96 103 L108 164 C112 184 130 193 180 193 C230 193 248 184 252 164 L264 103 Z"
                fill={`url(#${identificador}-taza)`}
                filter={`url(#${identificador}-sombra)`}
              />
              <path
                d="M115 122 L124 162 C128 176 141 181 153 183"
                fill="none"
                stroke="#ffffff"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.54"
              />
              <ellipse cx="180" cy="103" rx="84" ry="23" fill={`url(#${identificador}-borde)`} />
              <ellipse cx="180" cy="103" rx="74" ry="16" fill="#332846" />
              <motion.ellipse
                cx="180"
                cy="104"
                rx="67"
                ry="13"
                fill={`url(#${identificador}-liquido)`}
                initial={false}
                animate={
                  reducirMovimiento
                    ? {
                        opacity: nivelVisual >= 1 ? 1 : 0,
                        scale: nivelVisual >= 1 ? 1 : 0.65,
                      }
                    : {
                        opacity: nivelVisual >= 1 ? 1 : 0,
                        scale: completado
                          ? [0.85, 1.05, 1]
                          : nivelVisual >= 1
                            ? 1
                            : 0.65,
                      }
                }
                transition={{
                  duration: reducirMovimiento
                    ? 0.01
                    : completado
                      ? 1.05
                      : 0.48,
                  ease: "easeOut",
                }}
                style={{ transformOrigin: "180px 104px" }}
              />
              {nivelVisual >= 2 && (
                <motion.path
                  d="M134 103 C151 94 172 112 191 102 C207 94 219 99 226 104"
                  fill="none"
                  stroke="#f3b777"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.5"
                  animate={
                    reducirMovimiento
                      ? undefined
                      : { pathLength: [0.2, 1, 0.2], opacity: [0.2, 0.62, 0.2] }
                  }
                  transition={{ duration: 2.2, repeat: repetir, ease: "easeInOut" }}
                />
              )}
            </motion.g>

            <AnimatePresence>
              {nivelVisual === 2 && !completado && (
                <motion.g key="cafe-molido" exit={{ opacity: 0 }}>
                  {[0, 1, 2, 3, 4].map((indice) => (
                    <motion.circle
                      key={indice}
                      cx={155 + indice * 13}
                      cy="62"
                      r={2.4 + (indice % 2)}
                      fill="#d68a4b"
                      initial={
                        reducirMovimiento ? false : { y: -16, opacity: 0 }
                      }
                      animate={
                        reducirMovimiento
                          ? { y: 28, opacity: 0.72 }
                          : { y: [0, 38], opacity: [0, 0.9, 0] }
                      }
                      transition={{
                        duration: reducirMovimiento ? 0.01 : 0.92,
                        repeat: repetir,
                        repeatDelay: 0.5,
                        delay: indice * 0.09,
                        ease: "easeIn",
                      }}
                    />
                  ))}
                </motion.g>
              )}
              {nivelVisual === 3 && !completado && (
                <motion.g key="azucar" exit={{ opacity: 0 }}>
                  {[0, 1, 2, 3].map((indice) => (
                    <motion.rect
                      key={indice}
                      x={157 + indice * 15}
                      y="53"
                      width="6"
                      height="6"
                      rx="1.5"
                      fill="#fff4c7"
                      initial={
                        reducirMovimiento
                          ? false
                          : { y: -15, rotate: 0, opacity: 0 }
                      }
                      animate={
                        reducirMovimiento
                          ? { y: 30, rotate: 0, opacity: 0.8 }
                          : {
                              y: [0, 47],
                              rotate: [0, 180],
                              opacity: [0, 1, 0],
                            }
                      }
                      transition={{
                        duration: reducirMovimiento ? 0.01 : 1.05,
                        repeat: repetir,
                        repeatDelay: 0.7,
                        delay: indice * 0.12,
                        ease: "easeIn",
                      }}
                    />
                  ))}
                </motion.g>
              )}
            </AnimatePresence>

            {nivelVisual >= 4 && (
              <motion.g
                style={{ transformOrigin: "180px 104px" }}
                animate={
                  reducirMovimiento
                    ? { rotate: -6 }
                    : { rotate: [-8, 8, -8], x: [-3, 3, -3] }
                }
                transition={{
                  duration: completado ? 0.9 : 1.25,
                  repeat: completado ? 0 : repetir,
                  ease: "easeInOut",
                }}
              >
                <path d="M186 105 L222 49" stroke="#d6c7aa" strokeWidth="7" strokeLinecap="round" />
                <ellipse cx="183" cy="108" rx="11" ry="5" fill="#aa9879" />
                <path d="M218 52 L226 40" stroke="#fff9e8" strokeWidth="4" strokeLinecap="round" opacity="0.72" />
              </motion.g>
            )}

            <AnimatePresence>
              {completado && (
                <motion.g
                  key="servido-final"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.g
                    initial={
                      reducirMovimiento
                        ? false
                        : { x: 30, y: -18, rotate: -8, opacity: 0 }
                    }
                    animate={
                      reducirMovimiento
                        ? { x: 0, y: 0, rotate: -16, opacity: 1 }
                        : {
                            x: [30, 0, 0, -8],
                            y: [-18, 0, 0, -10],
                            rotate: [-8, -18, -18, -8],
                            opacity: [0, 1, 1, 0],
                          }
                    }
                    transition={
                      reducirMovimiento
                        ? { duration: 0.01 }
                        : {
                            duration: 1.25,
                            times: [0, 0.22, 0.76, 1],
                            ease: "easeInOut",
                          }
                    }
                    style={{ transformOrigin: "280px 50px" }}
                  >
                    <path d="M251 17 H306 L314 64 Q300 84 266 72 L248 43 Z" fill={`url(#${identificador}-cafetera)`} filter={`url(#${identificador}-sombra)`} />
                    <path d="M249 39 L226 51 L254 55" fill="#8be0bf" />
                    <path d="M267 21 Q281 40 300 24" fill="none" stroke="#c8ffeb" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
                    <path d="M306 28 Q332 38 314 58" fill="none" stroke="#8be0bf" strokeWidth="8" strokeLinecap="round" />
                  </motion.g>
                  <motion.path
                    d="M238 55 C224 69 217 79 211 101"
                    fill="none"
                    stroke="#a85b2c"
                    strokeWidth="9"
                    strokeLinecap="round"
                    initial={
                      reducirMovimiento
                        ? false
                        : { pathLength: 0, opacity: 0 }
                    }
                    animate={
                      reducirMovimiento
                        ? { pathLength: 1, opacity: 0.8 }
                        : {
                            pathLength: [0, 1, 1],
                            opacity: [0, 0.95, 0],
                          }
                    }
                    transition={
                      reducirMovimiento
                        ? { duration: 0.01 }
                        : {
                            duration: 1.08,
                            times: [0, 0.3, 1],
                            ease: "easeInOut",
                          }
                    }
                  />
                  {[0, 1, 2, 3].map((indice) => {
                    const posiciones = [
                      [102, 82],
                      [260, 100],
                      [116, 146],
                      [271, 154],
                    ];
                    const [x, y] = posiciones[indice];

                    return (
                      <g key={indice} transform={`translate(${x} ${y})`}>
                        <motion.g
                          initial={
                            reducirMovimiento
                              ? false
                              : { opacity: 0, scale: 0, rotate: -30 }
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
                            duration: reducirMovimiento ? 0.01 : 0.75,
                            delay: reducirMovimiento ? 0 : 0.42 + indice * 0.08,
                          }}
                          filter={`url(#${identificador}-brillo)`}
                        >
                          <path
                            d="M0 -8 V8 M-8 0 H8"
                            stroke={indice % 2 ? "#8be0bf" : "#f7c948"}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </motion.g>
                      </g>
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </motion.div>
      </div>

      {!modoCelebracion && (
        <div className="relative z-10 mt-1">
          <IndicadorProgresoCafe evaluacion={evaluacion} />
        </div>
      )}
    </section>
  );
}
