"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PropiedadesBloque {
  identificador: string;
  texto: string;
  indice: number;
  soloVisual?: boolean;
  deshabilitado?: boolean;
  estaEnPosicionCorrecta?: boolean;
}

export default function Bloque({
  identificador,
  texto,
  indice,
  soloVisual = false,
  deshabilitado = false,
  estaEnPosicionCorrecta = false,
}: PropiedadesBloque) {
  const reducirMovimiento = useReducedMotion();
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
      initial={reducirMovimiento ? false : { opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isDragging && !reducirMovimiento ? 1.03 : 1,
        rotate: isDragging && !reducirMovimiento ? -1 : 0,
      }}
      transition={{
        duration: reducirMovimiento ? 0.01 : 0.22,
        ease: "easeOut",
      }}
      className={`group relative flex min-h-16 items-center gap-3 overflow-hidden rounded-2xl border-2 bg-[#fff8e9] px-3 py-3 text-left text-[#21183f] select-none sm:min-h-[4.5rem] sm:px-4 ${
        soloVisual
          ? "cursor-grabbing border-[#f7c948] shadow-[0_10px_0_#b99732]"
          : "cursor-grab touch-pan-y active:cursor-grabbing"
      } ${
        estaEnPosicionCorrecta
          ? "border-[#8be0bf] shadow-[0_8px_0_#4d9a82,0_0_24px_rgba(139,224,191,0.16)]"
          : "border-[#ead9b9] shadow-[0_8px_0_#d8c8a9]"
      } ${isDragging ? "z-20 shadow-[0_18px_0_#b99732]" : ""}`}
      {...(soloVisual ? {} : attributes)}
      {...(soloVisual ? {} : listeners)}
      role="listitem"
      aria-label={`Bloque ${texto}. Posición ${indice + 1}`}
    >
      <span
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent ${
          estaEnPosicionCorrecta ? "opacity-100" : "opacity-55"
        }`}
        aria-hidden="true"
      />
      <motion.span
        initial={false}
        animate={{
          backgroundColor: estaEnPosicionCorrecta ? "#8be0bf" : "#21183f",
          color: estaEnPosicionCorrecta ? "#17122f" : "#f7c948",
          rotateX:
            estaEnPosicionCorrecta && !reducirMovimiento ? [0, 12, 0] : 0,
        }}
        transition={{
          duration: reducirMovimiento ? 0.01 : 0.32,
          ease: "easeOut",
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
      >
        {String(indice + 1).padStart(2, "0")}
      </motion.span>
      <span className="min-w-0 flex-1 text-base font-bold leading-tight sm:text-lg">
        {texto}
      </span>
      <AnimatePresence>
        {estaEnPosicionCorrecta && !soloVisual && (
          <motion.span
            initial={
              reducirMovimiento
                ? false
                : { opacity: 0, scale: 0.3, rotate: -25 }
            }
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#8be0bf] text-xs font-black text-[#17122f]"
            aria-label="Posición correcta"
          >
            ✓
          </motion.span>
        )}
      </AnimatePresence>
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
