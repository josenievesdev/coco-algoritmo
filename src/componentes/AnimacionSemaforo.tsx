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

function dibujarSemaforo(
  estado: EstadoEscenario,
  { reducirMovimiento, retraso }: ContextoDibujo,
) {
  const verde = estado === true;
  const rojo = estado === false;

  return (
    <g>
      {/* Calle y paso peatonal */}
      <rect x="30" y="112" width="108" height="30" fill="#2b2151" />
      {[0, 1, 2, 3, 4].map((indice) => (
        <rect key={indice} x={40 + indice * 19} y="114" width="10" height="26" rx="2" fill="#f9efdb" fillOpacity="0.7" />
      ))}

      {/* Semáforo */}
      <rect x="14" y="30" width="5" height="112" fill="#8a93b8" />
      <rect x="4" y="18" width="25" height="46" rx="7" fill="#231a45" stroke="#8a93b8" strokeWidth="1.5" />
      <circle cx="16.5" cy="30" r="7.5" fill={rojo ? "#ff725e" : "#5a2f3f"} />
      <circle cx="16.5" cy="51" r="7.5" fill={verde ? "#5cc48b" : "#244a3c"} />
      {(rojo || verde) && (
        <circle
          cx="16.5"
          cy={rojo ? 30 : 51}
          r="11"
          fill={rojo ? "#ff725e" : "#5cc48b"}
          opacity="0.25"
        />
      )}

      {/* Auto que pasa cuando la luz está en rojo */}
      {rojo && (
        <motion.g
          initial={reducirMovimiento ? false : { x: 120 }}
          animate={reducirMovimiento ? { x: 20 } : { x: [120, -90] }}
          transition={{
            duration: reducirMovimiento ? 0.01 : 1.3,
            delay: reducirMovimiento ? 0 : retraso + 0.2,
            ease: "easeInOut",
          }}
        >
          <rect x="40" y="118" width="44" height="16" rx="6" fill="#7cc6ff" />
          <rect x="48" y="110" width="26" height="12" rx="5" fill="#c9f1ff" />
          <circle cx="50" cy="136" r="4" fill="#17122f" />
          <circle cx="74" cy="136" r="4" fill="#17122f" />
        </motion.g>
      )}

      {/* Peatón */}
      <motion.g
        initial={false}
        animate={
          verde && !reducirMovimiento
            ? { x: [0, 64], y: [0, -3, 0, -3, 0] }
            : { x: verde ? 64 : 0, y: 0 }
        }
        transition={{
          duration: reducirMovimiento ? 0.01 : 1.4,
          delay: reducirMovimiento ? 0 : retraso + 0.3,
          ease: "easeInOut",
        }}
      >
        <Personaje x={48} y={64} colorRopa="#8be0bf" />
      </motion.g>
      {rojo && (
        <g transform="translate(66 56)">
          <rect x="-7" y="-9" width="14" height="16" rx="5" fill="#f2c29b" stroke="#c98f68" strokeWidth="1.5" />
          <text x="18" y="4" fontSize="9" fontWeight="900" fill="#f7c948">
            ESPERA
          </text>
        </g>
      )}

      {estado === null && <Interrogacion x={40} y={76} />}
    </g>
  );
}

export default function AnimacionSemaforo(propiedades: PropiedadesAnimacionDecision) {
  return (
    <SimulacionDecision
      {...propiedades}
      etiqueta="Escena: paso peatonal"
      colorHalo="#8be0bf"
      textoFinal="Cruce seguro"
      escenarios={["Luz verde", "Luz roja"]}
      dibujar={dibujarSemaforo}
    />
  );
}
