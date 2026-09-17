interface AlmacenamientoSimulado {
  getItem: (clave: string) => string | null;
  setItem: (clave: string, valor: string) => void;
  removeItem: (clave: string) => void;
}

/** Instala un `window.localStorage` en memoria y devuelve sus datos. */
export function instalarAlmacenamiento(): Map<string, string> {
  const datos = new Map<string, string>();
  const almacenamiento: AlmacenamientoSimulado = {
    getItem: (clave) => datos.get(clave) ?? null,
    setItem: (clave, valor) => {
      datos.set(clave, valor);
    },
    removeItem: (clave) => {
      datos.delete(clave);
    },
  };

  Object.assign(globalThis, { window: { localStorage: almacenamiento } });
  return datos;
}

/** Simula un navegador que bloquea `localStorage` por completo. */
export function instalarAlmacenamientoBloqueado(): void {
  const ventana = {};

  Object.defineProperty(ventana, "localStorage", {
    get() {
      throw new Error("Almacenamiento bloqueado");
    },
  });
  Object.assign(globalThis, { window: ventana });
}

/** Fuente aleatoria reproducible (generador congruencial lineal). */
export function crearAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;

  return () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}
