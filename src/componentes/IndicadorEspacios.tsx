"use client";

import { motion, useReducedMotion } from "framer-motion";

interface PropiedadesIndicadorEspacios {
  llenos: number;
  total: number;
}

/** Progreso neutral: cuenta espacios llenos sin revelar si son correctos. */
export default function IndicadorEspacios({
  llenos,
  total,
}: PropiedadesIndicadorEspacios) {
  const reducirMovimiento = useReducedMotion();

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] font-black tracking-[0.2em] text-[#f9efdb]/45">
            ESPACIOS LLENOS
          </p>
          <p className="mt-1 text-xs font-bold text-[#f9efdb]/72">
            {llenos === total
              ? "Todos los espacios tienen ficha"
              : `Faltan ${total - llenos} de ${total}`}
          </p>
        </div>
        <span className="text-sm font-black tabular-nums text-[#f9efdb]">
          {llenos}/{total}
        </span>
      </div>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${Math.max(total, 1)}, 1fr)` }}
        role="img"
        aria-label={`${llenos} de ${total} espacios llenos`}
      >
        {Array.from({ length: total }, (_, indice) => (
          <motion.span
            key={indice}
            initial={false}
            animate={{ opacity: indice < llenos ? 1 : 0.3 }}
            transition={{ duration: reducirMovimiento ? 0.01 : 0.25 }}
            className={`h-2 rounded-full ${
              indice < llenos ? "bg-[#f9efdb]" : "bg-[#f9efdb]/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
