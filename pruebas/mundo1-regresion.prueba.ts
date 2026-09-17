// Regresión del Mundo 1: conserva las 232 comprobaciones de la fase anterior.
// Si se eliminan comprobaciones, el contador final hace fallar la prueba.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  instalarAlmacenamiento,
  instalarAlmacenamientoBloqueado,
} from "./utilidades/almacenamientoFalso";
import {
  obtenerEstadoNivel,
  obtenerNivelesDeMundo,
} from "@/datos/juegosDisponibles";
import { obtenerSolucion, useEstadoJuego } from "@/juegos/estadoJuego";
import { CLAVE_PROGRESO, useProgresoJuego } from "@/juegos/progresoJuego";
import { mezclarPasos, sonSecuenciasIguales } from "@/motor/mezclarPasos";
import type { NivelSecuencia } from "@/tipos/juego";

const COMPROBACIONES_ESPERADAS = 232;

test("Mundo 1: 232 comprobaciones de regresión", async () => {
  const datos = instalarAlmacenamiento();
  let comprobaciones = 0;
  const comprobar = (condicion: boolean, mensaje: string) => {
    comprobaciones += 1;
    assert.ok(condicion, mensaje);
  };

  const niveles = obtenerNivelesDeMundo(
    "primeros-algoritmos",
  ) as NivelSecuencia[];
  comprobar(niveles.length === 5, "el mundo tiene 5 niveles");
  // Verificación adicional de esta fase; no forma parte de las 232.
  assert.ok(
    niveles.every((nivel) => nivel.tipo === "secuencia"),
    "todos los niveles del Mundo 1 son de secuencia",
  );

  const progreso = useProgresoJuego;
  await progreso.persist.rehydrate();
  comprobar(progreso.getState().hidratado, "hidratado sin datos");

  const estados = () =>
    niveles.map((nivel) =>
      obtenerEstadoNivel(nivel, progreso.getState().nivelesCompletados),
    );
  comprobar(
    estados().join() ===
      "disponible,bloqueado,bloqueado,bloqueado,bloqueado",
    `estado inicial ${estados()}`,
  );

  for (const [indice, nivel] of niveles.entries()) {
    const solucion = obtenerSolucion(nivel);
    const orden = mezclarPasos(
      solucion,
      progreso.getState().ultimosOrdenes[nivel.identificador],
    );
    comprobar(!sonSecuenciasIguales(orden, solucion), "mezcla distinta de la solución");
    progreso.getState().registrarOrdenInicial(nivel.identificador, orden);
    useEstadoJuego.getState().iniciarNivel(nivel, orden);

    if (indice > 0) {
      comprobar(
        useEstadoJuego.getState().registrarOrden(obtenerSolucion(niveles[0])) ===
          "error",
        "la solución de otro nivel no valida",
      );
    }

    comprobar(
      useEstadoJuego.getState().registrarOrden(solucion) === "exito",
      `la solución propia valida ${nivel.identificador}`,
    );
    progreso.getState().marcarNivelCompletado(nivel.identificador);

    if (indice < 4) {
      comprobar(
        estados()[indice + 1] === "disponible",
        `desbloquea el nivel siguiente a ${indice}`,
      );
    }
  }

  comprobar(
    estados().every((estado) => estado === "completado"),
    "todos completados",
  );
  progreso.getState().marcarNivelCompletado(niveles[0].identificador);
  comprobar(
    progreso.getState().nivelesCompletados.length === 5,
    "sin duplicados",
  );

  for (let repeticion = 0; repeticion < 200; repeticion += 1) {
    const nivel = niveles[repeticion % 5];
    const anterior = progreso.getState().ultimosOrdenes[nivel.identificador];
    const nuevo = mezclarPasos(obtenerSolucion(nivel), anterior);
    comprobar(
      !sonSecuenciasIguales(nuevo, anterior) &&
        !sonSecuenciasIguales(nuevo, obtenerSolucion(nivel)),
      "repetir produce un orden distinto",
    );
    progreso.getState().registrarOrdenInicial(nivel.identificador, nuevo);
  }

  const guardado = JSON.parse(datos.get(CLAVE_PROGRESO) ?? "null");
  comprobar(
    guardado.version === 1 &&
      guardado.state.nivelesCompletados.length === 5 &&
      !("hidratado" in guardado.state),
    "formato guardado",
  );

  progreso.setState({ nivelesCompletados: [], ultimosOrdenes: {} });
  datos.set(CLAVE_PROGRESO, JSON.stringify(guardado));
  await progreso.persist.rehydrate();
  comprobar(
    progreso.getState().nivelesCompletados.length === 5,
    "el progreso sobrevive a la recarga",
  );

  datos.set(CLAVE_PROGRESO, "{no es json");
  await progreso.persist.rehydrate();
  comprobar(
    progreso.getState().hidratado &&
      progreso.getState().nivelesCompletados.length === 0,
    "JSON corrupto vuelve al progreso inicial",
  );

  datos.set(
    CLAVE_PROGRESO,
    JSON.stringify({
      version: 99,
      state: { nivelesCompletados: ["preparar-cafe"] },
    }),
  );
  progreso.setState({ hidratado: false });
  await progreso.persist.rehydrate();
  comprobar(
    progreso.getState().hidratado &&
      progreso.getState().nivelesCompletados.length === 0,
    "una versión desconocida vuelve al progreso inicial",
  );
  comprobar(
    JSON.parse(datos.get(CLAVE_PROGRESO) ?? "null").version === 1,
    "se reescribe con la versión 1",
  );

  datos.set(
    CLAVE_PROGRESO,
    JSON.stringify({
      version: 1,
      state: {
        nivelesCompletados: [
          "preparar-cafe",
          "inventado",
          3,
          "preparar-cafe",
        ],
        ultimosOrdenes: {
          "preparar-cafe": ["x"],
          "lavar-manos": obtenerSolucion(niveles[4]).reverse(),
        },
      },
    }),
  );
  await progreso.persist.rehydrate();
  comprobar(
    JSON.stringify(progreso.getState().nivelesCompletados) ===
      '["preparar-cafe"]',
    `sanea completados ${progreso.getState().nivelesCompletados}`,
  );
  comprobar(
    !progreso.getState().ultimosOrdenes["preparar-cafe"] &&
      Boolean(progreso.getState().ultimosOrdenes["lavar-manos"]),
    "sanea órdenes",
  );
  comprobar(
    estados().join() ===
      "completado,disponible,bloqueado,bloqueado,bloqueado",
    `estado tras sanear ${estados()}`,
  );

  instalarAlmacenamientoBloqueado();
  progreso.setState({ hidratado: false });
  await progreso.persist.rehydrate();
  progreso.getState().marcarNivelCompletado("sembrar-semilla");
  comprobar(
    progreso.getState().hidratado,
    "sin almacenamiento el juego no se bloquea",
  );

  assert.equal(
    comprobaciones,
    COMPROBACIONES_ESPERADAS,
    "la regresión del Mundo 1 debe ejecutar exactamente 232 comprobaciones",
  );
});
