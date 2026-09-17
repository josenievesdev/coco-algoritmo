import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import {
  instalarAlmacenamiento,
  instalarAlmacenamientoBloqueado,
} from "./utilidades/almacenamientoFalso";
import {
  esIdentificadorHistorico,
  identificadoresHistoricos,
} from "@/datos/identificadoresHistoricos";
import {
  mundosDisponibles,
  nivelesDisponibles,
  obtenerEstadoMundo,
  obtenerNivel,
} from "@/datos/juegosDisponibles";
import {
  CLAVE_PROGRESO,
  MAXIMO_NIVELES_GUARDADOS,
  sanearProgreso,
  useProgresoJuego,
} from "@/juegos/progresoJuego";
import { obtenerOrdenCanonico } from "@/motor/mezclarNivel";

const idsMundo1 = [
  "preparar-cafe",
  "sembrar-semilla",
  "preparar-paleta",
  "lavar-ropa",
  "lavar-manos",
];

function nivelDecision() {
  const nivel = obtenerNivel("prepararse-salir");
  assert.ok(nivel && nivel.tipo === "decision");
  return nivel;
}

/**
 * Simula una recarga: reinicia el estado en memoria (lo que también escribe en
 * el almacenamiento), coloca el contenido guardado indicado y vuelve a hidratar.
 */
async function recargar(
  datos?: Map<string, string>,
  contenido?: string,
): Promise<void> {
  useProgresoJuego.setState({
    nivelesCompletados: [],
    ultimosOrdenes: {},
    hidratado: false,
    almacenamientoDisponible: true,
  });

  if (datos && contenido !== undefined) {
    datos.set(CLAVE_PROGRESO, contenido);
  }

  await useProgresoJuego.persist.rehydrate();
}

describe("registro histórico de identificadores", () => {
  test("todos los niveles del catálogo están registrados", () => {
    for (const nivel of nivelesDisponibles) {
      assert.ok(
        esIdentificadorHistorico(nivel.identificador),
        `${nivel.identificador} no está en el registro`,
      );
    }
  });

  test("no hay identificadores duplicados en el registro ni en el catálogo", () => {
    assert.equal(
      new Set(identificadoresHistoricos).size,
      identificadoresHistoricos.length,
    );
    const delCatalogo = nivelesDisponibles.map((nivel) => nivel.identificador);
    assert.equal(new Set(delCatalogo).size, delCatalogo.length);
  });

  test("solo acepta textos registrados", () => {
    assert.equal(esIdentificadorHistorico("inventado"), false);
    assert.equal(esIdentificadorHistorico(3), false);
    assert.equal(esIdentificadorHistorico(null), false);
    assert.equal(esIdentificadorHistorico("salir-lluvia"), true);
  });
});

describe("saneamiento del progreso", () => {
  test("descarta desconocidos, duplicados y tipos incorrectos", () => {
    const saneado = sanearProgreso({
      nivelesCompletados: [
        "salir-lluvia",
        "salir-lluvia",
        "inventado",
        42,
        null,
        { identificador: "cruzar-calle" },
        "preparar-cafe",
      ],
      ultimosOrdenes: "no es un objeto",
    });

    assert.deepEqual(saneado.nivelesCompletados, ["salir-lluvia", "preparar-cafe"]);
    assert.deepEqual(saneado.ultimosOrdenes, {});
  });

  test("respeta el máximo de identificadores guardados", () => {
    const enorme = Array.from({ length: 1000 }, (_, indice) =>
      identificadoresHistoricos[indice % identificadoresHistoricos.length],
    );
    const saneado = sanearProgreso({ nivelesCompletados: enorme });

    assert.ok(saneado.nivelesCompletados.length <= MAXIMO_NIVELES_GUARDADOS);
    assert.equal(saneado.nivelesCompletados.length, identificadoresHistoricos.length);
  });

  test("conserva solo órdenes válidos de niveles del catálogo", () => {
    const nivel = nivelDecision();
    const valido = [...obtenerOrdenCanonico(nivel)].reverse();
    const [primero, ...resto] = valido;
    const saneado = sanearProgreso({
      nivelesCompletados: [],
      ultimosOrdenes: {
        [nivel.identificador]: valido,
        "cuidar-planta": [primero, ...resto],
        "cruzar-calle": ["cruzar", "cruzar", "esperar", "tengo-prisa", "correr-sin-mirar"],
        "salir-lluvia": ["esta-lloviendo"],
        "cargar-celular": [...obtenerOrdenCanonico(nivel).slice(0, 6)],
        "nivel-inventado": ["a", "b", "c"],
        "preparar-cafe": "texto",
      },
    });

    assert.deepEqual(Object.keys(saneado.ultimosOrdenes), [nivel.identificador]);
    assert.deepEqual(saneado.ultimosOrdenes[nivel.identificador], valido);
  });

  test("valores que no son objetos devuelven progreso inicial", () => {
    for (const valor of [null, undefined, 3, "texto", [], true]) {
      assert.deepEqual(sanearProgreso(valor), {
        nivelesCompletados: [],
        ultimosOrdenes: {},
      });
    }
  });
});

describe("persistencia en el navegador", () => {
  let datos: Map<string, string>;

  beforeEach(() => {
    datos = instalarAlmacenamiento();
  });

  test("el progreso actual del Mundo 1 sobrevive a la actualización", async () => {
    // Formato exacto que guarda la versión publicada del Mundo 1.
    const ordenCafe = ["agregar-cafe", "calentar-agua", "servir", "mezclar", "agregar-azucar"];
    await recargar(
      datos,
      JSON.stringify({
        state: {
          nivelesCompletados: idsMundo1,
          ultimosOrdenes: { "preparar-cafe": ordenCafe },
        },
        version: 1,
      }),
    );
    const estado = useProgresoJuego.getState();

    assert.deepEqual(estado.nivelesCompletados, idsMundo1);
    assert.deepEqual(estado.ultimosOrdenes["preparar-cafe"], ordenCafe);
    assert.equal(
      obtenerEstadoMundo(mundosDisponibles[1], estado.nivelesCompletados),
      "disponible",
    );

    const reescrito = JSON.parse(datos.get(CLAVE_PROGRESO) ?? "null");
    assert.equal(reescrito.version, 1);
    assert.deepEqual(reescrito.state.nivelesCompletados, idsMundo1);
  });

  test("guarda el progreso del Mundo 2 sin campos internos", async () => {
    await recargar();
    const nivel = nivelDecision();
    const orden = [...obtenerOrdenCanonico(nivel)].reverse();

    useProgresoJuego.getState().marcarNivelCompletado("salir-lluvia");
    useProgresoJuego.getState().registrarOrdenInicial(nivel.identificador, orden);

    const guardado = JSON.parse(datos.get(CLAVE_PROGRESO) ?? "null");
    assert.deepEqual(guardado.state.nivelesCompletados, ["salir-lluvia"]);
    assert.deepEqual(guardado.state.ultimosOrdenes[nivel.identificador], orden);
    assert.equal("hidratado" in guardado.state, false);
    assert.equal("almacenamientoDisponible" in guardado.state, false);

    await recargar(datos, JSON.stringify(guardado));
    assert.deepEqual(useProgresoJuego.getState().nivelesCompletados, ["salir-lluvia"]);
  });

  test("no marca como completado un identificador inventado", async () => {
    await recargar();
    useProgresoJuego.getState().marcarNivelCompletado("inventado");
    useProgresoJuego.getState().marcarNivelCompletado("cruzar-calle");
    useProgresoJuego.getState().marcarNivelCompletado("cruzar-calle");

    assert.deepEqual(useProgresoJuego.getState().nivelesCompletados, ["cruzar-calle"]);
  });

  test("JSON corrupto arranca con progreso inicial", async () => {
    await recargar(datos, "{roto");

    assert.equal(useProgresoJuego.getState().hidratado, true);
    assert.deepEqual(useProgresoJuego.getState().nivelesCompletados, []);
    assert.equal(useProgresoJuego.getState().almacenamientoDisponible, true);
  });

  test("con localStorage bloqueado funciona en memoria y lo avisa", async () => {
    instalarAlmacenamientoBloqueado();
    await recargar();
    const estado = useProgresoJuego.getState();

    assert.equal(estado.hidratado, true);
    assert.equal(estado.almacenamientoDisponible, false);

    estado.marcarNivelCompletado("preparar-cafe");
    assert.deepEqual(useProgresoJuego.getState().nivelesCompletados, ["preparar-cafe"]);
  });
});
