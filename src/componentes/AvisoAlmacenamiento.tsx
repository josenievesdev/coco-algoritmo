"use client";

import { useProgresoJuego } from "@/juegos/progresoJuego";

/** Aviso discreto cuando el navegador no permite guardar el progreso. */
export default function AvisoAlmacenamiento() {
  const hidratado = useProgresoJuego((estado) => estado.hidratado);
  const disponible = useProgresoJuego(
    (estado) => estado.almacenamientoDisponible,
  );

  if (!hidratado || disponible) {
    return null;
  }

  return (
    <p
      role="status"
      className="mx-auto mt-4 flex w-full max-w-7xl items-center gap-2 rounded-xl border border-[#f7c948]/35 bg-[#f7c948]/10 px-3 py-2 text-sm font-bold text-[#f7c948]"
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#f7c948] text-xs font-black text-[#17122f]"
        aria-hidden="true"
      >
        i
      </span>
      Tu progreso no se guardará en este navegador. Puedes jugar, pero se
      perderá al cerrar la página.
    </p>
  );
}
