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

function dibujarSalir(
  estado: EstadoEscenario,
  { reducirMovimiento, retraso }: ContextoDibujo,
) {
  const frio = estado === true;
  const calor = estado === false;
  const alturaColumna = frio ? 14 : calor ? 58 : 34;
  const colorColumna = frio ? "#7cc6ff" : calor ? "#ff725e" : "#8a93b8";
  const colorRopa = frio ? "#3f7fb3" : calor ? "#f7c948" : "#6b4fa3";
  const transicion = (extra: number) =>
    reducirMovimiento
      ? { duration: 0.01 }
      : { duration: 0.4, delay: retraso + extra };

  return (
    <g>
      <rect x="4" y="136" width="130" height="6" rx="3" fill="#f9efdb" fillOpacity="0.15" />

      {/* Termómetro */}
      <rect x="10" y="20" width="12" height="84" rx="6" fill="#231a45" stroke="#f9efdb" strokeWidth="2" />
      <motion.rect
        x="13"
        width="6"
        rx="3"
        fill={colorColumna}
        initial={reducirMovimiento ? false : { y: 100, height: 0 }}
        animate={{ y: 100 - alturaColumna, height: alturaColumna }}
        transition={transicion(0)}
      />
      <circle cx="16" cy="110" r="9" fill={colorColumna} stroke="#f9efdb" strokeWidth="2" />
      {frio && (
        <path d="M36 22 V38 M29 26 L43 34 M29 34 L43 26" stroke="#c9f1ff" strokeWidth="2.2" strokeLinecap="round" />
      )}
      {calor && <circle cx="36" cy="30" r="7" fill="#f7c948" />}

      {/* Puerta que se abre en ambos casos (DESPUÉS) */}
      <rect x="106" y="40" width="28" height="98" rx="3" fill="#231a45" />
      <motion.g
        initial={false}
        animate={{ scaleX: estado === null ? 1 : 0.3 }}
        transition={transicion(1.2)}
        style={{ transformOrigin: "134px 90px" }}
      >
        <rect x="106" y="40" width="28" height="98" rx="3" fill="#b0703f" stroke="#8a5a3b" strokeWidth="2" />
        <circle cx="112" cy="92" r="2.5" fill="#f7c948" />
      </motion.g>

      {/* Personaje: se viste y camina hacia la puerta */}
      <motion.g
        initial={false}
        animate={{ x: estado === null ? 0 : 22 }}
        transition={transicion(1.4)}
      >
        <Personaje x={62} y={92} colorRopa={colorRopa} />
        {frio && (
          <motion.g
            initial={reducirMovimiento ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transicion(0.5)}
            style={{ transformOrigin: "62px 110px" }}
          >
            <path d="M48 100 L44 124 M76 100 L80 124" stroke="#3f7fb3" strokeWidth="6" strokeLinecap="round" />
            <path d="M56 96 L62 104 L68 96" stroke="#c9f1ff" strokeWidth="2.5" fill="none" />
            <path d="M62 104 V124" stroke="#c9f1ff" strokeWidth="1.5" />
          </motion.g>
        )}
        {calor && (
          <motion.g
            initial={reducirMovimiento ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transicion(0.5)}
            style={{ transformOrigin: "62px 110px" }}
          >
            <path d="M49 100 L45 108 M75 100 L79 108" stroke="#f7c948" strokeWidth="6" strokeLinecap="round" />
            <circle cx="62" cy="112" r="3" fill="#ff725e" />
          </motion.g>
        )}
      </motion.g>

      {estado === null && <Interrogacion x={36} y={30} />}
    </g>
  );
}

export default function AnimacionSalir(propiedades: PropiedadesAnimacionDecision) {
  return (
    <SimulacionDecision
      {...propiedades}
      etiqueta="Escena: prepararse para salir"
      colorHalo="#ff725e"
      textoFinal="¡Listo para salir!"
      escenarios={["Día frío", "Día cálido"]}
      dibujar={dibujarSalir}
    />
  );
}
