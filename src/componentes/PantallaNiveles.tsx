"use client";

import { motion, useReducedMotion } from "framer-motion";
import BotonVolver from "@/componentes/BotonVolver";
import EncabezadoMarca from "@/componentes/EncabezadoMarca";
import IconoNivel from "@/componentes/IconoNivel";
import {
  contarNivelesCompletados,
  obtenerEstadoNivel,
  obtenerNivelesDeMundo,
} from "@/datos/juegosDisponibles";
import type { Mundo, Nivel } from "@/tipos/juego";

interface PropiedadesPantallaNiveles {
  mundo: Mundo;
  nivelesCompletados: readonly string[];
  hidratado: boolean;
  alElegirNivel: (nivel: Nivel) => void;
  alVolver: () => void;
}

const textoEstado = {
  completado: "SUPERADO",
  disponible: "JUGAR",
  bloqueado: "BLOQUEADO",
} as const;

export default function PantallaNiveles({
  mundo,
  nivelesCompletados,
  hidratado,
  alElegirNivel,
  alVolver,
}: PropiedadesPantallaNiveles) {
  const reducirMovimiento = useReducedMotion();
  const niveles = obtenerNivelesDeMundo(mundo.identificador);
  const completados = contarNivelesCompletados(
    mundo.identificador,
    nivelesCompletados,
  );
  const total = niveles.length;
  const porcentaje = total ? Math.round((completados / total) * 100) : 0;

  return (
    <main className="area-segura-juego relative isolate min-h-dvh overflow-x-clip pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-[#f9efdb] sm:py-6">
      <div
        className="textura-puntos pointer-events-none absolute inset-0 -z-20 opacity-25"
        aria-hidden="true"
      />
      <EncabezadoMarca
        lateral={
          <div className="rounded-full border border-[#f7c948]/45 px-3 py-1.5 text-xs font-black tabular-nums text-[#f7c948]">
            {hidratado ? completados : "–"} / {total}
          </div>
        }
      >
        <BotonVolver
          etiqueta="MUNDOS"
          descripcion="Volver a la selección de mundos"
          alPulsar={alVolver}
        />
      </EncabezadoMarca>

      <section className="mx-auto w-full max-w-7xl py-9 sm:py-12">
        <motion.div
          initial={reducirMovimiento ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-[#8be0bf]">
              <span className="h-2 w-2 rounded-full bg-[#8be0bf] shadow-[0_0_10px_rgba(139,224,191,0.7)]" />
              MUNDO {String(mundo.numero).padStart(2, "0")} ·{" "}
              {mundo.concepto.toUpperCase()}
            </p>
            <h1 className="mt-4 text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[0.9] tracking-[-0.07em]">
              {mundo.titulo}
            </h1>
            <p className="mt-4 text-base leading-7 text-[#f9efdb]/65">
              {mundo.descripcion} Supera un nivel para abrir el siguiente.
            </p>
          </div>

          <div
            className="w-full rounded-2xl border border-[#f9efdb]/12 bg-[#241b48] p-4 lg:max-w-xs"
            role="group"
            aria-label={`Progreso del mundo: ${hidratado ? completados : 0} de ${total} niveles superados`}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-black tracking-[0.14em] text-[#f9efdb]/50">
                  PROGRESO DEL MUNDO
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums text-[#8be0bf]">
                  {hidratado ? `${completados} de ${total}` : `– de ${total}`}
                </p>
              </div>
              <p className="text-sm font-black tabular-nums text-[#f9efdb]/60">
                {hidratado ? `${porcentaje}%` : ""}
              </p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#f9efdb]/12">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#8be0bf] to-[#f7c948]"
                initial={false}
                animate={{ width: `${hidratado ? porcentaje : 0}%` }}
                transition={{ duration: reducirMovimiento ? 0.01 : 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        <ol className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          <span
            className="pointer-events-none absolute left-[10%] right-[10%] top-[3.25rem] hidden border-t-2 border-dashed border-[#f9efdb]/12 lg:block"
            aria-hidden="true"
          />
          {niveles.map((nivel, indice) => {
            const estado = hidratado
              ? obtenerEstadoNivel(nivel, nivelesCompletados)
              : "bloqueado";
            const bloqueado = estado === "bloqueado";
            const completado = estado === "completado";
            const numero = String(nivel.numero).padStart(2, "0");
            const accion = completado
              ? "Superado. Jugar de nuevo."
              : bloqueado
                ? "Bloqueado. Supera el nivel anterior para abrirlo."
                : "Disponible. Jugar.";

            return (
              <motion.li
                key={nivel.identificador}
                className="relative"
                initial={reducirMovimiento ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.06 + indice * 0.06 }}
              >
                <button
                  type="button"
                  disabled={bloqueado}
                  onClick={() => alElegirNivel(nivel)}
                  aria-label={`Nivel ${numero}: ${nivel.titulo}. ${accion}`}
                  className={`group relative flex h-full min-h-[11rem] w-full flex-col rounded-[1.6rem] border-2 p-4 text-left transition-all sm:p-5 ${
                    completado
                      ? "cursor-pointer border-[#8be0bf]/70 bg-[#1f3a3d]/70 hover:-translate-y-1 active:translate-y-0.5"
                      : bloqueado
                        ? "cursor-not-allowed border-dashed border-[#f9efdb]/15 bg-[#1b1538]/70"
                        : "sombra-neon cursor-pointer border-[#f7c948] bg-[#241b48] hover:-translate-y-1 active:translate-y-0.5"
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <motion.span
                      className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-2"
                      style={{
                        borderColor: bloqueado
                          ? "rgba(249,239,219,0.18)"
                          : nivel.tema.color,
                        backgroundColor: bloqueado
                          ? "transparent"
                          : completado
                            ? `${nivel.tema.color}26`
                            : nivel.tema.color,
                        color: bloqueado
                          ? "rgba(249,239,219,0.4)"
                          : completado
                            ? nivel.tema.color
                            : "#21183f",
                        boxShadow:
                          !bloqueado && !completado
                            ? `0 5px 0 ${nivel.tema.sombra}`
                            : "none",
                      }}
                      animate={
                        estado === "disponible" && !reducirMovimiento
                          ? { y: [0, -3, 0] }
                          : { y: 0 }
                      }
                      transition={{
                        duration: 1.8,
                        repeat:
                          estado === "disponible" && !reducirMovimiento
                            ? Infinity
                            : 0,
                        ease: "easeInOut",
                      }}
                    >
                      <IconoNivel
                        tipo={bloqueado ? "candado" : nivel.icono}
                        className="h-8 w-8"
                      />
                    </motion.span>
                    <span className="text-3xl font-black tabular-nums tracking-[-0.06em] text-[#f9efdb]/25">
                      {numero}
                    </span>
                  </span>

                  <span
                    className={`mt-4 block flex-1 text-lg font-black leading-tight tracking-[-0.03em] ${
                      bloqueado ? "text-[#f9efdb]/45" : "text-[#f9efdb]"
                    }`}
                  >
                    {nivel.titulo}
                  </span>

                  <span className="mt-4 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-black tracking-[0.1em] ${
                        completado
                          ? "bg-[#8be0bf] text-[#17122f]"
                          : bloqueado
                            ? "border border-[#f9efdb]/15 text-[#f9efdb]/50"
                            : "bg-[#f7c948] text-[#21183f]"
                      }`}
                    >
                      {completado ? (
                        <span aria-hidden="true">✓</span>
                      ) : bloqueado ? (
                        <IconoNivel tipo="candado" className="h-3 w-3" />
                      ) : (
                        <span aria-hidden="true">▶</span>
                      )}
                      {textoEstado[estado]}
                    </span>
                    {completado && (
                      <span className="text-xs font-black tracking-[0.08em] text-[#8be0bf]/85 transition-colors group-hover:text-[#8be0bf]">
                        REPETIR ↻
                      </span>
                    )}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
