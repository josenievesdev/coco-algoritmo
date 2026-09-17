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

const ANCHO_BATERIA = 34;

function dibujarCelular(
  estado: EstadoEscenario,
  { reducirMovimiento, retraso }: ContextoDibujo,
) {
  const baja = estado === true;
  const nivelInicial = estado === null ? 0.5 : baja ? 0.15 : 0.85;
  const nivelFinal = baja ? 1 : nivelInicial;
  const colorInicial = estado === null ? "#8a93b8" : baja ? "#ff725e" : "#5cc48b";

  return (
    <g>
      {/* Teléfono */}
      <rect x="39" y="6" width="60" height="112" rx="13" fill="#231a45" stroke="#c9f1ff" strokeWidth="2.5" />
      <rect x="45" y="16" width="48" height="92" rx="6" fill="#2f2560" />
      <rect x="61" y="10" width="16" height="3" rx="1.5" fill="#c9f1ff" opacity="0.6" />

      {/* Batería */}
      <rect x="52" y="52" width="36" height="18" rx="4" fill="none" stroke="#f9efdb" strokeWidth="2" />
      <rect x="88" y="57" width="4" height="8" rx="1.5" fill="#f9efdb" />
      <motion.rect
        x="54"
        y="54"
        height="14"
        rx="2.5"
        initial={false}
        animate={
          baja && !reducirMovimiento
            ? {
                width: [ANCHO_BATERIA * nivelInicial, ANCHO_BATERIA * nivelInicial, ANCHO_BATERIA],
                fill: [colorInicial, colorInicial, "#5cc48b"],
              }
            : {
                width: ANCHO_BATERIA * nivelFinal,
                fill: baja ? "#5cc48b" : colorInicial,
              }
        }
        transition={
          baja && !reducirMovimiento
            ? { duration: 1.5, delay: retraso, times: [0, 0.4, 1] }
            : { duration: 0.01 }
        }
      />

      {baja && (
        <>
          <motion.path
            d="M69 150 V118"
            stroke="#f7c948"
            strokeWidth="5"
            strokeLinecap="round"
            initial={reducirMovimiento ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reducirMovimiento ? 0.01 : 0.5, delay: reducirMovimiento ? 0 : retraso + 0.1 }}
          />
          <motion.path
            d="M72 78 L64 92 H71 L66 104 L78 88 H71 Z"
            fill="#f7c948"
            initial={reducirMovimiento ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducirMovimiento ? 0.01 : 0.35, delay: reducirMovimiento ? 0 : retraso + 0.6 }}
            style={{ transformOrigin: "71px 91px" }}
          />
        </>
      )}

      {estado === false && (
        <motion.path
          d="M62 26 L80 36 L62 46 Z"
          fill="#8be0bf"
          animate={reducirMovimiento ? undefined : { scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, repeat: 2, delay: retraso }}
          style={{ transformOrigin: "68px 36px" }}
        />
      )}

      {estado === null && <Interrogacion x={70} y={92} />}
    </g>
  );
}

export default function AnimacionCelular(propiedades: PropiedadesAnimacionDecision) {
  return (
    <SimulacionDecision
      {...propiedades}
      etiqueta="Escena: batería del celular"
      colorHalo="#f7c948"
      textoFinal="Batería a salvo"
      escenarios={["Batería baja", "Batería alta"]}
      dibujar={dibujarCelular}
    />
  );
}
