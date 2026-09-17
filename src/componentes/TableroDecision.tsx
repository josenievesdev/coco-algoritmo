"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import AnimacionNivel from "@/componentes/AnimacionNivel";
import BandejaFichas from "@/componentes/BandejaFichas";
import BotonVolver from "@/componentes/BotonVolver";
import { VistaFicha } from "@/componentes/FichaDecision";
import IconoNivel from "@/componentes/IconoNivel";
import IndicadorEspacios from "@/componentes/IndicadorEspacios";
import NotificacionResultado from "@/componentes/NotificacionResultado";
import { crearEvaluacionDecision } from "@/componentes/SimulacionDecision";
import TarjetaDecision, { describirError } from "@/componentes/TarjetaDecision";
import {
  ERRORES_PARA_PISTA,
  obtenerEspacioDeFicha,
  useEstadoDecision,
} from "@/juegos/estadoDecision";
import type { RespuestaMovimiento } from "@/juegos/estadoDecision";
import {
  ejecutarEfectoAcierto,
  ejecutarEfectoEncaje,
  ejecutarEfectoError,
  ejecutarEfectoMovimiento,
} from "@/motor/efectosJuego";
import { nombresZona } from "@/motor/programaDecision";
import {
  configurarSonidosActivos,
  obtenerEstadoSonidos,
  prepararSonidos,
} from "@/motor/sonidos";
import type { ResultadoJuego } from "@/tipos/juego";

const DURACION_CELEBRACION = 2800;
const DURACION_CELEBRACION_REDUCIDA = 1500;
const DURACION_AVISO = 2200;

interface PropiedadesTableroDecision {
  totalNiveles: number;
  textoSiguiente?: string;
  alSalir: () => void;
  alReiniciar: () => void;
  /** Se ejecuta en cuanto la decisión es correcta, antes de la celebración. */
  alSuperar: () => void;
  /** Se ejecuta una sola vez al terminar o saltar la celebración. */
  alCompletar: () => void;
}

export default function TableroDecision({
  totalNiveles,
  textoSiguiente,
  alSalir,
  alReiniciar,
  alSuperar,
  alCompletar,
}: PropiedadesTableroDecision) {
  const nivel = useEstadoDecision((estado) => estado.nivelActual);
  const bandeja = useEstadoDecision((estado) => estado.bandeja);
  const colocacion = useEstadoDecision((estado) => estado.colocacion);
  const resultado = useEstadoDecision((estado) => estado.resultado);
  const ultimaValidacion = useEstadoDecision((estado) => estado.ultimaValidacion);
  const erroresCompletos = useEstadoDecision((estado) => estado.erroresCompletos);
  const zonaPista = useEstadoDecision((estado) => estado.zonaPista);
  const numeroEvaluacion = useEstadoDecision((estado) => estado.numeroEvaluacion);
  const colocarFicha = useEstadoDecision((estado) => estado.colocarFicha);
  const retirarFicha = useEstadoDecision((estado) => estado.retirarFicha);
  const reducirMovimiento = useReducedMotion();
  const controlesTarjeta = useAnimationControls();
  const [fichaSeleccionada, setFichaSeleccionada] = useState<string | null>(null);
  const [fichaArrastrada, setFichaArrastrada] = useState<string | null>(null);
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
  const [avisoVisible, setAvisoVisible] = useState(false);
  const [mensajeVivo, setMensajeVivo] = useState("");
  const [sonidosActivos, setSonidosActivos] = useState(obtenerEstadoSonidos);
  const referenciaSuperar = useRef(alSuperar);
  const referenciaCompletar = useRef(alCompletar);
  const referenciaCelebracion = useRef<number | null>(null);
  const referenciaAviso = useRef<number | null>(null);
  const yaSupero = useRef(false);
  const yaAvanzo = useRef(false);

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  useEffect(() => {
    referenciaSuperar.current = alSuperar;
    referenciaCompletar.current = alCompletar;
  }, [alSuperar, alCompletar]);

  useEffect(() => {
    return () => {
      if (referenciaCelebracion.current !== null) {
        window.clearTimeout(referenciaCelebracion.current);
      }
      if (referenciaAviso.current !== null) {
        window.clearTimeout(referenciaAviso.current);
      }
    };
  }, []);

  if (!nivel) {
    return null;
  }

  const nivelActual = nivel;
  const exito = resultado === "exito";
  const buscarFicha = (identificador: string | null | undefined) =>
    nivelActual.fichas.find((ficha) => ficha.identificador === identificador) ??
    null;
  const nombreEspacio = (identificadorEspacio: string) => {
    const espacio = nivelActual.espacios.find(
      (candidato) => candidato.identificador === identificadorEspacio,
    );
    return espacio ? nombresZona[espacio.zona] : identificadorEspacio;
  };
  const total = nivelActual.espacios.length;
  const llenos = nivelActual.espacios.filter(
    (espacio) => colocacion[espacio.identificador],
  ).length;
  const errores =
    resultado === "error" && ultimaValidacion?.estado === "incorrecta"
      ? ultimaValidacion.errores
      : [];
  const mensajeError = errores[0]
    ? describirError(errores[0])
    : nivelActual.mensajes.error;
  const fichasLibres = bandeja
    .filter((identificador) => !Object.values(colocacion).includes(identificador))
    .map(buscarFicha)
    .filter((ficha) => ficha !== null);
  const espacioSeleccionado = fichaSeleccionada
    ? obtenerEspacioDeFicha(colocacion, fichaSeleccionada)
    : null;
  const numeroNivel = String(nivelActual.numero).padStart(2, "0");
  const resultadoAviso: ResultadoJuego = exito
    ? "exito"
    : avisoVisible
      ? "error"
      : "jugando";
  const evaluacionEscena = crearEvaluacionDecision(llenos, total, exito);

  function anunciar(mensaje: string): void {
    // Un espacio final fuerza a los lectores a repetir un mensaje idéntico.
    setMensajeVivo((anterior) => (anterior === mensaje ? `${mensaje} ` : mensaje));
  }

  function continuar(): void {
    if (yaAvanzo.current) {
      return;
    }

    yaAvanzo.current = true;

    if (referenciaCelebracion.current !== null) {
      window.clearTimeout(referenciaCelebracion.current);
      referenciaCelebracion.current = null;
    }

    setMostrarCelebracion(false);
    referenciaCompletar.current();
  }

  function mostrarAvisoError(): void {
    if (referenciaAviso.current !== null) {
      window.clearTimeout(referenciaAviso.current);
    }

    setAvisoVisible(true);
    referenciaAviso.current = window.setTimeout(() => {
      setAvisoVisible(false);
      referenciaAviso.current = null;
    }, DURACION_AVISO);
  }

  function procesarRespuesta(
    respuesta: RespuestaMovimiento,
    textoFicha: string,
    identificadorEspacio: string,
  ): void {
    const zona = nombreEspacio(identificadorEspacio);

    if (respuesta.accion === "rechazada") {
      ejecutarEfectoMovimiento();
      anunciar(`${textoFicha} no cabe en ${zona}.`);
      return;
    }

    if (respuesta.accion === "sin-cambio") {
      return;
    }

    setFichaSeleccionada(null);

    if (respuesta.evaluacion !== "incorrecta") {
      setAvisoVisible(false);
    }

    switch (respuesta.evaluacion) {
      case "correcta": {
        if (!yaSupero.current) {
          yaSupero.current = true;
          referenciaSuperar.current();
        }

        ejecutarEfectoAcierto();
        setMostrarCelebracion(true);
        anunciar(`¡Correcto! ${nivelActual.mensajes.completa}`);

        if (!reducirMovimiento) {
          void controlesTarjeta.start({
            scale: [1, 1.012, 1],
            transition: { duration: 0.7, ease: "easeOut" },
          });
        }

        referenciaCelebracion.current = window.setTimeout(
          continuar,
          reducirMovimiento ? DURACION_CELEBRACION_REDUCIDA : DURACION_CELEBRACION,
        );
        return;
      }
      case "incorrecta": {
        const estado = useEstadoDecision.getState();
        const validacion = estado.ultimaValidacion;
        const primerError =
          validacion?.estado === "incorrecta" ? validacion.errores[0] : null;
        const pista = estado.zonaPista
          ? ` Pista: revisa la zona ${nombresZona[estado.zonaPista]}.`
          : "";

        ejecutarEfectoError();
        mostrarAvisoError();
        anunciar(
          `Todavía no. ${
            primerError
              ? `Zona ${nombresZona[primerError.zona]}: ${describirError(primerError)}`
              : nivelActual.mensajes.error
          }${pista}`,
        );
        return;
      }
      case "repetida":
        anunciar("Ya probaste esta misma combinación. Cambia alguna ficha.");
        return;
      case "reiniciada":
        ejecutarEfectoMovimiento();
        anunciar("El tablero se reinició. Vuelve a colocar las fichas.");
        return;
      case "incompleta": {
        const faltan = nivelActual.espacios.filter(
          (espacio) => !useEstadoDecision.getState().colocacion[espacio.identificador],
        ).length;

        if (respuesta.accion === "retirada") {
          ejecutarEfectoMovimiento();
          anunciar(`${textoFicha} volvió a la bandeja. Faltan ${faltan} espacios.`);
        } else {
          ejecutarEfectoEncaje();
          anunciar(
            `${textoFicha} colocada en ${zona}. ${
              faltan === 1 ? "Falta 1 espacio." : `Faltan ${faltan} espacios.`
            }`,
          );
        }
      }
    }
  }

  function colocar(identificadorFicha: string, identificadorEspacio: string): void {
    const ficha = buscarFicha(identificadorFicha);

    if (!ficha) {
      return;
    }

    procesarRespuesta(
      colocarFicha(identificadorFicha, identificadorEspacio),
      ficha.texto,
      identificadorEspacio,
    );
  }

  function retirar(identificadorEspacio: string): void {
    const ficha = buscarFicha(colocacion[identificadorEspacio]);

    if (!ficha) {
      return;
    }

    procesarRespuesta(
      retirarFicha(identificadorEspacio),
      ficha.texto,
      identificadorEspacio,
    );
  }

  function pulsarFicha(identificadorFicha: string): void {
    prepararSonidos();

    if (fichaSeleccionada === identificadorFicha) {
      setFichaSeleccionada(null);
      anunciar("Selección cancelada.");
      return;
    }

    const ficha = buscarFicha(identificadorFicha);
    setFichaSeleccionada(identificadorFicha);
    ejecutarEfectoMovimiento();
    anunciar(`${ficha?.texto ?? ""} elegida. Ahora elige un espacio.`);
  }

  function pulsarEspacio(identificadorEspacio: string): void {
    prepararSonidos();
    const ocupante = colocacion[identificadorEspacio];

    if (fichaSeleccionada && fichaSeleccionada !== ocupante) {
      colocar(fichaSeleccionada, identificadorEspacio);
      return;
    }

    if (ocupante) {
      pulsarFicha(ocupante);
      return;
    }

    anunciar("Elige primero una ficha de la bandeja.");
  }

  function comenzarArrastre(evento: DragStartEvent): void {
    prepararSonidos();
    ejecutarEfectoMovimiento();
    setFichaSeleccionada(null);
    setFichaArrastrada(String(evento.active.data.current?.ficha ?? ""));
  }

  function terminarArrastre(evento: DragEndEvent): void {
    const identificadorFicha = String(evento.active.data.current?.ficha ?? "");
    const destino = evento.over ? String(evento.over.id) : null;
    setFichaArrastrada(null);

    if (!destino || !identificadorFicha || exito) {
      return;
    }

    if (destino.startsWith("espacio:")) {
      colocar(identificadorFicha, destino.slice("espacio:".length));
      return;
    }

    if (destino === "bandeja") {
      const espacioOrigen = obtenerEspacioDeFicha(colocacion, identificadorFicha);

      if (espacioOrigen) {
        retirar(espacioOrigen);
      }
    }
  }

  function alternarSonidos(): void {
    const siguienteEstado = !sonidosActivos;
    configurarSonidosActivos(siguienteEstado);
    setSonidosActivos(siguienteEstado);

    if (siguienteEstado) {
      ejecutarEfectoMovimiento();
    }
  }

  const fichaFlotante = buscarFicha(fichaArrastrada);
  const fichaElegida = buscarFicha(fichaSeleccionada);

  return (
    <main
      className="area-segura-juego min-h-dvh overflow-x-clip pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-[#f9efdb] sm:py-6"
      onKeyDown={(evento) => {
        if (evento.key === "Escape" && fichaSeleccionada) {
          setFichaSeleccionada(null);
          anunciar("Selección cancelada.");
        }
      }}
    >
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {mensajeVivo}
      </p>

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
                <p className="mt-1 text-[0.55rem] font-bold tracking-[0.27em] text-[#8be0bf]">
                  ALGORITMO
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={alReiniciar}
              disabled={exito}
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
              className={`flex h-11 w-11 items-center justify-center rounded-xl border shadow-[0_4px_0_#0e0a20] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_#0e0a20] ${
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
              className="rounded-full border border-[#8be0bf]/45 px-3 py-1.5 text-xs font-black tabular-nums text-[#8be0bf]"
              aria-label={`Nivel ${nivelActual.numero} de ${totalNiveles}`}
            >
              {numeroNivel} / {String(totalNiveles).padStart(2, "0")}
            </div>
          </div>
        </header>

        <DndContext
          sensors={sensores}
          collisionDetection={pointerWithin}
          onDragStart={comenzarArrastre}
          onDragCancel={() => setFichaArrastrada(null)}
          onDragEnd={terminarArrastre}
          accessibility={{
            screenReaderInstructions: {
              draggable:
                "Pulsa Enter o Espacio para elegir la ficha y luego pulsa un espacio para colocarla. Escape cancela la selección.",
            },
            announcements: {
              onDragStart: () => "Arrastrando ficha.",
              onDragOver: ({ over }) =>
                over ? "Sobre un espacio del tablero." : "Fuera del tablero.",
              onDragEnd: ({ over }) =>
                over ? "Ficha soltada." : "Ficha soltada fuera del tablero.",
              onDragCancel: () => "Arrastre cancelado.",
            },
          }}
        >
          <div className="grid flex-1 items-start gap-6 py-6 lg:grid-cols-[16rem_minmax(0,1fr)_20rem] lg:gap-8 lg:py-10">
            <section className="lg:col-start-2 lg:row-start-1">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-black tracking-[0.18em] text-[#8be0bf]">
                    <span className="h-2 w-2 rounded-full bg-[#8be0bf] shadow-[0_0_10px_rgba(139,224,191,0.7)]" />
                    NIVEL {numeroNivel} · DECISIÓN
                  </div>
                  <h1 className="text-[2.4rem] font-black leading-none tracking-[-0.07em] sm:text-5xl">
                    {nivelActual.titulo}
                  </h1>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-[#f9efdb]/65 sm:text-base">
                    {nivelActual.instruccion}
                  </p>
                </div>
                <div
                  className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-3xl border-2 sm:flex"
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

              <dl className="mb-5 grid gap-3 rounded-2xl border border-[#f9efdb]/12 bg-[#241b48] p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[0.7rem] font-black tracking-[0.16em] text-[#f9efdb]/55">
                    SITUACIÓN
                  </dt>
                  <dd className="mt-1 text-sm font-bold leading-6 text-[#f9efdb]/85">
                    {nivelActual.situacion}
                  </dd>
                </div>
                <div className="sm:border-l sm:border-[#f9efdb]/10 sm:pl-4">
                  <dt className="text-[0.7rem] font-black tracking-[0.16em] text-[#f7c948]">
                    OBJETIVO
                  </dt>
                  <dd className="mt-1 text-sm font-black leading-6 text-[#f9efdb]">
                    {nivelActual.objetivo}
                  </dd>
                </div>
              </dl>

              <motion.div animate={controlesTarjeta}>
                <TarjetaDecision
                  nivel={nivelActual}
                  colocacion={colocacion}
                  errores={errores}
                  zonaPista={exito ? null : zonaPista}
                  fichaSeleccionada={fichaElegida}
                  espacioSeleccionado={espacioSeleccionado}
                  bloqueada={exito}
                  alPulsarEspacio={pulsarEspacio}
                  alRetirar={retirar}
                />
              </motion.div>

              <div
                className={`mt-4 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold ${
                  exito
                    ? "border-[#8be0bf]/30 bg-[#8be0bf]/10 text-[#8be0bf]"
                    : resultado === "error"
                      ? "border-[#ff725e]/35 bg-[#ff725e]/10 text-[#ffb3a6]"
                      : "border-transparent text-[#f9efdb]/65"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-sm font-black ${
                    exito
                      ? "border-[#8be0bf]/35 bg-[#8be0bf] text-[#17122f]"
                      : resultado === "error"
                        ? "border-[#ff725e]/40 bg-[#ff725e] text-[#17122f]"
                        : "border-[#f9efdb]/15 text-[#f7c948]"
                  }`}
                  aria-hidden="true"
                >
                  {exito ? "✓" : resultado === "error" ? "!" : "+"}
                </span>
                <span>
                  {exito
                    ? nivelActual.mensajes.completa
                    : resultado === "error"
                      ? `Todavía no: ${mensajeError}`
                      : fichaElegida
                        ? `Elegiste «${fichaElegida.texto}». Toca un espacio para colocarla o pulsa Escape para cancelar.`
                        : nivelActual.mensajes.pendiente}
                </span>
              </div>
              {erroresCompletos > 0 && !exito && (
                <p className="mt-2 text-xs font-bold text-[#f9efdb]/55">
                  Intentos completos: {erroresCompletos}
                  {zonaPista
                    ? ` · Pista activa en la zona ${nombresZona[zonaPista]}.`
                    : ` · La pista aparece tras ${ERRORES_PARA_PISTA} intentos.`}
                </p>
              )}
            </section>

            <aside className="lg:col-start-3 lg:row-start-1">
              <AnimacionNivel
                tipo={nivelActual.tipoAnimacion}
                evaluacion={evaluacionEscena}
                indicador={<IndicadorEspacios llenos={llenos} total={total} />}
              />
            </aside>

            <div className="sticky bottom-0 z-30 -mx-1 max-h-[45dvh] overflow-y-auto overscroll-contain rounded-t-2xl bg-[#17122f]/92 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:static lg:col-start-1 lg:row-start-1 lg:max-h-none lg:overflow-visible lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <BandejaFichas
                fichas={fichasLibres}
                fichaSeleccionada={fichaSeleccionada}
                bloqueada={exito}
                alPulsarFicha={pulsarFicha}
              />
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {fichaFlotante ? <VistaFicha ficha={fichaFlotante} flotante /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <NotificacionResultado
        nivel={nivelActual}
        textoSiguiente={textoSiguiente}
        resultado={resultadoAviso}
        evaluacion={evaluacionEscena}
        numeroMovimiento={numeroEvaluacion}
        mostrarCelebracion={mostrarCelebracion}
        textosAviso={{
          tituloError: "REVISA TU DECISIÓN",
          error: mensajeError,
          etiquetaExito: "DECISIÓN CORRECTA",
          detalleExito: "Tu regla funciona en los dos casos.",
        }}
        alContinuar={continuar}
      />
    </main>
  );
}
