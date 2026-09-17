"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { FichaDecision as DatosFicha } from "@/tipos/juego";

const estiloTipo = {
  condicion: {
    etiqueta: "CONDICIÓN",
    borde: "#8be0bf",
    sombra: "#4d9a82",
    fondoEtiqueta: "#d9f7ec",
  },
  accion: {
    etiqueta: "ACCIÓN",
    borde: "#f7c948",
    sombra: "#b99732",
    fondoEtiqueta: "#fff0bf",
  },
} as const;

interface PropiedadesVistaFicha {
  ficha: DatosFicha;
  seleccionada?: boolean;
  flotante?: boolean;
}

/** Aspecto de una ficha. La forma y la etiqueta indican su tipo. */
export function VistaFicha({
  ficha,
  seleccionada = false,
  flotante = false,
}: PropiedadesVistaFicha) {
  const estilo = estiloTipo[ficha.tipo];

  return (
    <span
      className={`flex min-h-12 w-full items-center gap-2.5 rounded-xl border-2 bg-[#fff8e9] px-2.5 py-2 text-left text-[#21183f] transition-transform ${
        seleccionada ? "-translate-y-0.5 ring-4 ring-[#f9efdb]/80" : ""
      } ${flotante ? "rotate-[-1.5deg] scale-[1.03]" : ""}`}
      style={{
        borderColor: estilo.borde,
        boxShadow: `0 ${flotante ? 10 : 5}px 0 ${estilo.sombra}`,
      }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        {ficha.tipo === "condicion" ? (
          <span
            className="h-4 w-4 rotate-45 rounded-[3px] border-2 border-[#21183f]"
            style={{ backgroundColor: estilo.borde }}
          />
        ) : (
          <span
            className="h-4 w-5 rounded-[4px] border-2 border-[#21183f]"
            style={{ backgroundColor: estilo.borde }}
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="mb-0.5 inline-block rounded px-1.5 py-px text-[0.65rem] font-black tracking-[0.1em] text-[#21183f]/75"
          style={{ backgroundColor: estilo.fondoEtiqueta }}
        >
          {estilo.etiqueta}
        </span>
        <span className="block text-[0.95rem] font-bold leading-tight">
          {ficha.texto}
        </span>
      </span>
      {seleccionada && (
        <span className="shrink-0 rounded-md bg-[#21183f] px-1.5 py-0.5 text-[0.65rem] font-black tracking-[0.08em] text-[#f7c948]">
          ELEGIDA
        </span>
      )}
    </span>
  );
}

interface PropiedadesFichaDecision {
  ficha: DatosFicha;
  descripcion: string;
  seleccionada: boolean;
  deshabilitada: boolean;
  alPulsar: () => void;
}

/** Ficha que se puede arrastrar o seleccionar con un toque o el teclado. */
export default function FichaDecision({
  ficha,
  descripcion,
  seleccionada,
  deshabilitada,
  alPulsar,
}: PropiedadesFichaDecision) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `ficha:${ficha.identificador}`,
      data: { ficha: ficha.identificador },
      disabled: deshabilitada,
    });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      onClick={alPulsar}
      disabled={deshabilitada}
      aria-pressed={seleccionada}
      aria-roledescription="ficha"
      aria-label={descripcion}
      className={`block w-full min-w-0 cursor-grab touch-pan-y select-none rounded-xl text-left active:cursor-grabbing disabled:cursor-default ${
        isDragging ? "opacity-35" : ""
      }`}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <VistaFicha ficha={ficha} seleccionada={seleccionada} />
    </button>
  );
}
