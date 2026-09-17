"use client";

interface PropiedadesBotonVolver {
  etiqueta: string;
  descripcion: string;
  alPulsar: () => void;
}

export default function BotonVolver({
  etiqueta,
  descripcion,
  alPulsar,
}: PropiedadesBotonVolver) {
  return (
    <button
      type="button"
      onClick={alPulsar}
      className="group flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#f9efdb]/15 bg-[#2b2151] px-3 text-xs font-black tracking-[0.08em] text-[#f9efdb]/72 shadow-[0_4px_0_#0e0a20] transition-all hover:-translate-y-0.5 hover:border-[#f7c948]/55 hover:text-[#f7c948] active:translate-y-0.5 active:shadow-[0_2px_0_#0e0a20] sm:px-3.5"
      aria-label={descripcion}
    >
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11.8 4.3 6.1 10l5.7 5.7M6.5 10h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="hidden sm:inline">{etiqueta}</span>
    </button>
  );
}
