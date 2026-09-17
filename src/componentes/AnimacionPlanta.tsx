"use client";

import { motion } from "framer-motion";
import SimulacionDecision, {
  Interrogacion,
} from "@/componentes/SimulacionDecision";
import type {
  ContextoDibujo,
  EstadoEscenario,
  PropiedadesAnimacionDecision,
} from "@/componentes/SimulacionDecision";

function dibujarPlanta(
  estado: EstadoEscenario,
  { reducirMovimiento, retraso }: ContextoDibujo,
) {
  const seca = estado === true;
  const humeda = estado === false;
  const colorTierra = seca ? "#c9a27a" : humeda ? "#4a2c1d" : "#8a5a3b";

  return (
    <g>
      {/* Planta: se inclina si la tierra está seca y se levanta al regar */}
      <motion.g
        initial={false}
        animate={
          seca && !reducirMovimiento
            ? { rotate: [14, 14, 0] }
            : { rotate: 0 }
        }
        transition={
          seca && !reducirMovimiento
            ? { duration: 1.6, delay: retraso, times: [0, 0.6, 1] }
            : { duration: 0.01 }
        }
        style={{ transformOrigin: "60px 104px" }}
      >
        <path d="M60 104 C60 90 58 80 60 66" stroke="#5cc48b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M60 80 C50 78 42 70 40 60 C52 60 58 68 60 80 Z" fill="#8be0bf" stroke="#4d9a82" strokeWidth="1.5" />
        <path d="M60 74 C64 62 74 56 84 58 C82 70 72 76 60 74 Z" fill="#a6f0cf" stroke="#4d9a82" strokeWidth="1.5" />
      </motion.g>

      {/* Maceta y tierra */}
      <path d="M32 104 H88 L81 142 H39 Z" fill="#e2714f" />
      <rect x="28" y="98" width="64" height="10" rx="4" fill="#f08a64" />
      <ellipse cx="60" cy="102" rx="28" ry="5" fill={colorTierra} />
      {seca && (
        <path d="M44 102 L50 100 L54 103 M62 101 L68 103 L74 100" stroke="#8a5a3b" strokeWidth="1.3" fill="none" />
      )}
      {humeda &&
        [44, 58, 72].map((x) => (
          <circle key={x} cx={x} cy="101" r="1.8" fill="#7cc6ff" />
        ))}

      {seca && (
        <>
          <motion.g
            initial={reducirMovimiento ? false : { x: 20, opacity: 0, rotate: 0 }}
            animate={
              reducirMovimiento
                ? { x: 0, opacity: 1, rotate: -20 }
                : { x: [20, 0, 0, 16], opacity: [0, 1, 1, 0], rotate: [0, -28, -28, 0] }
            }
            transition={{
              duration: reducirMovimiento ? 0.01 : 1.5,
              delay: reducirMovimiento ? 0 : retraso,
              times: [0, 0.2, 0.75, 1],
            }}
            style={{ transformOrigin: "112px 40px" }}
          >
            <rect x="96" y="28" width="32" height="22" rx="6" fill="#7cc6ff" />
            <path d="M98 38 L80 28" stroke="#7cc6ff" strokeWidth="5" strokeLinecap="round" />
          </motion.g>
          {!reducirMovimiento &&
            [0, 1, 2].map((indice) => (
              <motion.circle
                key={indice}
                r="2.4"
                fill="#9fe3ff"
                initial={{ cx: 78 - indice * 4, cy: 34, opacity: 0 }}
                animate={{ cy: [34, 98], opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: 1, delay: retraso + 0.35 + indice * 0.12 }}
              />
            ))}
        </>
      )}

      {humeda && (
        <g transform="translate(110 36)">
          <circle r="14" fill="#231a45" stroke="#f7c948" strokeWidth="2.5" />
          <motion.path
            d="M0 0 V-9"
            stroke="#f7c948"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={reducirMovimiento ? undefined : { rotate: 360 }}
            transition={{ duration: 1.6, repeat: 1, ease: "linear", delay: retraso }}
          />
          <path d="M0 0 H6" stroke="#f7c948" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {estado === null && (
        <>
          <g transform="translate(92 70) rotate(20)">
            <rect x="-5" y="-22" width="10" height="26" rx="5" fill="#f2c29b" stroke="#c98f68" strokeWidth="1.5" />
          </g>
          <Interrogacion x={112} y={48} />
        </>
      )}
    </g>
  );
}

export default function AnimacionPlanta(propiedades: PropiedadesAnimacionDecision) {
  return (
    <SimulacionDecision
      {...propiedades}
      etiqueta="Escena: cuidar la planta"
      colorHalo="#5cc48b"
      textoFinal="Planta feliz"
      escenarios={["Tierra seca", "Tierra húmeda"]}
      dibujar={dibujarPlanta}
    />
  );
}
