import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { obtenerNivel } from "@/datos/juegosDisponibles";
import {
  ERRORES_PARA_PISTA,
  useEstadoDecision,
} from "@/juegos/estadoDecision";
import {
  construirColocacionDesdeSolucion,
  construirPrograma,
  crearColocacionVacia,
} from "@/motor/programaDecision";
import { obtenerZonaPista, validarDecision } from "@/motor/validarDecision";
import type { NivelDecision, ResultadoValidacionDecision } from "@/tipos/juego";

function nivelDecision(identificador: string): NivelDecision {
  const nivel = obtenerNivel(identificador);
  assert.ok(nivel && nivel.tipo === "decision", identificador);
  return nivel;
}

function solucionDe(nivel: NivelDecision) {
  return construirColocacionDesdeSolucion(nivel, nivel.soluciones[0]);
}

function errores(resultado: ResultadoValidacionDecision) {
  assert.equal(resultado.estado, "incorrecta");
  return resultado.estado === "incorrecta" ? resultado.errores : [];
}

const lluvia = nivelDecision("salir-lluvia");
const calle = nivelDecision("cruzar-calle");
const celular = nivelDecision("cargar-celular");
const planta = nivelDecision("cuidar-planta");
const salir = nivelDecision("prepararse-salir");

/** Nivel sintético con dos pasos en ANTES para probar el orden. */
const nivelDosPasos: NivelDecision = {
  ...salir,
  identificador: "nivel-sintetico-de-prueba",
  espacios: [
    { identificador: "antes-1", zona: "antes", orden: 1, acepta: "accion" },
    { identificador: "antes-2", zona: "antes", orden: 2, acepta: "accion" },
    { identificador: "condicion", zona: "condicion", orden: 1, acepta: "condicion" },
    { identificador: "entonces-1", zona: "entonces", orden: 1, acepta: "accion" },
    { identificador: "si-no-1", zona: "siNo", orden: 1, acepta: "accion" },
  ],
  soluciones: [
    {
      antes: ["mirar-reloj", "mirar-termometro"],
      condicion: "hace-frio",
      entonces: ["ponerse-chaqueta"],
      siNo: ["ponerse-ropa-ligera"],
      despues: [],
    },
  ],
};

describe("validarDecision", () => {
  test("tablero vacío o incompleto nunca da error", () => {
    const vacia = validarDecision(calle, crearColocacionVacia(calle));
    assert.equal(vacia.estado, "incompleta");
    assert.deepEqual(
      vacia.estado === "incompleta" ? vacia.espaciosVacios : [],
      ["condicion", "entonces-1", "si-no-1"],
    );

    const casi = { ...solucionDe(calle), "si-no-1": null };
    assert.equal(validarDecision(calle, casi).estado, "incompleta");

    const casiMal = { condicion: "tengo-prisa", "entonces-1": "esperar", "si-no-1": null };
    assert.equal(validarDecision(calle, casiMal).estado, "incompleta");
  });

  test("las claves ausentes cuentan como espacios vacíos", () => {
    assert.equal(validarDecision(calle, {}).estado, "incompleta");
  });

  test("solución correcta sin rama SI NO", () => {
    const resultado = validarDecision(lluvia, solucionDe(lluvia));
    assert.deepEqual(resultado, { estado: "correcta", indiceSolucion: 0 });
    assert.equal(construirPrograma(lluvia, solucionDe(lluvia)).siNo, null);
  });

  test("solución correcta con rama SI NO en los cinco niveles", () => {
    for (const nivel of [calle, celular, planta, salir]) {
      assert.equal(validarDecision(nivel, solucionDe(nivel)).estado, "correcta");
    }
  });

  test("ramas intercambiadas", () => {
    const colocacion = {
      condicion: "semaforo-verde",
      "entonces-1": "esperar",
      "si-no-1": "cruzar",
    };
    const lista = errores(validarDecision(calle, colocacion));

    assert.deepEqual(
      lista.map((error) => `${error.zona}:${error.tipo}`),
      ["entonces:ramas-intercambiadas", "siNo:ramas-intercambiadas"],
    );
  });

  test("acción colocada como condición en un nivel libre", () => {
    const colocacion = {
      ...solucionDe(planta),
      "antes-1": "tierra-seca",
      condicion: "tocar-tierra",
    };
    const lista = errores(validarDecision(planta, colocacion));

    assert.equal(lista[0].zona, "antes");
    assert.equal(lista[0].tipo, "tipo-incorrecto");
    assert.ok(
      lista.some(
        (error) => error.zona === "condicion" && error.tipo === "tipo-incorrecto",
      ),
    );
  });

  test("orden incorrecto en ANTES", () => {
    const colocacion = {
      ...solucionDe(nivelDosPasos),
      "antes-1": "mirar-termometro",
      "antes-2": "mirar-reloj",
    };
    const lista = errores(validarDecision(nivelDosPasos, colocacion));

    assert.deepEqual(lista, [
      { zona: "antes", tipo: "orden-incorrecto", espacios: ["antes-1", "antes-2"] },
    ]);
  });

  test("distractor en cada zona", () => {
    const casos = [
      { espacio: "antes-1", ficha: "mirar-reloj", zona: "antes" },
      { espacio: "condicion", ficha: "es-lunes", zona: "condicion" },
      { espacio: "entonces-1", ficha: "quitarse-zapatos", zona: "entonces" },
      { espacio: "si-no-1", ficha: "quitarse-zapatos", zona: "siNo" },
      { espacio: "despues-1", ficha: "quitarse-zapatos", zona: "despues" },
    ] as const;

    for (const caso of casos) {
      const colocacion = { ...solucionDe(salir), [caso.espacio]: caso.ficha };
      const lista = errores(validarDecision(salir, colocacion));

      assert.deepEqual(lista, [
        { zona: caso.zona, tipo: "distractor", espacios: [caso.espacio] },
      ]);
    }
  });

  test("ficha de la solución en otra zona", () => {
    const colocacion = {
      ...solucionDe(salir),
      "entonces-1": "salir-casa",
      "despues-1": "ponerse-chaqueta",
    };
    const lista = errores(validarDecision(salir, colocacion));

    assert.deepEqual(
      lista.map((error) => `${error.zona}:${error.tipo}`),
      ["entonces:ficha-fuera-de-lugar", "despues:ficha-fuera-de-lugar"],
    );
  });

  test("fichas duplicadas, desconocidas y espacios desconocidos", () => {
    const base = solucionDe(calle);

    assert.deepEqual(
      validarDecision(calle, { ...base, "si-no-1": "cruzar" }),
      { estado: "invalida", motivo: "ficha-duplicada" },
    );
    assert.deepEqual(
      validarDecision(calle, { ...base, "si-no-1": "volar" }),
      { estado: "invalida", motivo: "ficha-desconocida" },
    );
    assert.deepEqual(
      validarDecision(calle, { ...base, "despues-1": "cruzar" }),
      { estado: "invalida", motivo: "espacio-desconocido" },
    );
    assert.deepEqual(
      validarDecision(calle, { ...base, condicion: "cruzar", "entonces-1": "semaforo-verde" }),
      { estado: "invalida", motivo: "tipo-no-aceptado" },
    );
  });

  test("datos corruptos", () => {
    for (const valor of [null, undefined, "texto", 7, [], ["cruzar"]]) {
      assert.deepEqual(validarDecision(calle, valor), {
        estado: "invalida",
        motivo: "estructura-invalida",
      });
    }

    assert.deepEqual(validarDecision(calle, { condicion: 5 }), {
      estado: "invalida",
      motivo: "estructura-invalida",
    });
  });

  test("la zona de la pista es la primera con error y no incluye fichas", () => {
    const colocacion = {
      condicion: "tengo-prisa",
      "entonces-1": "esperar",
      "si-no-1": "correr-sin-mirar",
    };
    const resultado = validarDecision(calle, colocacion);

    assert.equal(obtenerZonaPista(resultado), "condicion");
    assert.equal(obtenerZonaPista(validarDecision(calle, {})), null);
  });
});

describe("partida de decisiones", () => {
  const partida = useEstadoDecision;
  const bandeja = ["correr-sin-mirar", "esperar", "semaforo-verde", "tengo-prisa", "cruzar"];

  beforeEach(() => {
    partida.getState().iniciarNivel(calle, bandeja);
  });

  test("empieza vacía y con la bandeja indicada", () => {
    const estado = partida.getState();

    assert.deepEqual(estado.colocacion, crearColocacionVacia(calle));
    assert.deepEqual(estado.bandeja, bandeja);
    assert.equal(estado.resultado, "jugando");
    assert.equal(estado.erroresCompletos, 0);
    assert.equal(estado.zonaPista, null);
  });

  test("los espacios guiados rechazan fichas de otro tipo", () => {
    const respuesta = partida.getState().colocarFicha("semaforo-verde", "entonces-1");

    assert.equal(respuesta.accion, "rechazada");
    assert.equal(partida.getState().colocacion["entonces-1"], null);
  });

  test("no hay error mientras falten espacios y retirar vuelve a neutral", () => {
    const estado = partida.getState();
    assert.equal(estado.colocarFicha("tengo-prisa", "condicion").evaluacion, "incompleta");
    assert.equal(estado.colocarFicha("esperar", "entonces-1").evaluacion, "incompleta");
    assert.equal(partida.getState().resultado, "jugando");

    assert.equal(estado.colocarFicha("cruzar", "si-no-1").evaluacion, "incorrecta");
    assert.equal(partida.getState().resultado, "error");
    assert.equal(partida.getState().erroresCompletos, 1);

    assert.equal(estado.retirarFicha("si-no-1").evaluacion, "incompleta");
    assert.equal(partida.getState().resultado, "jugando");

    // Misma colocación otra vez: no se evalúa ni se cuenta de nuevo.
    assert.equal(estado.colocarFicha("cruzar", "si-no-1").evaluacion, "repetida");
    assert.equal(partida.getState().resultado, "error");
    assert.equal(partida.getState().erroresCompletos, 1);
  });

  test("la pista aparece después de tres errores completos distintos", () => {
    const estado = partida.getState();
    estado.colocarFicha("tengo-prisa", "condicion");
    estado.colocarFicha("esperar", "entonces-1");
    estado.colocarFicha("cruzar", "si-no-1");
    assert.equal(partida.getState().zonaPista, null);

    estado.colocarFicha("correr-sin-mirar", "si-no-1");
    assert.equal(partida.getState().erroresCompletos, 2);
    assert.equal(partida.getState().zonaPista, null);

    estado.colocarFicha("semaforo-verde", "condicion");
    assert.equal(partida.getState().erroresCompletos, ERRORES_PARA_PISTA);
    assert.equal(partida.getState().zonaPista, "entonces");
  });

  test("intercambia fichas y devuelve a la bandeja la ficha reemplazada", () => {
    const estado = partida.getState();
    estado.colocarFicha("cruzar", "entonces-1");
    estado.colocarFicha("esperar", "si-no-1");

    const respuesta = estado.colocarFicha("cruzar", "si-no-1");
    assert.equal(respuesta.accion, "intercambiada");
    assert.equal(partida.getState().colocacion["si-no-1"], "cruzar");
    assert.equal(partida.getState().colocacion["entonces-1"], "esperar");

    estado.colocarFicha("correr-sin-mirar", "entonces-1");
    assert.equal(partida.getState().colocacion["entonces-1"], "correr-sin-mirar");
    assert.ok(!Object.values(partida.getState().colocacion).includes("esperar"));
    assert.deepEqual(partida.getState().bandeja, bandeja);
  });

  test("en niveles libres el intercambio conserva ambas fichas", () => {
    partida.getState().iniciarNivel(planta, [...planta.fichas.map((f) => f.identificador)].reverse());
    const estado = partida.getState();
    estado.colocarFicha("tierra-seca", "antes-1");
    estado.colocarFicha("tocar-tierra", "condicion");
    estado.colocarFicha("tierra-seca", "condicion");

    assert.equal(partida.getState().colocacion.condicion, "tierra-seca");
    assert.equal(partida.getState().colocacion["antes-1"], "tocar-tierra");
  });

  test("al acertar se bloquean nuevos movimientos", () => {
    const estado = partida.getState();
    estado.colocarFicha("semaforo-verde", "condicion");
    estado.colocarFicha("cruzar", "entonces-1");
    assert.equal(estado.colocarFicha("esperar", "si-no-1").evaluacion, "correcta");
    assert.equal(partida.getState().resultado, "exito");

    assert.equal(estado.retirarFicha("si-no-1").accion, "sin-cambio");
    assert.equal(estado.colocarFicha("tengo-prisa", "condicion").accion, "rechazada");
  });

  test("reiniciar borra colocación, errores y pista", () => {
    const estado = partida.getState();
    estado.colocarFicha("tengo-prisa", "condicion");
    estado.colocarFicha("esperar", "entonces-1");
    estado.colocarFicha("cruzar", "si-no-1");

    partida.getState().iniciarNivel(calle, [...bandeja].reverse());
    const reiniciado = partida.getState();

    assert.deepEqual(reiniciado.colocacion, crearColocacionVacia(calle));
    assert.equal(reiniciado.erroresCompletos, 0);
    assert.equal(reiniciado.zonaPista, null);
    assert.equal(reiniciado.resultado, "jugando");
    assert.deepEqual(reiniciado.bandeja, [...bandeja].reverse());
  });

  test("una colocación corrupta reinicia el tablero sin penalizar", () => {
    partida.getState().colocarFicha("tengo-prisa", "condicion");
    partida.getState().colocarFicha("esperar", "entonces-1");
    partida.getState().colocarFicha("cruzar", "si-no-1");
    partida.setState({
      colocacion: { condicion: "tengo-prisa", "entonces-1": "tengo-prisa", "si-no-1": null },
    });

    const respuesta = partida.getState().colocarFicha("esperar", "si-no-1");

    assert.equal(respuesta.evaluacion, "reiniciada");
    assert.deepEqual(partida.getState().colocacion, crearColocacionVacia(calle));
    assert.equal(partida.getState().erroresCompletos, 1);
    assert.equal(partida.getState().resultado, "jugando");
  });

  test("rechaza fichas y espacios que no existen", () => {
    const estado = partida.getState();

    assert.equal(estado.colocarFicha("volar", "condicion").accion, "rechazada");
    assert.equal(estado.colocarFicha("cruzar", "despues-1").accion, "rechazada");
  });
});
