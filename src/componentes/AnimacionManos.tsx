"use client";

import { AnimatePresence, motion } from "framer-motion";
import EscenaAnimacion from "@/componentes/EscenaAnimacion";
import type { EvaluacionSecuencia } from "@/tipos/juego";

interface PropiedadesAnimacionManos {
  evaluacion: EvaluacionSecuencia;
  modoCelebracion?: boolean;
}

const etapas = [
  "Grifo cerrado",
  "Agua abierta",
  "Manos mojadas",
  "Jabón aplicado",
  "Manos frotando",
  "Manos enjuagadas",
  "Manos limpias",
];

const formaMano =
  "M-15 36 V2 C-15 -14 -9 -26 0 -26 C9 -26 15 -14 15 2 V36 Z";
const formaPulgar = "M-14 12 C-24 8 -28 -2 -23 -7 C-19 -10 -15 -4 -14 0";

const manchas = [
  [-6, -8, 2.4],
  [5, 6, 2],
  [-3, 20, 2.2],
];

const espuma = [
  [-8, -6, 6],
  [6, -12, 5],
  [2, 8, 7],
  [-7, 22, 5],
  [8, 24, 4],
];

const burbujasFlotantes = [
  [164, 96, 5],
  [196, 88, 4],
  [180, 104, 3],
  [210, 100, 3.5],
];

interface PropiedadesMano {
  lado: "izquierda" | "derecha";
  etapa: number;
  completado: boolean;
  reducirMovimiento: boolean;
  repetir: number;
  id: string;
}

function Mano({
  lado,
  etapa,
  completado,
  reducirMovimiento,
  repetir,
  id,
}: PropiedadesMano) {
  const izquierda = lado === "izquierda";
  const frotando = etapa === 4 && !completado && !reducirMovimiento;
  const desplazamiento = izquierda ? 5 : -5;

  return (
    <g transform={`translate(${izquierda ? 164 : 196} 132) rotate(${izquierda ? 10 : -10})`}>
      <motion.g
        animate={
          frotando
            ? {
                x: [0, desplazamiento, 0],
                y: [0, izquierda ? -5 : 5, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.45, repeat: frotando ? repetir : 0 }}
      >
        <g transform={izquierda ? undefined : "scale(-1 1)"}>
          <rect x="-17" y="32" width="34" height="16" rx="6" fill="#6b4fa3" />
          <motion.path
            d={formaMano}
            initial={false}
            animate={{ fill: completado ? "#ffd9b8" : "#f2c29b" }}
            transition={{ duration: 0.6, delay: completado ? 1 : 0 }}
            stroke="#c98f68"
            strokeWidth="2"
            filter={completado ? `url(#${id}-brillo)` : undefined}
          />
          <path d={formaPulgar} fill="#f2c29b" stroke="#c98f68" strokeWidth="2" />
          <path d="M-8 -14 C-8 -18 -5 -20 -3 -20" stroke="#fff3e6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />

          <AnimatePresence>
            {etapa < 5 && !completado && (
              <motion.g key="manchas" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                {manchas.map(([x, y, radio], indice) => (
                  <circle key={indice} cx={x} cy={y} r={radio} fill="#8a5a3b" opacity="0.75" />
                ))}
              </motion.g>
            )}
            {(etapa === 2 || etapa === 5) && !completado && (
              <motion.g
                key="gotas"
                initial={reducirMovimiento ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[
                  [8, -6],
                  [-4, 10],
                  [6, 22],
                ].map(([x, y], indice) => (
                  <motion.circle
                    key={indice}
                    cx={x}
                    cy={y}
                    r="2.6"
                    fill="#c6fff3"
                    animate={reducirMovimiento ? undefined : { y: [0, 6, 0] }}
                    transition={{ duration: 1.2, repeat: repetir, delay: indice * 0.2 }}
                  />
                ))}
              </motion.g>
            )}
            {(etapa === 3 || etapa === 4) && !completado && (
              <motion.g
                key="espuma"
                initial={reducirMovimiento ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: reducirMovimiento ? 0.01 : 0.35 }}
              >
                {espuma
                  .slice(0, etapa === 4 ? espuma.length : 3)
                  .map(([x, y, radio], indice) => (
                    <circle
                      key={indice}
                      cx={x}
                      cy={y}
                      r={radio}
                      fill="#ffffff"
                      stroke="#e0d4ff"
                      strokeWidth="1"
                      opacity="0.92"
                    />
                  ))}
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      </motion.g>
    </g>
  );
}

export default function AnimacionManos({
  evaluacion,
  modoCelebracion = false,
}: PropiedadesAnimacionManos) {
  return (
    <EscenaAnimacion
      evaluacion={evaluacion}
      modoCelebracion={modoCelebracion}
      etiqueta="Progreso del lavado de manos"
      etapas={etapas}
      colorHalo="#c9a7ff"
    >
      {({ id, etapa, completado, reducirMovimiento, repetir }) => {
        const aguaAbierta =
          !completado && (etapa === 1 || etapa === 2 || etapa === 5);

        return (
          <>
            {/* Lavamanos */}
            <path
              d="M72 176 H288 Q282 212 180 212 Q78 212 72 176 Z"
              fill="#dfe9f0"
              filter={`url(#${id}-sombra)`}
            />
            <rect x="62" y="168" width="236" height="12" rx="6" fill="#f5f9fb" />
            <ellipse cx="180" cy="186" rx="12" ry="3" fill="#9fb2c1" />

            {/* Grifo */}
            <rect x="240" y="56" width="16" height="116" rx="6" fill="#b9c6d2" />
            <rect x="178" y="48" width="78" height="16" rx="8" fill="#dbe4ec" filter={`url(#${id}-sombra)`} />
            <rect x="178" y="48" width="16" height="28" rx="6" fill="#dbe4ec" />
            <path d="M186 52 H246" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            <g transform="translate(248 46)">
              <motion.g
                initial={false}
                animate={{ rotate: aguaAbierta ? -50 : 0 }}
                transition={{ duration: reducirMovimiento ? 0.01 : 0.35 }}
              >
                <rect x="-4" y="-18" width="8" height="18" rx="3" fill="#7cc6ff" />
                <circle cy="-18" r="5" fill="#3f7fb3" />
              </motion.g>
            </g>

            {/* Chorro de agua */}
            <AnimatePresence>
              {aguaAbierta && (
                <motion.g
                  key="chorro"
                  initial={reducirMovimiento ? false : { scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{ duration: reducirMovimiento ? 0.01 : 0.35 }}
                  style={{ transformOrigin: "186px 76px" }}
                >
                  <rect x="181" y="76" width="10" height="96" rx="5" fill="#7cc6ff" opacity="0.7" />
                  <motion.path
                    d="M186 78 V170"
                    stroke="#e4f7ff"
                    strokeWidth="2.5"
                    strokeDasharray="8 12"
                    strokeLinecap="round"
                    animate={reducirMovimiento ? undefined : { strokeDashoffset: [0, -40] }}
                    transition={{ duration: 0.6, repeat: repetir, ease: "linear" }}
                  />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Jabón */}
            <motion.g
              initial={false}
              animate={{ opacity: completado ? 0.35 : 1 }}
            >
              <rect x="82" y="124" width="32" height="46" rx="9" fill="#c9a7ff" filter={`url(#${id}-sombra)`} />
              <rect x="88" y="138" width="20" height="14" rx="4" fill="#ffffff" opacity="0.7" />
              <motion.g
                animate={
                  etapa === 3 && !completado && !reducirMovimiento
                    ? { y: [0, 5, 0] }
                    : { y: 0 }
                }
                transition={{
                  duration: 0.6,
                  repeat: etapa === 3 && !completado ? repetir : 0,
                  repeatDelay: 0.8,
                }}
              >
                <rect x="94" y="108" width="8" height="16" rx="2" fill="#7d62b3" />
                <rect x="94" y="104" width="26" height="6" rx="3" fill="#7d62b3" />
              </motion.g>
            </motion.g>
            <AnimatePresence>
              {etapa === 3 && !completado && !reducirMovimiento && (
                <motion.circle
                  key="gota-jabon"
                  r="5"
                  fill="#ffffff"
                  initial={{ cx: 120, cy: 108, opacity: 0 }}
                  animate={{ cx: [120, 144, 164], cy: [108, 100, 118], opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, repeat: repetir, repeatDelay: 0.6, delay: 0.25 }}
                />
              )}
            </AnimatePresence>

            <Mano
              lado="izquierda"
              etapa={etapa}
              completado={completado}
              reducirMovimiento={reducirMovimiento}
              repetir={repetir}
              id={id}
            />
            <Mano
              lado="derecha"
              etapa={etapa}
              completado={completado}
              reducirMovimiento={reducirMovimiento}
              repetir={repetir}
              id={id}
            />

            {/* Burbujas al frotar */}
            <AnimatePresence>
              {etapa === 4 && !completado && (
                <motion.g key="burbujas" exit={{ opacity: 0 }}>
                  {burbujasFlotantes.map(([x, y, radio], indice) => (
                    <motion.circle
                      key={indice}
                      cx={x}
                      cy={y}
                      r={radio}
                      fill="none"
                      stroke="#e0d4ff"
                      strokeWidth="1.8"
                      initial={reducirMovimiento ? false : { opacity: 0 }}
                      animate={
                        reducirMovimiento
                          ? { opacity: 0.8 }
                          : { opacity: [0, 1, 0], y: [0, -46], scale: [0.6, 1.2] }
                      }
                      transition={{
                        duration: reducirMovimiento ? 0.01 : 1.5,
                        repeat: repetir,
                        delay: indice * 0.3,
                      }}
                    />
                  ))}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Toalla */}
            {completado && !reducirMovimiento && (
              <motion.g
                initial={{ x: -120, opacity: 0 }}
                animate={{ x: [-120, 0, 60, 150], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.3, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
              >
                <rect x="150" y="104" width="60" height="60" rx="10" fill="#f7c948" filter={`url(#${id}-sombra)`} />
                <path d="M150 118 H210 M150 150 H210" stroke="#ff725e" strokeWidth="5" />
              </motion.g>
            )}
          </>
        );
      }}
    </EscenaAnimacion>
  );
}
