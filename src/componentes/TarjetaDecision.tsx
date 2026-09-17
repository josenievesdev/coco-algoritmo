"use client";

import { motion, useReducedMotion } from "framer-motion";
import EspacioDecision from "@/componentes/EspacioDecision";
import {
  nombresZona,
  obtenerEspaciosDeZona,
} from "@/motor/programaDecision";
import type {
  ErrorDecision,
  FichaDecision,
  NivelDecision,
  ZonaDecision,
} from "@/tipos/juego";

const subtitulosZona: Record<ZonaDecision, string> = {
  antes: "Primero",
  condicion: "Lo que se comprueba",
  entonces: "Si se cumple",
  siNo: "Si no se cumple",
  despues: "Al final, en los dos casos",
};

const coloresZona: Record<ZonaDecision, string> = {
  antes: "#c9a7ff",
  condicion: "#8be0bf",
  entonces: "#f7c948",
  siNo: "#ff9a76",
  despues: "#7cc6ff",
};

/** Mensaje guía para un error. Nunca revela la ficha correcta. */
export function describirError(error: ErrorDecision): string {
  switch (error.tipo) {
    case "ramas-intercambiadas":
      return "Las ramas están al revés: ¿qué haces si la condición se cumple?";
    case "orden-incorrecto":
      return "Revisa qué debe pasar primero.";
    case "tipo-incorrecto":
      return error.zona === "condicion"
        ? "En SI va algo que se pueda comprobar, no una acción."
        : "Aquí va una acción, no una condición.";
    case "distractor":
      return error.zona === "condicion"
        ? "Esa condición no ayuda a decidir."
        : "Esa ficha no ayuda a cumplir el objetivo.";
    case "ficha-fuera-de-lugar":
      return "Esa ficha pertenece a otra parte de la decisión.";
  }
}

interface PropiedadesTarjetaDecision {
  nivel: NivelDecision;
  colocacion: Readonly<Record<string, string | null>>;
  errores: readonly ErrorDecision[];
  zonaPista: ZonaDecision | null;
  fichaSeleccionada: FichaDecision | null;
  espacioSeleccionado: string | null;
  bloqueada: boolean;
  alPulsarEspacio: (identificadorEspacio: string) => void;
  alRetirar: (identificadorEspacio: string) => void;
}

export default function TarjetaDecision({
  nivel,
  colocacion,
  errores,
  zonaPista,
  fichaSeleccionada,
  espacioSeleccionado,
  bloqueada,
  alPulsarEspacio,
  alRetirar,
}: PropiedadesTarjetaDecision) {
  const reducirMovimiento = useReducedMotion();
  const buscarFicha = (identificador: string | null | undefined) =>
    nivel.fichas.find((ficha) => ficha.identificador === identificador) ?? null;

  const zona = (identificadorZona: ZonaDecision, sangria = false) => {
    const espacios = obtenerEspaciosDeZona(nivel, identificadorZona);

    if (espacios.length === 0) {
      return null;
    }

    const nombre = nombresZona[identificadorZona];
    const error = errores.find((candidato) => candidato.zona === identificadorZona);
    const conPista = zonaPista === identificadorZona && !bloqueada;
    const color = coloresZona[identificadorZona];

    return (
      <motion.section
        key={identificadorZona}
        aria-label={`Zona ${nombre}: ${subtitulosZona[identificadorZona]}`}
        animate={
          error && !reducirMovimiento ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }
        }
        transition={{ duration: 0.4 }}
        className={`relative rounded-2xl border-2 bg-[#21183f]/70 p-2.5 sm:p-3 ${
          sangria ? "ml-5 sm:ml-8" : ""
        } ${
          error
            ? "border-[#ff725e]"
            : conPista
              ? "border-[#f7c948]"
              : "border-[#f9efdb]/10"
        }`}
      >
        {sangria && (
          <span
            className="absolute -left-[1.35rem] top-1/2 h-0.5 w-4 bg-[#f9efdb]/25 sm:-left-[2.1rem] sm:w-7"
            aria-hidden="true"
          />
        )}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className="rounded-lg px-2.5 py-1 text-sm font-black tracking-[0.1em] text-[#17122f]"
            style={{ backgroundColor: color }}
          >
            {nombre}
          </span>
          <span className="text-xs font-bold text-[#f9efdb]/60">
            {subtitulosZona[identificadorZona]}
          </span>
          {conPista && !error && (
            <span className="ml-auto rounded-full border border-[#f7c948]/60 px-2 py-0.5 text-[0.7rem] font-black tracking-[0.08em] text-[#f7c948]">
              PISTA: REVISA ESTA ZONA
            </span>
          )}
        </div>
        <div className="space-y-2">
          {espacios.map((espacio) => (
            <EspacioDecision
              key={espacio.identificador}
              espacio={espacio}
              nombreZona={nombre}
              ficha={buscarFicha(colocacion[espacio.identificador])}
              fichaSeleccionada={fichaSeleccionada}
              seleccionada={
                espacioSeleccionado === espacio.identificador &&
                fichaSeleccionada !== null
              }
              deshabilitado={bloqueada}
              alPulsarEspacio={() => alPulsarEspacio(espacio.identificador)}
              alRetirar={() => alRetirar(espacio.identificador)}
            />
          ))}
        </div>
        {error && (
          <p className="mt-2 flex items-start gap-2 text-sm font-bold text-[#ffb3a6]">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#ff725e] text-xs font-black text-[#17122f]"
              aria-hidden="true"
            >
              !
            </span>
            <span>
              {describirError(error)}
              {conPista && " (Pista: empieza por aquí.)"}
            </span>
          </p>
        )}
      </motion.section>
    );
  };

  return (
    <div className="space-y-3">
      {zona("antes")}
      {zona("condicion")}
      {/* Las ramas cuelgan de la condición con una línea guía. */}
      <div className="relative space-y-3 before:absolute before:bottom-6 before:left-2 before:top-0 before:w-0.5 before:bg-[#f9efdb]/25 sm:before:left-3">
        {zona("entonces", true)}
        {zona("siNo", true)}
      </div>
      {zona("despues")}
    </div>
  );
}
