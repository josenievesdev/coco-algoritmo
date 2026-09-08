"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { EvaluacionSecuencia } from "@/tipos/juego";

interface PropiedadesIndicadorProgresoCafe {
  evaluacion: EvaluacionSecuencia;
}

export default function IndicadorProgresoCafe({
  evaluacion,
}: PropiedadesIndicadorProgresoCafe) {
  const reducirMovimiento = useReducedMotion();
  const total = evaluacion.posicionesCorrectas.length;

  return (
    <div>
      <div className="mb-2.5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.58rem] font-black tracking-[0.2em] text-[#f9efdb]/40">
            CADENA ACTIVA
          </p>
          <p className="mt-1 text-xs font-bold text-[#f9efdb]/72">
            {evaluacion.estado === "completa"
              ? "Todos los pasos conectados"
              : evaluacion.pasosConsecutivosCorrectos > 0
                ? `${evaluacion.pasosConsecutivosCorrectos} de ${total} pasos conectados`
                : "Encuentra el primer paso"}
          </p>
        </div>
        <motion.span
          key={evaluacion.porcentajeProgreso}
          initial={
            reducirMovimiento ? false : { scale: 0.78, opacity: 0 }
          }
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-black tabular-nums text-[#8be0bf]"
        >
          {evaluacion.porcentajeProgreso}%
        </motion.span>
      </div>

      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${Math.max(total, 1)}, 1fr)` }}
        aria-label={`${evaluacion.pasosConsecutivosCorrectos} de ${total} pasos consecutivos correctos`}
      >
        {evaluacion.posicionesCorrectas.map((estaCorrecta, indice) => {
          const estaConectada =
            indice < evaluacion.pasosConsecutivosCorrectos;

          return (
            <motion.span
              key={indice}
              initial={false}
              animate={{
                scaleY: estaConectada ? 1 : 0.72,
                opacity: estaConectada || estaCorrecta ? 1 : 0.28,
              }}
              transition={{
                duration: reducirMovimiento ? 0.01 : 0.28,
                ease: "easeOut",
              }}
              className={`h-2 origin-bottom rounded-full ${
                estaConectada
                  ? "bg-[#8be0bf] shadow-[0_0_12px_rgba(139,224,191,0.55)]"
                  : estaCorrecta
                    ? "bg-[#f7c948]"
                    : "bg-[#f9efdb]/25"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
