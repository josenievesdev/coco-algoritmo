"use client";

import { AnimatePresence, motion } from "framer-motion";
import EscenaAnimacion from "@/componentes/EscenaAnimacion";
import type { EvaluacionSecuencia } from "@/tipos/juego";

interface PropiedadesAnimacionSemilla {
  evaluacion: EvaluacionSecuencia;
  modoCelebracion?: boolean;
}

const etapas = [
  "Maceta vacía",
  "Tierra lista",
  "Hueco abierto",
  "Semilla dentro",
  "Semilla cubierta",
  "Brote creciendo",
];

export default function AnimacionSemilla({
  evaluacion,
  modoCelebracion = false,
}: PropiedadesAnimacionSemilla) {
  return (
    <EscenaAnimacion
      evaluacion={evaluacion}
      modoCelebracion={modoCelebracion}
      etiqueta="Progreso de la siembra"
      etapas={etapas}
      colorHalo="#8be0bf"
    >
      {({ id, etapa, completado, reducirMovimiento, repetir }) => (
        <>
          <defs>
            <linearGradient id={`${id}-maceta`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffab85" />
              <stop offset="0.5" stopColor="#e2714f" />
              <stop offset="1" stopColor="#9d4630" />
            </linearGradient>
            <radialGradient id={`${id}-tierra`} cx="45%" cy="35%" r="70%">
              <stop offset="0" stopColor="#9a6a45" />
              <stop offset="1" stopColor="#4a2c1d" />
            </radialGradient>
          </defs>

          <ellipse cx="180" cy="204" rx="88" ry="11" fill="#090616" opacity="0.34" />

          {/* Maceta */}
          <path
            d="M118 112 H242 L226 194 Q180 206 134 194 Z"
            fill={`url(#${id}-maceta)`}
            filter={`url(#${id}-sombra)`}
          />
          <path
            d="M132 124 L142 186"
            stroke="#ffd2bd"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.45"
          />
          <rect x="106" y="96" width="148" height="22" rx="8" fill="#f08a64" />
          <rect x="112" y="99" width="136" height="4" rx="2" fill="#ffd2bd" opacity="0.5" />
          <ellipse cx="180" cy="104" rx="64" ry="8" fill="#2a1f3f" />

          {/* Tierra */}
          <motion.ellipse
            cx="180"
            cy="104"
            rx="64"
            ry="8"
            fill={`url(#${id}-tierra)`}
            initial={false}
            animate={{
              opacity: etapa >= 1 ? 1 : 0,
              scaleY: etapa >= 1 ? 1 : 0.2,
            }}
            transition={{ duration: reducirMovimiento ? 0.01 : 0.45 }}
            style={{ transformOrigin: "180px 104px" }}
          />

          <AnimatePresence>
            {etapa === 1 && !completado && (
              <motion.g key="tierra-cayendo" exit={{ opacity: 0 }}>
                {[0, 1, 2, 3, 4].map((indice) => (
                  <motion.circle
                    key={indice}
                    cx={158 + indice * 11}
                    cy="46"
                    r={2.6 + (indice % 2)}
                    fill="#8a5a3b"
                    initial={reducirMovimiento ? false : { y: -10, opacity: 0 }}
                    animate={
                      reducirMovimiento
                        ? { y: 48, opacity: 0.7 }
                        : { y: [0, 54], opacity: [0, 1, 0] }
                    }
                    transition={{
                      duration: reducirMovimiento ? 0.01 : 0.9,
                      repeat: repetir,
                      repeatDelay: 0.45,
                      delay: indice * 0.1,
                      ease: "easeIn",
                    }}
                  />
                ))}
              </motion.g>
            )}

            {/* Hueco: desaparece cuando se cubre la semilla */}
            {etapa >= 2 && etapa < 4 && (
              <motion.ellipse
                key="hueco"
                cx="180"
                cy="104"
                rx="15"
                ry="4"
                fill="#1f110a"
                initial={reducirMovimiento ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducirMovimiento ? 0.01 : 0.35 }}
                style={{ transformOrigin: "180px 104px" }}
              />
            )}

            {etapa === 3 && (
              <motion.ellipse
                key="semilla"
                cx="180"
                cy="102"
                rx="6"
                ry="4"
                fill="#f1c27d"
                stroke="#b98543"
                strokeWidth="1.5"
                initial={reducirMovimiento ? false : { y: -58, rotate: -40 }}
                animate={{ y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{
                  duration: reducirMovimiento ? 0.01 : 0.6,
                  ease: "easeIn",
                }}
              />
            )}

            {etapa === 4 && !completado && (
              <motion.g key="tierra-cubriendo" exit={{ opacity: 0 }}>
                {[0, 1, 2].map((indice) => (
                  <motion.circle
                    key={indice}
                    cx={172 + indice * 8}
                    cy="56"
                    r="3"
                    fill="#6b4128"
                    initial={reducirMovimiento ? false : { y: 0, opacity: 0 }}
                    animate={
                      reducirMovimiento
                        ? { y: 44, opacity: 0 }
                        : { y: [0, 44], opacity: [0, 1, 0] }
                    }
                    transition={{
                      duration: reducirMovimiento ? 0.01 : 0.8,
                      repeat: repetir,
                      repeatDelay: 0.8,
                      delay: indice * 0.12,
                      ease: "easeIn",
                    }}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* Montículo sobre la semilla */}
          {etapa >= 4 && (
            <motion.path
              d="M158 105 Q180 92 202 105 Z"
              fill="#6b4128"
              initial={reducirMovimiento ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: reducirMovimiento ? 0.01 : 0.4 }}
              style={{ transformOrigin: "180px 105px" }}
            />
          )}

          {completado && (
            <g>
              {/* Regadera */}
              {!reducirMovimiento && (
                <motion.g
                  initial={{ x: 40, y: -10, rotate: 0, opacity: 0 }}
                  animate={{
                    x: [40, 0, 0, 30],
                    y: [-10, 0, 0, -12],
                    rotate: [0, -26, -26, 0],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    times: [0, 0.2, 0.72, 1],
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "272px 48px" }}
                >
                  <rect x="250" y="34" width="46" height="30" rx="9" fill="#7cc6ff" filter={`url(#${id}-sombra)`} />
                  <path d="M252 48 L222 34" stroke="#7cc6ff" strokeWidth="7" strokeLinecap="round" />
                  <rect x="214" y="28" width="12" height="9" rx="3" fill="#3f7fb3" />
                  <path d="M292 38 Q310 48 294 60" fill="none" stroke="#3f7fb3" strokeWidth="6" strokeLinecap="round" />
                  <rect x="256" y="40" width="20" height="4" rx="2" fill="#d9f1ff" opacity="0.7" />
                </motion.g>
              )}
              {!reducirMovimiento &&
                [0, 1, 2, 3, 4].map((indice) => (
                  <motion.path
                    key={indice}
                    d="M0 -4 Q3 0 0 3 Q-3 0 0 -4 Z"
                    fill="#9fe3ff"
                    initial={{ x: 206 - indice * 5, y: 44, opacity: 0 }}
                    animate={{
                      x: 206 - indice * 5 - 14,
                      y: [44, 96],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.55,
                      delay: 0.35 + indice * 0.1,
                      repeat: 1,
                      ease: "easeIn",
                    }}
                  />
                ))}

              {/* Brote */}
              <motion.path
                d="M180 100 C181 90 178 82 180 70"
                fill="none"
                stroke="#5cc48b"
                strokeWidth="5"
                strokeLinecap="round"
                initial={reducirMovimiento ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reducirMovimiento ? 0.01 : 0.55,
                  delay: reducirMovimiento ? 0 : 1.05,
                  ease: "easeOut",
                }}
              />
              <motion.path
                d="M180 76 C176 64 166 58 154 60 C156 72 166 78 180 76 Z"
                fill="#8be0bf"
                stroke="#4d9a82"
                strokeWidth="1.5"
                initial={reducirMovimiento ? false : { scale: 0, rotate: 30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 14,
                  delay: reducirMovimiento ? 0 : 1.45,
                }}
                style={{ transformOrigin: "180px 76px" }}
              />
              <motion.path
                d="M180 72 C184 58 196 52 208 54 C206 67 194 74 180 72 Z"
                fill="#a6f0cf"
                stroke="#4d9a82"
                strokeWidth="1.5"
                initial={reducirMovimiento ? false : { scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 14,
                  delay: reducirMovimiento ? 0 : 1.6,
                }}
                style={{ transformOrigin: "180px 72px" }}
              />
            </g>
          )}
        </>
      )}
    </EscenaAnimacion>
  );
}
