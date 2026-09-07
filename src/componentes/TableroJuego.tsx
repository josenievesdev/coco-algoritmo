"use client";

import { useEffect, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import Bloque from "@/componentes/Bloque";
import {
  ejecutarEfectoAcierto,
  ejecutarEfectoError,
} from "@/motor/efectosJuego";
import { useEstadoJuego } from "@/juegos/estadoJuego";

interface PropiedadesTableroJuego {
  alSalir: () => void;
  alCompletar?: () => void;
}

export default function TableroJuego({
  alSalir,
  alCompletar,
}: PropiedadesTableroJuego) {
  const juegoActual = useEstadoJuego((estado) => estado.juegoActual);
  const secuenciaActual = useEstadoJuego((estado) => estado.secuenciaActual);
  const resultado = useEstadoJuego((estado) => estado.resultado);
  const intentos = useEstadoJuego((estado) => estado.intentos);
  const registrarOrden = useEstadoJuego((estado) => estado.registrarOrden);
  const limpiarResultado = useEstadoJuego((estado) => estado.limpiarResultado);
  const [identificadorArrastrado, setIdentificadorArrastrado] = useState<
    string | null
  >(null);
  const referenciaCompletar = useRef(alCompletar);

  useEffect(() => {
    referenciaCompletar.current = alCompletar;
  }, [alCompletar]);

  useEffect(() => {
    if (resultado === "exito") {
      ejecutarEfectoAcierto();
      const temporizador = window.setTimeout(() => {
        referenciaCompletar.current?.();
      }, 1800);

      return () => window.clearTimeout(temporizador);
    }

    if (resultado === "error") {
      ejecutarEfectoError();
      const temporizador = window.setTimeout(limpiarResultado, 620);

      return () => window.clearTimeout(temporizador);
    }
  }, [limpiarResultado, resultado]);

  const sensores = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 140, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function comenzarArrastre(evento: DragStartEvent): void {
    setIdentificadorArrastrado(String(evento.active.id));
  }

  function terminarArrastre(evento: DragEndEvent): void {
    const { active, over } = evento;
    setIdentificadorArrastrado(null);

    if (!over || active.id === over.id || resultado === "exito") {
      return;
    }

    const indiceOrigen = secuenciaActual.indexOf(String(active.id));
    const indiceDestino = secuenciaActual.indexOf(String(over.id));

    if (indiceOrigen === -1 || indiceDestino === -1) {
      return;
    }

    registrarOrden(arrayMove(secuenciaActual, indiceOrigen, indiceDestino));
  }

  const bloqueArrastrado = identificadorArrastrado
    ? secuenciaActual.find((bloque) => bloque === identificadorArrastrado)
    : undefined;
  const indiceBloqueArrastrado = identificadorArrastrado
    ? secuenciaActual.indexOf(identificadorArrastrado)
    : -1;

  return (
    <main className="min-h-screen overflow-hidden px-4 py-4 text-[#f9efdb] sm:px-7 sm:py-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col">
        <header className="flex items-center justify-between border-b border-[#f9efdb]/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7c948] font-black text-[#21183f] shadow-[0_4px_0_#b99732]">
              C
            </div>
            <div className="leading-none">
              <p className="text-base font-black tracking-[-0.06em]">COCO</p>
              <p className="mt-1 text-[0.55rem] font-bold tracking-[0.3em] text-[#8be0bf]">
                ALGORITMO
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="hidden text-[0.6rem] font-black tracking-[0.15em] text-[#f9efdb]/40 sm:block">
              RETO EN CURSO
            </div>
            <div className="rounded-full border border-[#f7c948]/50 px-3 py-1.5 text-xs font-black text-[#f7c948]">
              01 / 01
            </div>
          </div>
        </header>

        <div className="grid flex-1 items-start gap-10 py-9 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16 lg:py-14">
          <section className="mx-auto w-full max-w-2xl">
            <div className="mb-8 flex items-start justify-between gap-5">
              <div>
                <div className="mb-4 flex items-center gap-2 text-[0.65rem] font-black tracking-[0.18em] text-[#8be0bf]">
                  <span className="h-2 w-2 rounded-full bg-[#8be0bf]" />
                  RETO COTIDIANO
                </div>
                <h1 className="text-4xl font-black leading-none tracking-[-0.07em] text-[#f9efdb] sm:text-6xl">
                  {juegoActual.nombre}
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-6 text-[#f9efdb]/55 sm:text-base">
                  {juegoActual.instruccion}
                </p>
              </div>
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-3xl border-2 border-[#f7c948] bg-[#f7c948]/15 text-2xl font-black text-[#f7c948] sm:flex">
                C
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-black tracking-[0.16em] text-[#f9efdb]/45">
                TU SECUENCIA
              </p>
              <p className="text-xs font-bold text-[#f9efdb]/35">
                Arrastra para ordenar
              </p>
            </div>

            <DndContext
              sensors={sensores}
              collisionDetection={closestCenter}
              onDragStart={comenzarArrastre}
              onDragCancel={() => setIdentificadorArrastrado(null)}
              onDragEnd={terminarArrastre}
            >
              <SortableContext
                items={secuenciaActual}
                strategy={verticalListSortingStrategy}
              >
                <motion.div
                  layout
                  role="list"
                  aria-label="Bloques de la secuencia"
                  className={`space-y-3 rounded-[1.65rem] border-2 border-dashed border-[#f9efdb]/15 bg-[#21183f]/45 p-3 sm:p-4 ${
                    resultado === "error" ? "animacion-error border-[#ff725e]/70" : ""
                  } ${resultado === "exito" ? "border-[#8be0bf]/70" : ""}`}
                >
                  {secuenciaActual.map((bloque, indice) => (
                    <Bloque
                      key={bloque}
                      identificador={bloque}
                      texto={bloque}
                      indice={indice}
                      deshabilitado={resultado === "exito"}
                    />
                  ))}
                </motion.div>
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {bloqueArrastrado ? (
                  <Bloque
                    identificador={bloqueArrastrado}
                    texto={bloqueArrastrado}
                    indice={indiceBloqueArrastrado}
                    soloVisual
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            <div className="mt-5 flex items-center gap-3 text-xs font-bold text-[#f9efdb]/38">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#f9efdb]/15 text-sm text-[#f7c948]">
                +
              </span>
              <span>La respuesta se descubre al soltar el último bloque.</span>
            </div>
          </section>

          <aside className="lg:pt-16">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#f9efdb]/15 bg-[#241b48] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:p-6">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#8be0bf]/10 blur-2xl" />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-[0.62rem] font-black tracking-[0.2em] text-[#f9efdb]/45">
                    FICHA DEL RETO
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f7c948] shadow-[0_0_12px_#f7c948]" />
                </div>
                <div className="mb-6 flex h-28 items-center justify-center rounded-2xl border border-[#f7c948]/20 bg-[#17122f]/50">
                  <div className="relative flex h-14 w-20 items-end justify-center rounded-b-[2rem] border-4 border-[#f7c948] bg-[#f7c948]/15 pb-2">
                    <span className="absolute -right-5 top-2 h-9 w-8 rounded-r-full border-4 border-l-0 border-[#f7c948]" />
                    <span className="h-2 w-10 rounded-full bg-[#f7c948]/60" />
                  </div>
                </div>
                <h2 className="text-2xl font-black tracking-[-0.05em]">
                  {juegoActual.nombre}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#f9efdb]/55">
                  {juegoActual.descripcion}
                </p>
                <div className="mt-6 border-t border-[#f9efdb]/10 pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#f9efdb]/40">INTENTOS</span>
                    <span className="font-black text-[#f7c948]">
                      {String(intentos).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#17122f]">
                    <motion.div
                      className="h-full rounded-full bg-[#8be0bf]"
                      animate={{ width: `${Math.min(100, (intentos / 5) * 100)}%` }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {resultado === "exito" && (
                <motion.div
                  key="exito"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="sombra-neon mt-4 rounded-[1.5rem] border-2 border-[#8be0bf] bg-[#8be0bf] p-5 text-[#21183f]"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-[0.65rem] font-black tracking-[0.18em]">
                    SECUENCIA DESBLOQUEADA
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.05em]">
                    Café listo.
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#21183f]/65">
                    El orden encajó a la perfección.
                  </p>
                </motion.div>
              )}
              {resultado === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="sombra-coral mt-4 rounded-[1.5rem] border-2 border-[#ff725e] bg-[#ff725e] p-5 text-[#21183f]"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-[0.65rem] font-black tracking-[0.18em]">
                    ALGO NO ENCAJA
                  </p>
                  <p className="mt-2 text-xl font-black tracking-[-0.04em]">
                    Cambia el orden.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>

        <footer className="flex items-center justify-between border-t border-[#f9efdb]/10 pt-5">
          <button
            type="button"
            onClick={alSalir}
            className="group inline-flex items-center gap-3 text-xs font-black tracking-[0.12em] text-[#f9efdb]/45 transition-colors hover:text-[#f9efdb]"
          >
            <span className="transition-transform group-hover:-translate-x-1">&lt;-</span>
            VOLVER AL INICIO
          </button>
          <span className="hidden text-[0.62rem] font-black tracking-[0.16em] text-[#f9efdb]/25 sm:block">
            COCO ALGORITMO / SALA DE JUEGO
          </span>
        </footer>
      </div>
    </main>
  );
}
