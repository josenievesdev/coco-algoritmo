import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { crearAleatorio } from "./utilidades/almacenamientoFalso";
import { nivelesDisponibles } from "@/datos/juegosDisponibles";
import { obtenerSolucion } from "@/juegos/estadoJuego";
import {
  esPermutacionDelNivel,
  mezclarOrdenInicial,
  obtenerOrdenCanonico,
} from "@/motor/mezclarNivel";
import { mezclarPasos, sonSecuenciasIguales } from "@/motor/mezclarPasos";

describe("mezcla de fichas", () => {
  test("nunca repite el orden canónico ni el último orden en ningún nivel", () => {
    const aleatorio = crearAleatorio(20260916);

    for (const nivel of nivelesDisponibles) {
      const canonico = obtenerOrdenCanonico(nivel);
      let anterior: string[] | undefined;

      for (let intento = 0; intento < 2000; intento += 1) {
        const orden = mezclarOrdenInicial(nivel, anterior, aleatorio);

        assert.ok(esPermutacionDelNivel(nivel, orden), nivel.identificador);
        assert.ok(!sonSecuenciasIguales(orden, canonico), nivel.identificador);
        assert.ok(!sonSecuenciasIguales(orden, anterior), nivel.identificador);
        anterior = orden;
      }
    }
  });

  test("la fuente aleatoria controlada produce resultados reproducibles", () => {
    const nivel = nivelesDisponibles.find(
      (candidato) => candidato.tipo === "decision",
    );
    assert.ok(nivel);

    const primera = mezclarOrdenInicial(nivel, undefined, crearAleatorio(7));
    const segunda = mezclarOrdenInicial(nivel, undefined, crearAleatorio(7));

    assert.deepEqual(primera, segunda);
  });

  test("con una fuente aleatoria degenerada recurre a la rotación", () => {
    const siempreIgual = () => 0.9999999;

    for (const nivel of nivelesDisponibles) {
      const canonico = obtenerOrdenCanonico(nivel);
      const primera = mezclarOrdenInicial(nivel, undefined, siempreIgual);
      const segunda = mezclarOrdenInicial(nivel, primera, siempreIgual);

      assert.ok(!sonSecuenciasIguales(primera, canonico));
      assert.ok(!sonSecuenciasIguales(segunda, canonico));
      assert.ok(!sonSecuenciasIguales(segunda, primera));
    }
  });

  test("ignora un orden anterior corrupto o de otro nivel", () => {
    const [nivelA, nivelB] = nivelesDisponibles.filter(
      (candidato) => candidato.tipo === "decision",
    );
    const ajeno = obtenerOrdenCanonico(nivelA);
    const orden = mezclarOrdenInicial(nivelB, ajeno, crearAleatorio(3));

    assert.ok(esPermutacionDelNivel(nivelB, orden));
    assert.equal(esPermutacionDelNivel(nivelB, ["x", "x"]), false);
    assert.equal(esPermutacionDelNivel(nivelB, "texto"), false);
  });

  test("en el Mundo 1 se comporta exactamente como mezclarPasos", () => {
    for (const nivel of nivelesDisponibles) {
      if (nivel.tipo !== "secuencia") {
        continue;
      }

      const adaptada = mezclarOrdenInicial(nivel, undefined, crearAleatorio(11));
      const original = mezclarPasos(
        obtenerSolucion(nivel),
        undefined,
        crearAleatorio(11),
      );

      assert.deepEqual(adaptada, original);
    }
  });
});
