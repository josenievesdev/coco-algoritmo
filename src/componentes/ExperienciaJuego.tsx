"use client";

import { useEffect, useState } from "react";
import CelebracionMundo from "@/componentes/CelebracionMundo";
import PantallaInicio from "@/componentes/PantallaInicio";
import PantallaMundos from "@/componentes/PantallaMundos";
import PantallaNiveles from "@/componentes/PantallaNiveles";
import TableroJuego from "@/componentes/TableroJuego";
import {
  contarNivelesCompletados,
  mundosDisponibles,
  obtenerEstadoNivel,
  obtenerMundo,
  obtenerNivelesDeMundo,
  obtenerNivelSiguiente,
} from "@/datos/juegosDisponibles";
import { obtenerSolucion, useEstadoJuego } from "@/juegos/estadoJuego";
import { useProgresoJuego } from "@/juegos/progresoJuego";
import { mezclarPasos } from "@/motor/mezclarPasos";
import { prepararSonidos } from "@/motor/sonidos";
import type { IdentificadorMundo, Nivel } from "@/tipos/juego";

type VistaJuego = "inicio" | "mundos" | "niveles" | "tablero";

const mundoInicial = mundosDisponibles[0];

export default function ExperienciaJuego() {
  const [vista, setVista] = useState<VistaJuego>("inicio");
  const [identificadorMundo, setIdentificadorMundo] =
    useState<IdentificadorMundo>(mundoInicial.identificador);
  const [numeroPartida, setNumeroPartida] = useState(0);
  const [mostrarMundoCompletado, setMostrarMundoCompletado] = useState(false);
  const nivelActual = useEstadoJuego((estado) => estado.nivelActual);
  const iniciarNivel = useEstadoJuego((estado) => estado.iniciarNivel);
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

    if (
      !progreso.hidratado ||
      obtenerEstadoNivel(nivel, progreso.nivelesCompletados) === "bloqueado"
    ) {
      return;
    }

    const ordenInicial = mezclarPasos(
      obtenerSolucion(nivel),
      progreso.ultimosOrdenes[nivel.identificador],
    );

    prepararSonidos();
    progreso.registrarOrdenInicial(nivel.identificador, ordenInicial);
    iniciarNivel(nivel, ordenInicial);
    setIdentificadorMundo(nivel.identificadorMundo);
    setNumeroPartida((numero) => numero + 1);
    setVista("tablero");
  }

  function elegirMundo(identificador: IdentificadorMundo): void {
    const mundoElegido = obtenerMundo(identificador);

    if (mundoElegido?.estado !== "disponible") {
      return;
    }

    setIdentificadorMundo(identificador);
    setVista("niveles");
  }

  function terminarCelebracion(): void {
    const nivelSiguiente = obtenerNivelSiguiente(nivelActual);

    if (nivelSiguiente) {
      jugarNivel(nivelSiguiente);
      return;
    }

    setVista("niveles");
    setMostrarMundoCompletado(true);
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
    return (
      <>
        <PantallaNiveles
          mundo={mundo}
          nivelesCompletados={nivelesCompletados}
          hidratado={hidratado}
          alElegirNivel={jugarNivel}
          alVolver={() => setVista("mundos")}
        />
        {mostrarMundoCompletado && (
          <CelebracionMundo
            mundo={mundo}
            completados={contarNivelesCompletados(
              mundo.identificador,
              nivelesCompletados,
            )}
            alVerNiveles={() => setMostrarMundoCompletado(false)}
            alVerMundos={() => {
              setMostrarMundoCompletado(false);
              setVista("mundos");
            }}
          />
        )}
      </>
    );
  }

  const nivelSiguiente = obtenerNivelSiguiente(nivelActual);

  return (
    <TableroJuego
      key={`${nivelActual.identificador}-${numeroPartida}`}
      totalNiveles={obtenerNivelesDeMundo(nivelActual.identificadorMundo).length}
      textoSiguiente={
        nivelSiguiente
          ? `Siguiente: ${nivelSiguiente.titulo}`
          : "¡Último nivel del mundo!"
      }
      alSalir={() => setVista("niveles")}
      alReiniciar={() => jugarNivel(nivelActual)}
      alSuperar={() => marcarNivelCompletado(nivelActual.identificador)}
      alCompletar={terminarCelebracion}
    />
  );
}
