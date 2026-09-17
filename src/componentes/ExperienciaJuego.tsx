"use client";

import { useEffect, useState } from "react";
import CelebracionMundo from "@/componentes/CelebracionMundo";
import PantallaInicio from "@/componentes/PantallaInicio";
import PantallaMundos from "@/componentes/PantallaMundos";
import PantallaNiveles from "@/componentes/PantallaNiveles";
import TableroDecision from "@/componentes/TableroDecision";
import TableroJuego from "@/componentes/TableroJuego";
import {
  contarNivelesCompletados,
  mundosDisponibles,
  nivelesDisponibles,
  obtenerEstadoMundo,
  obtenerEstadoNivel,
  obtenerMundo,
  obtenerMundoSiguiente,
  obtenerNivelesDeMundo,
  obtenerNivelSiguiente,
} from "@/datos/juegosDisponibles";
import { useEstadoDecision } from "@/juegos/estadoDecision";
import { useEstadoJuego } from "@/juegos/estadoJuego";
import { useProgresoJuego } from "@/juegos/progresoJuego";
import { mezclarOrdenInicial } from "@/motor/mezclarNivel";
import { prepararSonidos } from "@/motor/sonidos";
import type { IdentificadorMundo, Mundo, Nivel } from "@/tipos/juego";

type VistaJuego = "inicio" | "mundos" | "niveles" | "tablero";

const mundoInicial = mundosDisponibles[0];
const nivelInicial = nivelesDisponibles[0];

function mundoAbierto(mundo: Mundo, nivelesCompletados: readonly string[]): boolean {
  const estado = obtenerEstadoMundo(mundo, nivelesCompletados);
  return estado === "disponible" || estado === "completado";
}

export default function ExperienciaJuego() {
  const [vista, setVista] = useState<VistaJuego>("inicio");
  const [identificadorMundo, setIdentificadorMundo] =
    useState<IdentificadorMundo>(mundoInicial.identificador);
  const [nivelEnJuego, setNivelEnJuego] = useState<Nivel>(nivelInicial);
  const [numeroPartida, setNumeroPartida] = useState(0);
  const [mundoCelebrado, setMundoCelebrado] =
    useState<IdentificadorMundo | null>(null);
  const iniciarNivelSecuencia = useEstadoJuego((estado) => estado.iniciarNivel);
  const iniciarNivelDecision = useEstadoDecision((estado) => estado.iniciarNivel);
  const nivelesCompletados = useProgresoJuego(
    (estado) => estado.nivelesCompletados,
  );
  const hidratado = useProgresoJuego((estado) => estado.hidratado);
  const marcarNivelCompletado = useProgresoJuego(
    (estado) => estado.marcarNivelCompletado,
  );
  const mundo = obtenerMundo(identificadorMundo) ?? mundoInicial;

  useEffect(() => {
    void useProgresoJuego.persist.rehydrate();
  }, []);

  function jugarNivel(nivel: Nivel): void {
    const progreso = useProgresoJuego.getState();
    const mundoDelNivel = obtenerMundo(nivel.identificadorMundo);

    if (
      !progreso.hidratado ||
      !mundoDelNivel ||
      !mundoAbierto(mundoDelNivel, progreso.nivelesCompletados) ||
      obtenerEstadoNivel(nivel, progreso.nivelesCompletados) === "bloqueado"
    ) {
      return;
    }

    const ordenInicial = mezclarOrdenInicial(
      nivel,
      progreso.ultimosOrdenes[nivel.identificador],
    );

    prepararSonidos();
    progreso.registrarOrdenInicial(nivel.identificador, ordenInicial);

    if (nivel.tipo === "secuencia") {
      iniciarNivelSecuencia(nivel, ordenInicial);
    } else {
      iniciarNivelDecision(nivel, ordenInicial);
    }

    setNivelEnJuego(nivel);
    setIdentificadorMundo(nivel.identificadorMundo);
    setNumeroPartida((numero) => numero + 1);
    setVista("tablero");
  }

  function elegirMundo(identificador: IdentificadorMundo): void {
    const mundoElegido = obtenerMundo(identificador);
    const { nivelesCompletados: completados } = useProgresoJuego.getState();

    if (!mundoElegido || !mundoAbierto(mundoElegido, completados)) {
      return;
    }

    setMundoCelebrado(null);
    setIdentificadorMundo(identificador);
    setVista("niveles");
  }

  function terminarCelebracion(): void {
    const nivelSiguiente = obtenerNivelSiguiente(nivelEnJuego);

    if (nivelSiguiente) {
      jugarNivel(nivelSiguiente);
      return;
    }

    setIdentificadorMundo(nivelEnJuego.identificadorMundo);
    setVista("niveles");
    setMundoCelebrado(nivelEnJuego.identificadorMundo);
  }

  if (vista === "inicio") {
    return (
      <PantallaInicio
        alJugar={() => {
          prepararSonidos();
          setVista("mundos");
        }}
      />
    );
  }

  if (vista === "mundos") {
    return (
      <PantallaMundos
        nivelesCompletados={nivelesCompletados}
        hidratado={hidratado}
        alElegirMundo={elegirMundo}
        alVolver={() => setVista("inicio")}
      />
    );
  }

  if (vista === "niveles") {
    const mundoSiguiente = obtenerMundoSiguiente(mundo);
    const siguienteAbierto =
      mundoSiguiente !== undefined &&
      mundoAbierto(mundoSiguiente, nivelesCompletados);

    return (
      <>
        <PantallaNiveles
          mundo={mundo}
          nivelesCompletados={nivelesCompletados}
          hidratado={hidratado}
          alElegirNivel={jugarNivel}
          alVolver={() => setVista("mundos")}
        />
        {mundoCelebrado === mundo.identificador && (
          <CelebracionMundo
            mundo={mundo}
            completados={contarNivelesCompletados(
              mundo.identificador,
              nivelesCompletados,
            )}
            mundoSiguiente={siguienteAbierto ? mundoSiguiente : undefined}
            alVerNiveles={() => setMundoCelebrado(null)}
            alVerMundos={() => {
              setMundoCelebrado(null);
              setVista("mundos");
            }}
            alIrMundoSiguiente={
              siguienteAbierto
                ? () => elegirMundo(mundoSiguiente.identificador)
                : undefined
            }
          />
        )}
      </>
    );
  }

  const nivelSiguiente = obtenerNivelSiguiente(nivelEnJuego);
  const propiedadesTablero = {
    totalNiveles: obtenerNivelesDeMundo(nivelEnJuego.identificadorMundo).length,
    textoSiguiente: nivelSiguiente
      ? `Siguiente: ${nivelSiguiente.titulo}`
      : "¡Último nivel del mundo!",
    alSalir: () => setVista("niveles"),
    alReiniciar: () => jugarNivel(nivelEnJuego),
    alSuperar: () => marcarNivelCompletado(nivelEnJuego.identificador),
    alCompletar: terminarCelebracion,
  };

  return nivelEnJuego.tipo === "secuencia" ? (
    <TableroJuego
      key={`${nivelEnJuego.identificador}-${numeroPartida}`}
      {...propiedadesTablero}
    />
  ) : (
    <TableroDecision
      key={`${nivelEnJuego.identificador}-${numeroPartida}`}
      {...propiedadesTablero}
    />
  );
}
