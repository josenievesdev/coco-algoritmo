const prefijoCache = "coco-algoritmo-";
const nombreCache = `${prefijoCache}v2`;
const recursosIniciales = [
  "/",
  "/manifiesto.webmanifest",
  "/icono-coco.svg",
];
// Las cabeceras `Vary` del servidor no deben impedir usar la copia guardada.
const opcionesBusqueda = { ignoreVary: true };

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(nombreCache)
      .then((cache) =>
        // `reload` evita que la precarga tome copias viejas de la caché HTTP.
        cache.addAll(
          recursosIniciales.map(
            (ruta) => new Request(ruta, { cache: "reload" }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter(
              (nombre) =>
                nombre.startsWith(prefijoCache) && nombre !== nombreCache,
            )
            .map((nombre) => caches.delete(nombre)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function esNavegacion(solicitud) {
  return (
    solicitud.mode === "navigate" ||
    solicitud.destination === "document" ||
    (solicitud.headers.get("accept") || "").includes("text/html")
  );
}

function esGuardable(respuesta) {
  // `basic` garantiza una respuesta del mismo origen que no es opaca.
  return Boolean(
    respuesta &&
      respuesta.ok &&
      respuesta.type === "basic" &&
      !respuesta.redirected,
  );
}

function guardarEnCache(evento, solicitud, respuesta) {
  if (!esGuardable(respuesta)) {
    return;
  }

  const copia = respuesta.clone();

  evento.waitUntil(
    caches
      .open(nombreCache)
      .then((cache) => cache.put(solicitud, copia))
      .catch(() => undefined),
  );
}

function primeroRed(evento, respaldo) {
  const { request: solicitud } = evento;

  return fetch(solicitud)
    .then((respuesta) => {
      guardarEnCache(evento, solicitud, respuesta);
      return respuesta;
    })
    .catch(() =>
      caches
        .match(solicitud, opcionesBusqueda)
        .then((guardada) => {
          if (guardada || !respaldo) {
            return guardada;
          }

          return caches.match(respaldo, opcionesBusqueda);
        })
        .then((guardada) => guardada || Response.error()),
    );
}

function primeroCache(evento) {
  const { request: solicitud } = evento;

  return caches.match(solicitud, opcionesBusqueda).then((guardada) => {
    if (guardada) {
      return guardada;
    }

    return fetch(solicitud).then((respuesta) => {
      guardarEnCache(evento, solicitud, respuesta);
      return respuesta;
    });
  });
}

self.addEventListener("fetch", (evento) => {
  const { request: solicitud } = evento;

  if (solicitud.method !== "GET") {
    return;
  }

  const direccion = new URL(solicitud.url);

  if (direccion.origin !== self.location.origin) {
    return;
  }

  if (esNavegacion(solicitud)) {
    // HTML siempre desde la red; la copia guardada solo se usa sin conexión.
    evento.respondWith(primeroRed(evento, "/"));
    return;
  }

  if (direccion.pathname.startsWith("/_next/static/")) {
    // Archivos con nombre versionado por Next.js: seguros de conservar.
    evento.respondWith(primeroCache(evento));
    return;
  }

  evento.respondWith(primeroRed(evento));
});
