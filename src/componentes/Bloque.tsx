"use client";

import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PropiedadesBloque {
  identificador: string;
  texto: string;
  indice: number;
  soloVisual?: boolean;
  deshabilitado?: boolean;
}

export default function Bloque({
  identificador,
  texto,
  indice,
  soloVisual = false,
  deshabilitado = false,
}: PropiedadesBloque) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: identificador,
    disabled: soloVisual || deshabilitado,
  });

  const estilo = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={soloVisual ? undefined : setNodeRef}
      style={estilo}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isDragging ? 1.03 : 1,
        rotate: isDragging ? -1 : 0,
      }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`group flex min-h-16 items-center gap-3 rounded-2xl border-2 bg-[#fff8e9] px-3 py-3 text-left text-[#21183f] shadow-[0_8px_0_#d8c8a9] select-none sm:min-h-[4.5rem] sm:px-4 ${
        soloVisual
          ? "cursor-grabbing border-[#f7c948] shadow-[0_10px_0_#b99732]"
          : "cursor-grab border-[#ead9b9] touch-none active:cursor-grabbing"
      } ${isDragging ? "z-20 shadow-[0_18px_0_#b99732]" : ""}`}
      {...(soloVisual ? {} : attributes)}
      {...(soloVisual ? {} : listeners)}
      role="listitem"
      aria-label={`Bloque ${texto}. Posición ${indice + 1}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#21183f] text-sm font-black text-[#f7c948]">
        {String(indice + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1 text-base font-bold leading-tight sm:text-lg">
        {texto}
      </span>
      <span
        className="flex shrink-0 flex-col gap-1 opacity-45 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      >
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#21183f]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#21183f]" />
        </span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#21183f]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#21183f]" />
        </span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#21183f]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#21183f]" />
        </span>
      </span>
    </motion.div>
  );
}
