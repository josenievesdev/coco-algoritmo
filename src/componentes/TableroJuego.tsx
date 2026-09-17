"use client";

import { useEffect, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
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
import {
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import AnimacionNivel from "@/componentes/AnimacionNivel";
import Bloque from "@/componentes/Bloque";
import BotonVolver from "@/componentes/BotonVolver";
import IconoNivel from "@/componentes/IconoNivel";
import NotificacionResultado from "@/componentes/NotificacionResultado";
import { obtenerSolucion, useEstadoJuego } from "@/juegos/estadoJuego";
import {
  ejecutarEfectoAcierto,
  ejecutarEfectoEncaje,
  ejecutarEfectoError,
  ejecutarEfectoMovimiento,
} from "@/motor/efectosJuego";
import { evaluarProgresoSecuencia } from "@/motor/evaluarProgresoSecuencia";
import {
  configurarSonidosActivos,
  obtenerEstadoSonidos,
  prepararSonidos,
} from "@/motor/sonidos";
import type { ResultadoJuego } from "@/tipos/juego";

const DURACION_CELEBRACION = 2600;
const DURACION_CELEBRACION_REDUCIDA = 1800;

interface PropiedadesTableroJuego {
  totalNiveles: number;
  textoSiguiente?: string;
  alSalir: () => void;
  alReiniciar: () => void;
  /** Se ejecuta en cuanto la secuencia es correcta, antes de la animación. */
  alSuperar?: () => void;
  /** Se ejecuta al terminar la celebración. */
  alCompletar?: () => void;
}

export default function TableroJuego({
  totalNiveles,
  textoSiguiente,
  alSalir,
  alReiniciar,
  alSuperar,
  alCompletar,
}: PropiedadesTableroJuego) {
  const nivelActual = useEstadoJuego((estado) => estado.nivelActual);
  const secuenciaActual = useEstadoJuego((estado) => estado.secuenciaActual);
  const resultado = useEstadoJuego((estado) => estado.resultado);
  const intentos = useEstadoJuego((estado) => estado.intentos);
  const registrarOrden = useEstadoJuego((estado) => estado.registrarOrden);
  const limpiarResultado = useEstadoJuego((estado) => estado.limpiarResultado);
  const controlesTablero = useAnimationControls();
  const reducirMovimiento = useReducedMotion();
  const [identificadorArrastrado, setIdentificadorArrastrado] = useState<
    string | null
  >(null);
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
  const [sonidosActivos, setSonidosActivos] = useState(obtenerEstadoSonidos);
  const referenciaCompletar = useRef(alCompletar);
  const referenciaSuperar = useRef(alSuperar);
  const referenciaTemporizador = useRef<number | null>(null);
  const evaluacion = evaluarProgresoSecuencia(
    secuenciaActual,
    obtenerSolucion(nivelActual),
  );
  const textosPasos = new Map(
    nivelActual.pasos.map((paso) => [paso.identificador, paso.texto]),
  );
  const obtenerTexto = (identificador: string) =>
    textosPasos.get(identificador) ?? identificador;
  const numeroNivel = String(nivelActual.numero).padStart(2, "0");

  useEffect(() => {
    referenciaCompletar.current = alCompletar;
  }, [alCompletar]);

  useEffect(() => {
    referenciaSuperar.current = alSuperar;
  }, [alSuperar]);

  useEffect(() => {
    return () => {
      if (referenciaTemporizador.current !== null) {
        window.clearTimeout(referenciaTemporizador.current);
      }
    };
  }, []);

  const sensores = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function limpiarTemporizador(): void {
    if (referenciaTemporizador.current !== null) {
      window.clearTimeout(referenciaTemporizador.current);
      referenciaTemporizador.current = null;
    }
  }

  function mostrarRespuesta(resultadoMovimiento: ResultadoJuego): void {
    limpiarTemporizador();

    if (resultadoMovimiento === "exito") {
      referenciaSuperar.current?.();
      ejecutarEfectoAcierto();
      setMostrarCelebracion(true);
      if (!reducirMovimiento) {
        void controlesTablero.start({
          scale: [1, 1.012, 1],
          transition: { duration: 0.72, ease: "easeOut" },
        });
      }
      referenciaTemporizador.current = window.setTimeout(() => {
        setMostrarCelebracion(false);
        referenciaCompletar.current?.();
      }, reducirMovimiento ? DURACION_CELEBRACION_REDUCIDA : DURACION_CELEBRACION);
      return;
    }

    setMostrarCelebracion(false);

    if (
      resultadoMovimiento === "progreso" ||
      resultadoMovimiento === "encaje"
    ) {
      ejecutarEfectoEncaje();
      if (!reducirMovimiento) {
        void controlesTablero.start({
          scale: [1, 1.008, 1],
          transition: { duration: 0.34, ease: "easeOut" },
        });
      }
      referenciaTemporizador.current = window.setTimeout(
        limpiarResultado,
        1050,
      );
      return;
    }

    ejecutarEfectoError();
    if (!reducirMovimiento) {
      void controlesTablero.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.42, ease: "easeInOut" },
      });
    }
    referenciaTemporizador.current = window.setTimeout(
      limpiarResultado,
      1250,
    );
  }

  function comenzarArrastre(evento: DragStartEvent): void {
    prepararSonidos();
    ejecutarEfectoMovimiento();
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

    const nuevaSecuencia = arrayMove(
      secuenciaActual,
      indiceOrigen,
      indiceDestino,
    );
    const resultadoMovimiento = registrarOrden(nuevaSecuencia);
    mostrarRespuesta(resultadoMovimiento);
  }

  function alternarSonidos(): void {
    const siguienteEstado = !sonidosActivos;
    configurarSonidosActivos(siguienteEstado);
    setSonidosActivos(siguienteEstado);

    if (siguienteEstado) {
      ejecutarEfectoMovimiento();
    }
  }

  const bloqueArrastrado = identificadorArrastrado
    ? secuenciaActual.find((bloque) => bloque === identificadorArrastrado)
    : undefined;
  const indiceBloqueArrastrado = identificadorArrastrado
    ? secuenciaActual.indexOf(identificadorArrastrado)
    : -1;

  return (
    <main className="area-segura-juego min-h-dvh overflow-x-clip pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-[#f9efdb] sm:py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-7xl flex-col">
        <header
          className="sticky z-40 -mx-1 flex items-center justify-between border-b border-[#f9efdb]/10 bg-[#17122f]/88 px-1 pb-4 pt-1 backdrop-blur-xl sm:pb-5"
          style={{ top: "env(safe-area-inset-top)" }}
        >
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
            <BotonVolver
              etiqueta="NIVELES"
              descripcion="Volver a la selección de niveles"
              alPulsar={alSalir}
            />

            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7c948] font-black text-[#21183f] shadow-[0_4px_0_#b99732] sm:h-10 sm:w-10">
                C
              </div>
              <div className="hidden leading-none min-[380px]:block">
                <p className="text-sm font-black tracking-[-0.06em] sm:text-base">
                  COCO
                </p>
                <p className="mt-1 text-[0.5rem] font-bold tracking-[0.27em] text-[#8be0bf] sm:text-[0.55rem]">
                  ALGORITMO
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={alReiniciar}
              disabled={resultado === "exito"}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#f9efdb]/15 bg-[#2b2151] text-[#f9efdb]/72 shadow-[0_4px_0_#0e0a20] transition-all hover:-translate-y-0.5 hover:border-[#f7c948]/55 hover:text-[#f7c948] active:translate-y-0.5 active:shadow-[0_2px_0_#0e0a20] disabled:pointer-events-none disabled:opacity-40"
              aria-label="Reiniciar el nivel con un nuevo orden"
              title="Reiniciar nivel"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={alternarSonidos}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-[0_4px_0_#0e0a20] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_#0e0a20] sm:h-11 sm:w-11 ${
                sonidosActivos
                  ? "border-[#8be0bf]/35 bg-[#8be0bf]/10 text-[#8be0bf]"
                  : "border-[#f9efdb]/12 bg-[#2b2151] text-[#f9efdb]/35"
              }`}
              aria-label={sonidosActivos ? "Desactivar sonidos" : "Activar sonidos"}
              aria-pressed={sonidosActivos}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M5 10v4h3l4 3V7L8 10H5Z" fill="currentColor" />
                {sonidosActivos ? (
                  <path d="M15 9.2c1.5 1.5 1.5 4.1 0 5.6M17.5 7c2.7 2.7 2.7 7.3 0 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <path d="m16 9 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </button>
            <div
              className="rounded-full border border-[#f7c948]/45 px-3 py-1.5 text-xs font-black tabular-nums text-[#f7c948]"
              aria-label={`Nivel ${nivelActual.numero} de ${totalNiveles}`}
            >
              {numeroNivel} / {String(totalNiveles).padStart(2, "0")}
            </div>
          </div>
        </header>

        <div className="grid flex-1 items-start gap-0 py-7 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14 lg:py-12">
          <section className="contents lg:mx-auto lg:block lg:w-full lg:max-w-2xl">
            <div className="order-1 mb-6 flex items-start justify-between gap-5 sm:mb-8">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[0.62rem] font-black tracking-[0.18em] text-[#8be0bf] sm:mb-4 sm:text-[0.65rem]">
                  <span className="h-2 w-2 rounded-full bg-[#8be0bf] shadow-[0_0_10px_rgba(139,224,191,0.7)]" />
                  NIVEL {numeroNivel} · RETO COTIDIANO
                </div>
                <h1 className="text-[2.6rem] font-black leading-none tracking-[-0.07em] text-[#f9efdb] sm:text-6xl">
                  {nivelActual.titulo}
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#f9efdb]/55 sm:mt-4 sm:text-base">
                  {nivelActual.instruccion}
                </p>
              </div>
              <div
                className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-3xl border-2 sm:flex lg:hidden"
                style={{
                  borderColor: nivelActual.tema.color,
                  backgroundColor: `${nivelActual.tema.color}26`,
                  color: nivelActual.tema.color,
                }}
                aria-hidden="true"
              >
                <IconoNivel tipo={nivelActual.icono} className="h-9 w-9" />
              </div>
            </div>

            <div className="order-3">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.16em] text-[#f9efdb]/45">
                    TU SECUENCIA
                  </p>
                  <p className="mt-1 text-[0.68rem] font-bold text-[#f9efdb]/55 sm:hidden">
                    Mantén y arrastra cada pieza
                  </p>
                </div>
                <p className="hidden text-xs font-bold text-[#f9efdb]/55 sm:block">
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
                    animate={controlesTablero}
                    role="list"
                    aria-label="Bloques de la secuencia"
                    className={`space-y-3 rounded-[1.65rem] border-2 border-dashed bg-[#21183f]/45 p-3 transition-colors sm:p-4 ${
                      resultado === "error"
                        ? "border-[#ff725e]/70"
                        : resultado === "exito"
                          ? "border-[#8be0bf]/85 shadow-[0_0_32px_rgba(139,224,191,0.12)]"
                          : evaluacion.pasosConsecutivosCorrectos > 0
                            ? "border-[#8be0bf]/32"
                            : "border-[#f9efdb]/15"
                    }`}
                  >
                    {secuenciaActual.map((bloque, indice) => (
                      <Bloque
                        key={bloque}
                        identificador={bloque}
                        texto={obtenerTexto(bloque)}
                        indice={indice}
                        deshabilitado={resultado === "exito"}
                        estaEnPosicionCorrecta={
                          evaluacion.posicionesCorrectas[indice]
                        }
                      />
                    ))}
                  </motion.div>
                </SortableContext>
                <DragOverlay dropAnimation={null}>
                  {bloqueArrastrado ? (
                    <Bloque
                      identificador={bloqueArrastrado}
                      texto={obtenerTexto(bloqueArrastrado)}
                      indice={indiceBloqueArrastrado}
                      soloVisual
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>

              <div
                className={`mt-5 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${
                  evaluacion.estado === "completa"
                    ? "border-[#8be0bf]/30 bg-[#8be0bf]/8 text-[#8be0bf]"
                    : "border-transparent text-[#f9efdb]/55"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-sm ${
                    evaluacion.estado === "completa"
                      ? "border-[#8be0bf]/35 bg-[#8be0bf] text-[#17122f]"
                      : "border-[#f9efdb]/15 text-[#f7c948]"
                  }`}
                >
                  {evaluacion.estado === "completa" ? "✓" : "+"}
                </span>
                <span>
                  {evaluacion.estado === "completa"
                    ? nivelActual.mensajes.completa
                    : evaluacion.pasosConsecutivosCorrectos > 0
                      ? `${evaluacion.pasosConsecutivosCorrectos} pasos ya funcionan en cadena.`
                      : nivelActual.mensajes.pendiente}
                </span>
              </div>
            </div>
          </section>

          <aside className="contents lg:block lg:space-y-4">
            <div className="order-2 mb-6 lg:mb-0">
              <AnimacionNivel
                tipo={nivelActual.tipoAnimacion}
                evaluacion={evaluacion}
              />
            </div>
            <div className="relative hidden overflow-hidden rounded-[1.6rem] border border-[#f9efdb]/12 bg-[#241b48] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)] lg:block">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#8be0bf]/10 blur-2xl" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[0.6rem] font-black tracking-[0.19em] text-[#f9efdb]/42">
                    FICHA DEL RETO
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f7c948] shadow-[0_0_12px_#f7c948]" />
                </div>
                <h2 className="text-xl font-black tracking-[-0.05em]">
                  {nivelActual.titulo}
                </h2>
                <p className="mt-2.5 text-sm leading-6 text-[#f9efdb]/52">
                  {nivelActual.descripcion}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#f9efdb]/10 pt-4">
                  <div>
                    <p className="text-[0.55rem] font-black tracking-[0.13em] text-[#f9efdb]/35">
                      PROGRESO
                    </p>
                    <p className="mt-1 text-lg font-black text-[#8be0bf]">
                      {evaluacion.porcentajeProgreso}%
                    </p>
                  </div>
                  <div className="border-l border-[#f9efdb]/10 pl-3">
                    <p className="text-[0.55rem] font-black tracking-[0.13em] text-[#f9efdb]/35">
                      MOVIMIENTOS
                    </p>
                    <p className="mt-1 text-lg font-black text-[#f7c948]">
                      {String(intentos).padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-between border-t border-[#f9efdb]/10 pt-4 text-[0.58rem] font-black tracking-[0.16em] text-[#f9efdb]/25 sm:pt-5">
          <span>ARRASTRA · CONECTA · RESUELVE</span>
          <span className="hidden sm:block">COCO ALGORITMO / SALA DE JUEGO</span>
        </footer>
      </div>

      <NotificacionResultado
        nivel={nivelActual}
        textoSiguiente={textoSiguiente}
        resultado={resultado}
        evaluacion={evaluacion}
        numeroMovimiento={intentos}
        mostrarCelebracion={mostrarCelebracion}
      />
    </main>
  );
}
