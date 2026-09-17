"use client";

import { AnimatePresence, motion } from "framer-motion";
import EscenaAnimacion from "@/componentes/EscenaAnimacion";
import type { EvaluacionSecuencia } from "@/tipos/juego";

interface PropiedadesAnimacionLavadora {
  evaluacion: EvaluacionSecuencia;
  modoCelebracion?: boolean;
}

const etapas = [
  "Ropa mezclada",
  "Ropa separada",
  "Ropa adentro",
  "Detergente listo",
  "Puerta cerrada",
  "Ciclo elegido",
  "Lavado en marcha",
];

interface Prenda {
  color: string;
  claro: boolean;
}

const prendas: Prenda[] = [
  { color: "#ff725e", claro: false },
  { color: "#f9efdb", claro: true },
  { color: "#3f7fb3", claro: false },
  { color: "#f7c948", claro: true },
  { color: "#6b4fa3", claro: false },
];

const burbujas = [
  [166, 150, 4],
  [190, 158, 3],
  [178, 142, 2.5],
  [200, 146, 3.5],
  [158, 160, 2.5],
];

export default function AnimacionLavadora({
  evaluacion,
  modoCelebracion = false,
}: PropiedadesAnimacionLavadora) {
  return (
    <EscenaAnimacion
      evaluacion={evaluacion}
      modoCelebracion={modoCelebracion}
      etiqueta="Progreso del lavado"
      etapas={etapas}
      colorHalo="#7cc6ff"
    >
      {({ id, etapa, completado, reducirMovimiento, repetir }) => {
        const duracion = reducirMovimiento ? 0.01 : 0.45;
        const puertaCerrada = etapa >= 4;
        const colorLuz = completado
          ? "#8be0bf"
          : etapa >= 5
            ? "#f7c948"
            : "#5a4f73";
        const prendasOrdenadas = [
          ...prendas.filter((prenda) => prenda.claro),
          ...prendas.filter((prenda) => !prenda.claro),
        ];

        return (
          <>
            <defs>
              <linearGradient id={`${id}-cuerpo`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fffdf7" />
                <stop offset="0.55" stopColor="#ece5d8" />
                <stop offset="1" stopColor="#bfb4a2" />
              </linearGradient>
              <clipPath id={`${id}-tambor`}>
                <circle cx="180" cy="136" r="38" />
              </clipPath>
            </defs>

            <ellipse cx="180" cy="208" rx="90" ry="10" fill="#090616" opacity="0.34" />

            {/* Ropa fuera de la lavadora */}
            <AnimatePresence>
              {etapa < 2 && !completado && (
                <motion.g
                  key="ropa-fuera"
                  exit={
                    reducirMovimiento
                      ? { opacity: 0 }
                      : { opacity: 0, x: 70, y: -20, scale: 0.6 }
                  }
                  transition={{ duration: duracion }}
                >
                  {(etapa === 0 ? prendas : prendasOrdenadas).map(
                    (prenda, indice) => {
                      const separada = etapa === 1;
                      const x = separada
                        ? prenda.claro
                          ? 44
                          : 80
                        : 50 + (indice % 2) * 16;
                      const posicionEnGrupo = separada
                        ? prendasOrdenadas
                            .filter((otra) => otra.claro === prenda.claro)
                            .indexOf(prenda)
                        : indice;
                      const y = separada
                        ? 188 - posicionEnGrupo * 11
                        : 190 - indice * 9;

                      return (
                        <motion.rect
                          key={prenda.color}
                          width="30"
                          height="11"
                          rx="5"
                          fill={prenda.color}
                          stroke="#17122f"
                          strokeOpacity="0.25"
                          initial={false}
                          animate={{
                            x,
                            y,
                            rotate: separada ? 0 : indice % 2 ? 8 : -6,
                          }}
                          transition={{ duration: duracion, delay: indice * 0.04 }}
                        />
                      );
                    },
                  )}
                </motion.g>
              )}
            </AnimatePresence>

            <motion.g
              animate={
                completado && !reducirMovimiento
                  ? { x: [-1.2, 1.2, -1.2] }
                  : { x: 0 }
              }
              transition={{ duration: 0.16, repeat: completado ? repetir : 0 }}
            >
              {/* Cuerpo */}
              <rect x="118" y="36" width="124" height="172" rx="18" fill={`url(#${id}-cuerpo)`} filter={`url(#${id}-sombra)`} />
              <path d="M118 72 H242" stroke="#bfb4a2" strokeWidth="2" />
              <rect x="130" y="46" width="36" height="16" rx="5" fill="#d8cfbf" />
              <path d="M136 54 H160" stroke="#a89d8b" strokeWidth="2" strokeLinecap="round" />
              <motion.circle
                cx="196"
                cy="54"
                r="4"
                initial={false}
                animate={{ fill: colorLuz }}
                transition={{ duration: duracion }}
              />
              <g transform="translate(222 54)">
                <circle r="10" fill="#7c6f99" />
                <motion.g
                  initial={false}
                  animate={{ rotate: etapa >= 5 ? 80 : -40 }}
                  transition={{
                    duration: reducirMovimiento ? 0.01 : 0.5,
                    type: reducirMovimiento ? "tween" : "spring",
                    stiffness: 200,
                    damping: 12,
                  }}
                >
                  <path d="M0 0 V-7" stroke="#fffdf7" strokeWidth="3" strokeLinecap="round" />
                </motion.g>
              </g>

              {/* Tambor */}
              <circle cx="180" cy="136" r="46" fill="#bdb3a3" />
              <circle cx="180" cy="136" r="38" fill="#231a45" />
              <g clipPath={`url(#${id}-tambor)`}>
                {completado && (
                  <motion.rect
                    x="138"
                    width="84"
                    height="60"
                    fill="#7cc6ff"
                    initial={reducirMovimiento ? false : { y: 176 }}
                    animate={
                      reducirMovimiento
                        ? { y: 140 }
                        : { y: [176, 140, 136, 140] }
                    }
                    transition={{ duration: reducirMovimiento ? 0.01 : 1.3, ease: "easeOut" }}
                    opacity="0.55"
                  />
                )}
                {etapa >= 2 && (
                  <motion.g
                    initial={reducirMovimiento ? false : { opacity: 0, y: -24 }}
                    animate={
                      completado && !reducirMovimiento
                        ? { opacity: 1, y: 0, rotate: [0, 360] }
                        : { opacity: 1, y: 0, rotate: 0 }
                    }
                    transition={
                      completado && !reducirMovimiento
                        ? {
                            rotate: { duration: 1.1, repeat: repetir, ease: "linear" },
                            default: { duration: 0.4 },
                          }
                        : { duration: duracion }
                    }
                    style={{ transformOrigin: "180px 136px" }}
                  >
                    <rect x="152" y="146" width="26" height="12" rx="6" fill="#ff725e" />
                    <rect x="176" y="150" width="28" height="12" rx="6" fill="#3f7fb3" />
                    <rect x="164" y="136" width="24" height="11" rx="5" fill="#f7c948" />
                    <rect x="186" y="138" width="20" height="10" rx="5" fill="#f9efdb" />
                  </motion.g>
                )}
                {etapa >= 3 &&
                  burbujas.map(([x, y, radio], indice) => (
                    <motion.circle
                      key={indice}
                      cx={x}
                      cy={y}
                      r={radio}
                      fill="#ffffff"
                      initial={reducirMovimiento ? false : { opacity: 0, scale: 0 }}
                      animate={
                        completado && !reducirMovimiento
                          ? { opacity: [0, 0.9, 0], y: [0, -40], scale: [0.6, 1.3] }
                          : { opacity: 0.75, scale: 1, y: 0 }
                      }
                      transition={{
                        duration: completado && !reducirMovimiento ? 1.2 : duracion,
                        repeat: completado ? repetir : 0,
                        delay: indice * 0.15,
                      }}
                    />
                  ))}
              </g>

              {/* Puerta */}
              <AnimatePresence initial={false}>
                {puertaCerrada ? (
                  <motion.g
                    key="puerta-cerrada"
                    initial={reducirMovimiento ? false : { scaleX: 0.2, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducirMovimiento ? 0.01 : 0.4, ease: "easeOut" }}
                    style={{ transformOrigin: "134px 136px" }}
                  >
                    <circle cx="180" cy="136" r="42" fill="#c9f1ff" fillOpacity="0.16" stroke="#f5f0e6" strokeWidth="7" />
                    <path d="M160 112 Q170 104 184 104" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
                  </motion.g>
                ) : (
                  <motion.g
                    key="puerta-abierta"
                    initial={false}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducirMovimiento ? 0.01 : 0.2 }}
                  >
                    <ellipse cx="116" cy="136" rx="12" ry="42" fill="#c9f1ff" fillOpacity="0.16" stroke="#f5f0e6" strokeWidth="7" />
                  </motion.g>
                )}
              </AnimatePresence>
            </motion.g>

            {/* Detergente */}
            {etapa >= 3 && (
              <motion.g
                initial={reducirMovimiento ? false : { opacity: 0, x: 20 }}
                animate={
                  etapa === 3 && !reducirMovimiento
                    ? { opacity: 1, x: 0, rotate: [0, -38, -38, 0] }
                    : { opacity: completado ? 0 : 1, x: 0, rotate: 0 }
                }
                transition={
                  etapa === 3 && !reducirMovimiento
                    ? { duration: 2, repeat: repetir, repeatDelay: 0.6, times: [0, 0.25, 0.7, 1] }
                    : { duration: duracion }
                }
                style={{ transformOrigin: "276px 150px" }}
              >
                <rect x="262" y="124" width="30" height="50" rx="8" fill="#8be0bf" filter={`url(#${id}-sombra)`} />
                <rect x="270" y="112" width="14" height="14" rx="3" fill="#4d9a82" />
                <rect x="266" y="140" width="22" height="16" rx="4" fill="#ffffff" opacity="0.7" />
              </motion.g>
            )}
            <AnimatePresence>
              {etapa === 3 && !completado && !reducirMovimiento && (
                <motion.g key="gotas-detergente" exit={{ opacity: 0 }}>
                  {[0, 1, 2].map((indice) => (
                    <motion.circle
                      key={indice}
                      r="3.5"
                      fill="#8be0bf"
                      initial={{ cx: 258, cy: 112, opacity: 0 }}
                      animate={{
                        cx: [258, 236, 212],
                        cy: [112, 104, 126],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 0.9,
                        repeat: repetir,
                        repeatDelay: 1.1,
                        delay: 0.5 + indice * 0.12,
                      }}
                    />
                  ))}
                </motion.g>
              )}
            </AnimatePresence>
          </>
        );
      }}
    </EscenaAnimacion>
  );
}
