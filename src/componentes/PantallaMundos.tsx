"use client";

import { motion, useReducedMotion } from "framer-motion";
import AvisoAlmacenamiento from "@/componentes/AvisoAlmacenamiento";
import BotonVolver from "@/componentes/BotonVolver";
import EncabezadoMarca from "@/componentes/EncabezadoMarca";
import IconoNivel from "@/componentes/IconoNivel";
import {
  contarNivelesCompletados,
  mundosDisponibles,
  obtenerEstadoMundo,
  obtenerMundo,
  obtenerNivel,
  obtenerNivelesDeMundo,
} from "@/datos/juegosDisponibles";
import type {
  EstadoMundoCalculado,
  IdentificadorMundo,
  Mundo,
} from "@/tipos/juego";

const textoEstadoMundo: Record<EstadoMundoCalculado, string> = {
  disponible: "DISPONIBLE",
  completado: "COMPLETADO",
  bloqueado: "BLOQUEADO",
  proximamente: "PRÓXIMAMENTE",
};

function describirRequisito(
  mundo: Mundo,
  nivelesCompletados: readonly string[],
): { titulo: string; logrados: number; total: number } | null {
  if (!mundo.requisito) {
    return null;
  }

  const primerNivel = obtenerNivel(mundo.requisito.niveles[0] ?? "");
  const mundoRequerido = primerNivel
    ? obtenerMundo(primerNivel.identificadorMundo)
    : undefined;

  return {
    titulo: mundoRequerido?.titulo ?? "el mundo anterior",
    logrados: mundo.requisito.niveles.filter((identificador) =>
      nivelesCompletados.includes(identificador),
    ).length,
    total: mundo.requisito.niveles.length,
  };
}

interface PropiedadesPantallaMundos {
  nivelesCompletados: readonly string[];
  hidratado: boolean;
  alElegirMundo: (identificador: IdentificadorMundo) => void;
  alVolver: () => void;
}

export default function PantallaMundos({
  nivelesCompletados,
  hidratado,
  alElegirMundo,
  alVolver,
}: PropiedadesPantallaMundos) {
  const reducirMovimiento = useReducedMotion();

  return (
    <main className="area-segura-juego relative isolate min-h-dvh overflow-x-clip pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-[#f9efdb] sm:py-6">
      <div
        className="textura-puntos pointer-events-none absolute inset-0 -z-20 opacity-25"
        aria-hidden="true"
      />
      <EncabezadoMarca
        lateral={
          <div className="rounded-full border border-[#f9efdb]/20 px-3 py-2 text-[0.7rem] font-black tracking-[0.18em] text-[#f9efdb]/60">
            MAPA
          </div>
        }
      >
        <BotonVolver
          etiqueta="INICIO"
          descripcion="Volver al inicio"
          alPulsar={alVolver}
        />
      </EncabezadoMarca>
      <AvisoAlmacenamiento />

      <section className="mx-auto w-full max-w-7xl py-10 sm:py-14">
        <motion.div
          initial={reducirMovimiento ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <p className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-[#8be0bf]">
            <span className="h-2 w-2 rounded-full bg-[#8be0bf] shadow-[0_0_10px_rgba(139,224,191,0.7)]" />
            ELIGE TU MUNDO
          </p>
          <h1 className="mt-4 text-[clamp(2.6rem,8vw,4.75rem)] font-black leading-[0.9] tracking-[-0.07em]">
            Cada mundo, un
            <span className="text-[#f7c948]"> nuevo poder.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-[#f9efdb]/65">
            Supera los retos de un mundo para dominar su idea y preparar el
            siguiente viaje.
          </p>
        </motion.div>

        <ol className="mt-10 grid gap-5 lg:grid-cols-3 lg:gap-6">
          {mundosDisponibles.map((mundo, indice) => {
            const estado: EstadoMundoCalculado = hidratado
              ? obtenerEstadoMundo(mundo, nivelesCompletados)
              : mundo.estado === "proximamente"
                ? "proximamente"
                : mundo.requisito
                  ? "bloqueado"
                  : "disponible";
            const disponible =
              estado === "disponible" || estado === "completado";
            const total = obtenerNivelesDeMundo(mundo.identificador).length;
            const completados = contarNivelesCompletados(
              mundo.identificador,
              nivelesCompletados,
            );
            const requisito = describirRequisito(mundo, nivelesCompletados);
            const numero = String(mundo.numero).padStart(2, "0");
            const textoProgreso = hidratado
              ? `${completados} de ${total}`
              : `– de ${total}`;
            const descripcionAccesible = disponible
              ? `Mundo ${numero}: ${mundo.titulo}. ${mundo.descripcion} ${
                  estado === "completado" ? "Completado. " : ""
                }Progreso: ${textoProgreso} niveles superados.`
              : estado === "bloqueado" && requisito
                ? `Mundo ${numero}: ${mundo.titulo}. ${mundo.descripcion} Bloqueado: completa ${requisito.titulo} para abrirlo. Llevas ${requisito.logrados} de ${requisito.total}.`
                : `Mundo ${numero}: ${mundo.titulo}. ${mundo.descripcion} Próximamente, todavía no disponible.`;

            return (
              <motion.li
                key={mundo.identificador}
                initial={reducirMovimiento ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 + indice * 0.08 }}
              >
                <button
                  type="button"
                  disabled={!disponible}
                  onClick={() => alElegirMundo(mundo.identificador)}
                  aria-label={descripcionAccesible}
                  className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[1.8rem] border-2 p-5 text-left transition-all sm:p-6 ${
                    disponible
                      ? "sombra-neon cursor-pointer border-[#f7c948]/60 bg-[#241b48] hover:-translate-y-1 active:translate-y-0.5"
                      : "cursor-not-allowed border-dashed border-[#f9efdb]/18 bg-[#1b1538]/70"
                  }`}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-1.5"
                    style={{
                      background: disponible
                        ? "linear-gradient(90deg,#8be0bf,#f7c948,#ff725e)"
                        : "rgba(249,239,219,0.08)",
                    }}
                    aria-hidden="true"
                  />
                  <span className="flex items-start justify-between gap-4">
                    <span
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${
                        disponible ? "" : "opacity-45 grayscale"
                      }`}
                      style={{
                        borderColor: mundo.tema.color,
                        backgroundColor: disponible
                          ? mundo.tema.color
                          : "transparent",
                        color: disponible ? "#21183f" : mundo.tema.color,
                        boxShadow: disponible
                          ? `0 6px 0 ${mundo.tema.sombra}`
                          : "none",
                      }}
                    >
                      <IconoNivel tipo={mundo.icono} className="h-9 w-9" />
                    </span>
                    <span
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-black tracking-[0.12em] ${
                        estado === "completado"
                          ? "bg-[#8be0bf] text-[#17122f]"
                          : disponible
                            ? "bg-[#8be0bf]/15 text-[#8be0bf]"
                            : "border border-[#f9efdb]/15 text-[#f9efdb]/60"
                      }`}
                    >
                      {estado === "completado" && (
                        <span aria-hidden="true">✓</span>
                      )}
                      {!disponible && (
                        <IconoNivel tipo="candado" className="h-3.5 w-3.5" />
                      )}
                      {textoEstadoMundo[estado]}
                    </span>
                  </span>

                  <span
                    className={`mt-6 block text-xs font-black tracking-[0.18em] ${
                      disponible ? "text-[#f9efdb]/55" : "text-[#f9efdb]/40"
                    }`}
                  >
                    MUNDO {numero} · {mundo.concepto.toUpperCase()}
                  </span>
                  <span
                    className={`mt-2 block text-3xl font-black leading-none tracking-[-0.06em] ${
                      disponible ? "text-[#f9efdb]" : "text-[#f9efdb]/55"
                    }`}
                  >
                    {mundo.titulo}
                  </span>
                  <span
                    className={`mt-3 block flex-1 text-sm leading-6 ${
                      disponible ? "text-[#f9efdb]/65" : "text-[#f9efdb]/45"
                    }`}
                  >
                    {mundo.descripcion}
                  </span>

                  {disponible ? (
                    <span className="mt-6 block border-t border-[#f9efdb]/10 pt-5">
                      <span className="flex items-end justify-between gap-3">
                        <span>
                          <span className="block text-[0.7rem] font-black tracking-[0.14em] text-[#f9efdb]/50">
                            NIVELES SUPERADOS
                          </span>
                          <span className="mt-1 block text-2xl font-black tabular-nums text-[#8be0bf]">
                            {textoProgreso}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-3 rounded-xl border-2 border-[#f7c948] bg-[#f7c948] px-4 py-2.5 text-sm font-black tracking-[0.08em] text-[#21183f] shadow-[0_5px_0_#b99732] transition-transform group-hover:-translate-y-0.5">
                          {completados === total && hidratado
                            ? "REPASAR"
                            : completados > 0
                              ? "CONTINUAR"
                              : "ENTRAR"}
                          <span aria-hidden="true">&gt;</span>
                        </span>
                      </span>
                      <span
                        className="mt-4 grid gap-1.5"
                        style={{
                          gridTemplateColumns: `repeat(${Math.max(total, 1)}, 1fr)`,
                        }}
                        aria-hidden="true"
                      >
                        {Array.from({ length: total }, (_, posicion) => (
                          <span
                            key={posicion}
                            className={`h-2 rounded-full ${
                              hidratado && posicion < completados
                                ? "bg-[#8be0bf] shadow-[0_0_10px_rgba(139,224,191,0.5)]"
                                : "bg-[#f9efdb]/18"
                            }`}
                          />
                        ))}
                      </span>
                    </span>
                  ) : estado === "bloqueado" && requisito ? (
                    <span className="mt-6 block border-t border-dashed border-[#f9efdb]/12 pt-5">
                      <span className="flex items-center gap-2 text-sm font-bold text-[#f9efdb]/65">
                        <IconoNivel tipo="candado" className="h-4 w-4 shrink-0" />
                        Completa {requisito.titulo} para abrirlo
                      </span>
                      <span className="mt-2 block text-xs font-black tabular-nums tracking-[0.1em] text-[#f9efdb]/50">
                        {hidratado
                          ? `LLEVAS ${requisito.logrados} DE ${requisito.total}`
                          : `– DE ${requisito.total}`}
                      </span>
                    </span>
                  ) : (
                    <span className="mt-6 flex items-center gap-2 border-t border-dashed border-[#f9efdb]/12 pt-5 text-sm font-bold text-[#f9efdb]/50">
                      <IconoNivel tipo="candado" className="h-4 w-4" />
                      En construcción
                    </span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
