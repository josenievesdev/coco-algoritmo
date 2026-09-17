"use client";

import { motion } from "framer-motion";
import SimulacionDecision, {
  Interrogacion,
  Personaje,
} from "@/componentes/SimulacionDecision";
import type {
  ContextoDibujo,
  EstadoEscenario,
  PropiedadesAnimacionDecision,
} from "@/componentes/SimulacionDecision";

function dibujarLluvia(
  estado: EstadoEscenario,
  { reducirMovimiento, retraso }: ContextoDibujo,
) {
  const llueve = estado === true;

  return (
    <g>
      <rect x="6" y="136" width="126" height="6" rx="3" fill="#f9efdb" fillOpacity="0.15" />

      {estado === false ? (
        <g transform="translate(104 26)">
          <motion.g
            animate={reducirMovimiento ? undefined : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {[0, 45, 90, 135].map((angulo) => (
              <path
                key={angulo}
                d="M0 -20 V-14 M0 14 V20"
                stroke="#f7c948"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${angulo})`}
              />
            ))}
          </motion.g>
          <circle r="10" fill="#f7c948" />
        </g>
      ) : (
        <g transform="translate(62 24)" opacity={estado === null ? 0.7 : 1}>
          <ellipse cx="-14" cy="4" rx="16" ry="11" fill={llueve ? "#8a93b8" : "#b8bfd6"} />
          <ellipse cx="6" cy="-2" rx="18" ry="14" fill={llueve ? "#9aa3c8" : "#c9cfe3"} />
          <ellipse cx="22" cy="6" rx="14" ry="10" fill={llueve ? "#8a93b8" : "#b8bfd6"} />
        </g>
      )}

      {llueve &&
        [0, 1, 2, 3, 4, 5].map((indice) => (
          <motion.path
            key={indice}
            d="M0 0 L-3 9"
            stroke="#7cc6ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={reducirMovimiento ? false : { opacity: 0 }}
            animate={
              reducirMovimiento
                ? { x: 40 + indice * 11, y: 60 + (indice % 3) * 18, opacity: 0.8 }
                : {
                    x: 40 + indice * 11,
                    y: [38, 128],
                    opacity: [0, 1, 0],
                  }
            }
            transition={{
              duration: reducirMovimiento ? 0.01 : 0.8,
              repeat: reducirMovimiento ? 0 : 2,
              delay: reducirMovimiento ? 0 : retraso + indice * 0.12,
              ease: "easeIn",
            }}
          />
        ))}

      <Personaje x={69} y={96} colorRopa="#ff725e" />

      {llueve && (
        <motion.g
          initial={reducirMovimiento ? false : { scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={
            reducirMovimiento
              ? { duration: 0.01 }
              : { type: "spring", stiffness: 260, damping: 14, delay: retraso + 0.5 }
          }
          style={{ transformOrigin: "69px 76px" }}
        >
          <path d="M39 76 Q69 40 99 76 Q91 71 84 76 Q76 70 69 76 Q61 70 54 76 Q47 71 39 76 Z" fill="#7cc6ff" stroke="#3f7fb3" strokeWidth="2" />
          <path d="M69 76 V102 Q69 108 75 106" stroke="#f9efdb" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>
      )}

      {estado === null && <Interrogacion x={108} y={70} />}
    </g>
  );
}

export default function AnimacionLluvia(propiedades: PropiedadesAnimacionDecision) {
  return (
    <SimulacionDecision
      {...propiedades}
      etiqueta="Escena: salir de casa"
      colorHalo="#7cc6ff"
      textoFinal="Nadie se moja"
      escenarios={["Día de lluvia", "Día seco"]}
      dibujar={dibujarLluvia}
    />
  );
}
