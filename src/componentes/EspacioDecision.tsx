"use client";

import { useDroppable } from "@dnd-kit/core";
import FichaDecision from "@/componentes/FichaDecision";
import type {
  EspacioDecision as DatosEspacio,
  FichaDecision as DatosFicha,
} from "@/tipos/juego";

const textoAcepta = {
  condicion: "CONDICIÓN",
  accion: "ACCIÓN",
  cualquiera: "CUALQUIER FICHA",
} as const;

const textoAccesibleAcepta = {
  condicion: "acepta una condición",
  accion: "acepta una acción",
  cualquiera: "acepta cualquier ficha",
} as const;

interface PropiedadesEspacioDecision {
  espacio: DatosEspacio;
  nombreZona: string;
  ficha: DatosFicha | null;
  fichaSeleccionada: DatosFicha | null;
  seleccionada: boolean;
  deshabilitado: boolean;
  alPulsarEspacio: () => void;
  alRetirar: () => void;
}

export default function EspacioDecision({
  espacio,
  nombreZona,
  ficha,
  fichaSeleccionada,
  seleccionada,
  deshabilitado,
  alPulsarEspacio,
  alRetirar,
}: PropiedadesEspacioDecision) {
  const { setNodeRef, isOver } = useDroppable({
    id: `espacio:${espacio.identificador}`,
    data: { espacio: espacio.identificador },
    disabled: deshabilitado,
  });
  const acepta = espacio.acepta;
  const puedeRecibir =
    fichaSeleccionada !== null &&
    (acepta === "cualquiera" || acepta === fichaSeleccionada.tipo);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 border-dashed p-1.5 transition-colors ${
        isOver
          ? "border-[#f7c948] bg-[#f7c948]/10"
          : puedeRecibir
            ? "border-[#f9efdb]/55 bg-[#f9efdb]/5"
            : "border-[#f9efdb]/18"
      }`}
    >
      {ficha ? (
        <div className="flex items-stretch gap-1.5">
          <div className="min-w-0 flex-1">
            <FichaDecision
              ficha={ficha}
              descripcion={
                fichaSeleccionada && !seleccionada
                  ? `${ficha.texto}, en ${nombreZona}. Pulsa para cambiarla por ${fichaSeleccionada.texto}.`
                  : `${ficha.texto}, en ${nombreZona}. Pulsa para moverla a otro espacio.`
              }
              seleccionada={seleccionada}
              deshabilitada={deshabilitado}
              alPulsar={alPulsarEspacio}
            />
          </div>
          {!deshabilitado && (
            <button
              type="button"
              onClick={alRetirar}
              className="flex w-12 shrink-0 items-center justify-center rounded-xl border border-[#f9efdb]/15 bg-[#2b2151] text-lg font-black text-[#f9efdb]/75 transition-colors hover:border-[#ff725e]/60 hover:text-[#ff725e]"
              aria-label={`Quitar ${ficha.texto} de ${nombreZona}`}
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={alPulsarEspacio}
          disabled={deshabilitado}
          className="flex min-h-12 w-full items-center justify-center rounded-xl px-3 text-center text-xs font-black tracking-[0.12em] text-[#f9efdb]/55 transition-colors hover:text-[#f9efdb]/85"
          aria-label={`Espacio ${nombreZona}, ${textoAccesibleAcepta[acepta]}, vacío.${
            fichaSeleccionada
              ? puedeRecibir
                ? ` Pulsa para colocar ${fichaSeleccionada.texto}.`
                : ` ${fichaSeleccionada.texto} no cabe aquí.`
              : " Elige primero una ficha."
          }`}
        >
          {fichaSeleccionada && puedeRecibir
            ? `COLOCAR «${fichaSeleccionada.texto.toUpperCase()}»`
            : textoAcepta[acepta]}
        </button>
      )}
    </div>
  );
}
