"use client";

import { AnimatePresence, motion } from "framer-motion";
import EscenaAnimacion from "@/componentes/EscenaAnimacion";
import type { EvaluacionSecuencia } from "@/tipos/juego";

interface PropiedadesAnimacionPaleta {
  evaluacion: EvaluacionSecuencia;
  modoCelebracion?: boolean;
}

const etapas = [
  "Molde vacío",
  "Jugo listo",
  "Molde lleno",
  "Palito puesto",
  "En el congelador",
  "Congelándose",
  "Paleta lista",
];

const formaMolde =
  "M152 82 A28 28 0 0 1 208 82 V166 A8 8 0 0 1 200 174 H160 A8 8 0 0 1 152 166 Z";

const copos = [
  [134, 62],
  [228, 70],
  [138, 150],
  [226, 144],
  [180, 44],
];

export default function AnimacionPaleta({
  evaluacion,
  modoCelebracion = false,
}: PropiedadesAnimacionPaleta) {
  return (
    <EscenaAnimacion
      evaluacion={evaluacion}
      modoCelebracion={modoCelebracion}
      etiqueta="Progreso de la paleta"
      etapas={etapas}
      colorHalo="#ff725e"
    >
      {({ id, etapa, completado, reducirMovimiento, repetir }) => {
        const congelada = etapa >= 5;
        const duracion = reducirMovimiento ? 0.01 : 0.5;

        return (
          <>
            <defs>
              <clipPath id={`${id}-molde`}>
                <path d={formaMolde} />
              </clipPath>
              <linearGradient id={`${id}-jugo`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffc07a" />
                <stop offset="0.55" stopColor="#ff8a4c" />
                <stop offset="1" stopColor="#e2553f" />
              </linearGradient>
            </defs>

            <ellipse cx="180" cy="206" rx="96" ry="10" fill="#090616" opacity="0.34" />

            {/* Vaso con jugo */}
            <motion.g
              initial={false}
              animate={{ opacity: completado ? 0 : 1, x: completado ? -12 : 0 }}
              transition={{ duration: duracion }}
            >
              <path
                d="M64 116 H110 L103 192 H71 Z"
                fill="#f9efdb"
                fillOpacity="0.12"
                stroke="#f9efdb"
                strokeOpacity="0.55"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <motion.path
                d="M67 130 H107 L102 189 H72 Z"
                fill={`url(#${id}-jugo)`}
                initial={false}
                animate={{
                  opacity: etapa >= 1 ? 1 : 0,
                  scaleY: etapa >= 2 ? 0.28 : 1,
                }}
                transition={{ duration: duracion }}
                style={{ transformOrigin: "87px 189px" }}
              />
              {etapa >= 1 && (
                <motion.g
                  initial={reducirMovimiento ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ transformOrigin: "108px 116px" }}
                >
                  <circle cx="108" cy="116" r="11" fill="#ffb347" stroke="#fff1c9" strokeWidth="2.5" />
                  <path d="M108 107 V125 M99 116 H117 M102 110 L114 122 M114 110 L102 122" stroke="#fff1c9" strokeWidth="1.3" />
                </motion.g>
              )}
            </motion.g>

            <AnimatePresence>
              {etapa === 2 && !completado && (
                <motion.path
                  key="chorro"
                  d="M104 116 C124 70 150 52 178 62"
                  fill="none"
                  stroke="#ff9a3c"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={reducirMovimiento ? false : { pathLength: 0, opacity: 0 }}
                  animate={
                    reducirMovimiento
                      ? { pathLength: 1, opacity: 0.6 }
                      : { pathLength: [0, 1, 1], opacity: [0, 0.9, 0] }
                  }
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reducirMovimiento ? 0.01 : 1.3,
                    repeat: repetir,
                    repeatDelay: 0.5,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Base del molde */}
            <motion.rect
              x="136"
              y="170"
              width="88"
              height="12"
              rx="6"
              fill="#8be0bf"
              initial={false}
              animate={{ opacity: completado ? 0 : 0.85 }}
              transition={{ duration: duracion }}
            />

            {/* Paleta: palito y jugo recortado por el molde */}
            <motion.g
              initial={false}
              animate={
                completado && !reducirMovimiento
                  ? { y: [0, -22, -14], rotate: [0, -4, 0] }
                  : { y: completado ? -14 : 0, rotate: 0 }
              }
              transition={{
                duration: reducirMovimiento ? 0.01 : 0.9,
                delay: reducirMovimiento ? 0 : 0.55,
                ease: "easeOut",
              }}
              style={{ transformOrigin: "180px 120px" }}
            >
              {etapa >= 3 && (
                <motion.rect
                  x="174"
                  y="140"
                  width="12"
                  height="66"
                  rx="6"
                  fill="#e7c48b"
                  stroke="#b98f52"
                  strokeWidth="1.5"
                  initial={reducirMovimiento ? false : { y: -70, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: reducirMovimiento ? 0.01 : 0.5, ease: "easeIn" }}
                />
              )}
              <g clipPath={`url(#${id}-molde)`}>
                <rect x="148" y="50" width="64" height="130" fill="#2a1f3f" opacity={completado ? 0 : 0.7} />
                <motion.rect
                  x="148"
                  width="64"
                  height="130"
                  initial={false}
                  animate={{
                    y: etapa >= 2 ? 50 : 180,
                    fill: congelada ? "#ffae7d" : "#ff8a4c",
                  }}
                  transition={{ duration: reducirMovimiento ? 0.01 : 0.8, ease: "easeOut" }}
                />
                {etapa >= 2 && (
                  <motion.path
                    d="M150 72 C166 64 190 80 210 70"
                    stroke="#ffd2a8"
                    strokeWidth="3"
                    fill="none"
                    initial={false}
                    animate={
                      reducirMovimiento || congelada
                        ? { opacity: 0.5 }
                        : { opacity: [0.2, 0.7, 0.2], y: [0, 3, 0] }
                    }
                    transition={{ duration: 1.8, repeat: congelada ? 0 : repetir }}
                  />
                )}
                {congelada && (
                  <motion.g
                    initial={reducirMovimiento ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <path d="M162 70 V160" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
                    <path d="M150 110 L162 104 M150 132 L160 128 M198 96 L210 90 M200 146 L210 140" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                  </motion.g>
                )}
              </g>
            </motion.g>

            {/* Contorno del molde */}
            <motion.path
              d={formaMolde}
              fill="none"
              stroke="#c9f1ff"
              strokeWidth="5"
              initial={false}
              animate={{ opacity: completado ? 0 : 0.75 }}
              transition={{ duration: duracion, delay: completado && !reducirMovimiento ? 0.3 : 0 }}
            />

            <AnimatePresence>
              {etapa >= 4 && !completado && (
                <motion.g
                  key="congelador"
                  initial={reducirMovimiento ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.08 }}
                  transition={{ duration: reducirMovimiento ? 0.01 : 0.4 }}
                  style={{ transformOrigin: "180px 120px" }}
                >
                  <rect x="118" y="28" width="124" height="186" rx="20" fill="#7cc6ff" fillOpacity="0.12" stroke="#7cc6ff" strokeWidth="4" />
                  <rect x="228" y="92" width="6" height="42" rx="3" fill="#7cc6ff" />
                  <path d="M126 40 H234" stroke="#c9f1ff" strokeWidth="2" opacity="0.5" />
                </motion.g>
              )}
            </AnimatePresence>

            {congelada &&
              copos.map(([x, y], indice) => (
                <g key={indice} transform={`translate(${x} ${y})`}>
                  <motion.path
                    d="M0 -7 V7 M-6 -3.5 L6 3.5 M-6 3.5 L6 -3.5"
                    stroke="#e4f7ff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    initial={reducirMovimiento ? false : { opacity: 0, scale: 0 }}
                    animate={
                      reducirMovimiento
                        ? { opacity: 0.8, scale: 1 }
                        : completado
                          ? { opacity: [1, 0], scale: [1, 1.6], rotate: 90 }
                          : { opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8], rotate: [0, 60, 0] }
                    }
                    transition={{
                      duration: reducirMovimiento ? 0.01 : completado ? 0.6 : 2.2,
                      repeat: completado ? 0 : repetir,
                      delay: indice * 0.18,
                    }}
                  />
                </g>
              ))}
          </>
        );
      }}
    </EscenaAnimacion>
  );
}
