const nombreCache = "coco-algoritmo-v1";
const recursosIniciales = [
  "/",
  "/manifiesto.webmanifest",
  "/icono-coco.svg",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(nombreCache)
      .then((cache) => cache.addAll(recursosIniciales))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") {
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then((respuestaGuardada) => {
      if (respuestaGuardada) {
        return respuestaGuardada;
      }

      return fetch(evento.request)
        .then((respuestaRed) => {
          const copiaRespuesta = respuestaRed.clone();
          caches.open(nombreCache).then((cache) => {
            cache.put(evento.request, copiaRespuesta);
          });
          return respuestaRed;
        })
        .catch(() => caches.match("/"));
    }),
  );
});
