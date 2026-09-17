"use client";

import { useDroppable } from "@dnd-kit/core";
import FichaDecision from "@/componentes/FichaDecision";
import type { FichaDecision as DatosFicha } from "@/tipos/juego";

interface PropiedadesBandejaFichas {
  fichas: readonly DatosFicha[];
  fichaSeleccionada: string | null;
  bloqueada: boolean;
  alPulsarFicha: (identificadorFicha: string) => void;
}

/** Fichas libres. También recibe las fichas que se sueltan para retirarlas. */
export default function BandejaFichas({
  fichas,
  fichaSeleccionada,
  bloqueada,
  alPulsarFicha,
}: PropiedadesBandejaFichas) {
  const { setNodeRef, isOver } = useDroppable({
    id: "bandeja",
    disabled: bloqueada,
  });

  return (
    <section
      ref={setNodeRef}
      aria-label="Fichas disponibles"
      className={`rounded-2xl border-2 p-3 transition-colors ${
        isOver
          ? "border-[#f7c948] bg-[#2b2151]"
          : "border-[#f9efdb]/12 bg-[#241b48]"
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 className="text-xs font-black tracking-[0.16em] text-[#f9efdb]/70">
          FICHAS DISPONIBLES
        </h2>
        <span className="text-xs font-black tabular-nums text-[#f9efdb]/60">
          {fichas.length}
        </span>
      </div>
      {fichas.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-1">
          {fichas.map((ficha) => (
            <li key={ficha.identificador}>
              <FichaDecision
                ficha={ficha}
                descripcion={`${ficha.texto}, ${
                  ficha.tipo === "condicion" ? "condición" : "acción"
                }, en la bandeja. ${
                  fichaSeleccionada === ficha.identificador
                    ? "Elegida. Ahora pulsa un espacio o Escape para cancelar."
                    : "Pulsa para elegirla."
                }`}
                seleccionada={fichaSeleccionada === ficha.identificador}
                deshabilitada={bloqueada}
                alPulsar={() => alPulsarFicha(ficha.identificador)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-[#f9efdb]/15 px-3 py-3 text-sm font-bold text-[#f9efdb]/55">
          Todas las fichas están en el tablero. Arrastra una aquí para
          retirarla.
        </p>
      )}
    </section>
  );
}
