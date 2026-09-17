import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  contarNivelesCompletados,
  mundosDisponibles,
  obtenerEstadoMundo,
  obtenerEstadoNivel,
  obtenerMundo,
  obtenerNivelesDeMundo,
} from "@/datos/juegosDisponibles";
import type { IdentificadorMundo, Mundo } from "@/tipos/juego";

const idsMundo1 = obtenerNivelesDeMundo("primeros-algoritmos").map(
  (nivel) => nivel.identificador,
);
const idsMundo2 = obtenerNivelesDeMundo("decisiones").map(
  (nivel) => nivel.identificador,
);

function mundo(identificador: IdentificadorMundo): Mundo {
  const encontrado = obtenerMundo(identificador);
  assert.ok(encontrado);
  return encontrado;
}

function estadosMundo2(completados: readonly string[]): string {
  return obtenerNivelesDeMundo("decisiones")
    .map((nivel) => obtenerEstadoNivel(nivel, completados))
    .join();
}

describe("desbloqueo entre mundos", () => {
  test("cada mundo tiene cinco niveles y el Mundo 2 es de decisiones", () => {
    assert.equal(idsMundo1.length, 5);
    assert.equal(idsMundo2.length, 5);
    assert.ok(
      obtenerNivelesDeMundo("decisiones").every(
        (nivel) => nivel.tipo === "decision",
      ),
    );
  });

  test("el Mundo 1 está disponible desde el inicio", () => {
    assert.equal(obtenerEstadoMundo(mundo("primeros-algoritmos"), []), "disponible");
  });

  test("el Mundo 2 sigue bloqueado con 0 y con 4 de 5 niveles", () => {
    assert.equal(obtenerEstadoMundo(mundo("decisiones"), []), "bloqueado");
    assert.equal(
      obtenerEstadoMundo(mundo("decisiones"), idsMundo1.slice(0, 4)),
      "bloqueado",
    );
    assert.equal(
      estadosMundo2(idsMundo1.slice(0, 4)),
      "bloqueado,bloqueado,bloqueado,bloqueado,bloqueado",
    );
  });

  test("el Mundo 2 se abre con 5 de 5 y sus niveles se abren en orden", () => {
    assert.equal(obtenerEstadoMundo(mundo("decisiones"), idsMundo1), "disponible");
    assert.equal(
      estadosMundo2(idsMundo1),
      "disponible,bloqueado,bloqueado,bloqueado,bloqueado",
    );

    const conDos = [...idsMundo1, ...idsMundo2.slice(0, 2)];
    assert.equal(
      estadosMundo2(conDos),
      "completado,completado,disponible,bloqueado,bloqueado",
    );
    assert.equal(contarNivelesCompletados("decisiones", conDos), 2);
    assert.equal(contarNivelesCompletados("primeros-algoritmos", conDos), 5);
  });

  test("el Mundo 2 queda completado con sus cinco niveles y sigue siendo repetible", () => {
    const todos = [...idsMundo1, ...idsMundo2];

    assert.equal(obtenerEstadoMundo(mundo("decisiones"), todos), "completado");
    assert.equal(
      estadosMundo2(todos),
      "completado,completado,completado,completado,completado",
    );
  });

  test("el Mundo 3 no está disponible aunque todo esté completado", () => {
    const todos = [...idsMundo1, ...idsMundo2];

    assert.equal(obtenerEstadoMundo(mundo("repeticiones"), todos), "proximamente");
    assert.equal(obtenerNivelesDeMundo("repeticiones").length, 0);
  });

  test("identificadores desconocidos no desbloquean contenido", () => {
    const inventados = ["inventado", "preparar-cafe-2", "decisiones", "", "__proto__"];

    assert.equal(obtenerEstadoMundo(mundo("decisiones"), inventados), "bloqueado");
    assert.equal(
      obtenerEstadoMundo(mundo("decisiones"), [...idsMundo1.slice(0, 4), ...inventados]),
      "bloqueado",
    );
    assert.equal(
      estadosMundo2([...idsMundo2.slice(1), ...inventados]),
      "bloqueado,bloqueado,bloqueado,bloqueado,bloqueado",
    );
  });

  test("los requisitos solo nombran niveles del catálogo actual", () => {
    for (const candidato of mundosDisponibles) {
      for (const identificador of candidato.requisito?.niveles ?? []) {
        const existe = [...idsMundo1, ...idsMundo2].includes(identificador);
        assert.ok(existe, `${candidato.identificador} requiere ${identificador}`);
      }
    }
  });
});
