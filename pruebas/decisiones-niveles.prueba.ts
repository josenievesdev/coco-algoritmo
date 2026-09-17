import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { esIdentificadorHistorico } from "@/datos/identificadoresHistoricos";
import { obtenerNivelesDeMundo } from "@/datos/juegosDisponibles";
import {
  construirColocacionDesdeSolucion,
  obtenerEspaciosOrdenados,
  obtenerFichasDeSolucion,
  ordenZonas,
} from "@/motor/programaDecision";
import { validarDecision } from "@/motor/validarDecision";
import type { NivelDecision } from "@/tipos/juego";

const niveles = obtenerNivelesDeMundo("decisiones").filter(
  (nivel): nivel is NivelDecision => nivel.tipo === "decision",
);

/**
 * Recorre todas las colocaciones completas posibles (cada ficha como mucho una
 * vez, respetando los espacios guiados) y cuenta las correctas.
 */
function contarColocacionesCorrectas(nivel: NivelDecision): {
  correctas: number;
  revisadas: number;
} {
  const espacios = obtenerEspaciosOrdenados(nivel);
  const colocacion: Record<string, string | null> = {};
  const usadas = new Set<string>();
  let correctas = 0;
  let revisadas = 0;

  const recorrer = (indice: number) => {
    if (indice === espacios.length) {
      revisadas += 1;
      const resultado = validarDecision(nivel, colocacion);
      assert.notEqual(resultado.estado, "invalida");
      assert.notEqual(resultado.estado, "incompleta");

      if (resultado.estado === "correcta") {
        correctas += 1;
      }
      return;
    }

    const espacio = espacios[indice];

    for (const ficha of nivel.fichas) {
      const cabe = espacio.acepta === "cualquiera" || espacio.acepta === ficha.tipo;

      if (usadas.has(ficha.identificador) || !cabe) {
        continue;
      }

      usadas.add(ficha.identificador);
      colocacion[espacio.identificador] = ficha.identificador;
      recorrer(indice + 1);
      usadas.delete(ficha.identificador);
      colocacion[espacio.identificador] = null;
    }
  };

  recorrer(0);
  return { correctas, revisadas };
}

describe("niveles del Mundo 2", () => {
  test("hay cinco niveles numerados del 1 al 5", () => {
    assert.deepEqual(
      niveles.map((nivel) => nivel.numero),
      [1, 2, 3, 4, 5],
    );
    assert.deepEqual(
      niveles.map((nivel) => nivel.identificador),
      ["salir-lluvia", "cruzar-calle", "cargar-celular", "cuidar-planta", "prepararse-salir"],
    );
  });

  test("los niveles 1 a 3 son guiados y los 4 y 5 son libres", () => {
    for (const nivel of niveles) {
      const libres = nivel.espacios.every((espacio) => espacio.acepta === "cualquiera");
      const guiados = nivel.espacios.every((espacio) => espacio.acepta !== "cualquiera");

      if (nivel.numero <= 3) {
        assert.ok(guiados, `${nivel.identificador} debe ser guiado`);
      } else {
        assert.ok(libres, `${nivel.identificador} debe ser libre`);
      }
    }
  });

  test("estructura progresiva: SI NO desde el 2, ANTES desde el 3, DESPUÉS en el 5", () => {
    const zonas = niveles.map((nivel) =>
      ordenZonas.filter((zona) => nivel.espacios.some((espacio) => espacio.zona === zona)).join(),
    );

    assert.deepEqual(zonas, [
      "condicion,entonces",
      "condicion,entonces,siNo",
      "antes,condicion,entonces,siNo",
      "antes,condicion,entonces,siNo",
      "antes,condicion,entonces,siNo,despues",
    ]);
  });

  for (const nivel of niveles) {
    describe(nivel.identificador, () => {
      test("tiene exactamente una colocación correcta", () => {
        const { correctas, revisadas } = contarColocacionesCorrectas(nivel);

        assert.ok(revisadas > 1);
        assert.equal(correctas, 1, `${nivel.identificador}: ${correctas} soluciones`);
      });

      test("datos coherentes y registrados", () => {
        const fichas = nivel.fichas.map((ficha) => ficha.identificador);
        const espacios = nivel.espacios.map((espacio) => espacio.identificador);
        const solucion = nivel.soluciones[0];
        const enSolucion = ordenZonas.flatMap((zona) =>
          obtenerFichasDeSolucion(solucion, zona),
        );

        assert.ok(esIdentificadorHistorico(nivel.identificador));
        assert.equal(nivel.soluciones.length, 1);
        assert.equal(new Set(fichas).size, fichas.length);
        assert.equal(new Set(espacios).size, espacios.length);
        assert.equal(new Set(enSolucion).size, enSolucion.length);
        assert.ok(nivel.fichas.length - enSolucion.length >= 2, "al menos dos distractores");

        // El orden canónico empieza por la solución en orden de lectura.
        assert.deepEqual(fichas.slice(0, enSolucion.length), enSolucion);

        for (const zona of ordenZonas) {
          const tipoEsperado = zona === "condicion" ? "condicion" : "accion";

          for (const identificador of obtenerFichasDeSolucion(solucion, zona)) {
            const ficha = nivel.fichas.find((candidata) => candidata.identificador === identificador);
            assert.equal(ficha?.tipo, tipoEsperado, `${identificador} en ${zona}`);
          }
        }

        assert.deepEqual(
          validarDecision(nivel, construirColocacionDesdeSolucion(nivel, solucion)),
          { estado: "correcta", indiceSolucion: 0 },
        );
        assert.deepEqual(
          nivel.escenarios.map((escenario) => escenario.condicionCumplida),
          [true, false],
        );
        assert.equal(nivel.mensajes.celebracion.length > 0, true);
      });
    });
  }

  test("cada nivel tiene su propia animación", () => {
    const animaciones = niveles.map((nivel) => nivel.tipoAnimacion);
    assert.equal(new Set(animaciones).size, animaciones.length);
  });
});
