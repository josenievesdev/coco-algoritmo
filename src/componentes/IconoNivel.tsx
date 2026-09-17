import type { TipoIcono } from "@/tipos/juego";

interface PropiedadesIconoNivel {
  tipo: TipoIcono;
  className?: string;
}

export default function IconoNivel({
  tipo,
  className = "h-6 w-6",
}: PropiedadesIconoNivel) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tipo === "taza" && (
        <>
          <path d="M6 12h16v7a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7v-7Z" />
          <path d="M22 14h2a3.5 3.5 0 0 1 0 7h-2.4" />
          <path d="M11 4.5c-1.2 1.4 1.2 2.6 0 4M16 4.5c-1.2 1.4 1.2 2.6 0 4" />
        </>
      )}
      {tipo === "brote" && (
        <>
          <path d="M8 20h16l-2 8H10l-2-8Z" />
          <path d="M16 20v-8" />
          <path d="M16 13c0-4 2.5-6.5 7-6.5 0 4.5-2.5 6.5-7 6.5Z" />
          <path d="M16 15c0-3.3-2.2-5.5-6-5.5 0 3.7 2.2 5.5 6 5.5Z" />
        </>
      )}
      {tipo === "paleta" && (
        <>
          <path d="M10 13a6 6 0 0 1 12 0v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-9Z" />
          <path d="M16 24v5" />
          <path d="M13.5 12.5v6" />
        </>
      )}
      {tipo === "lavadora" && (
        <>
          <rect x="6" y="4" width="20" height="24" rx="3.5" />
          <path d="M6 10h20" />
          <circle cx="16" cy="19" r="5.5" />
          <path d="M20.5 7h1" />
        </>
      )}
      {tipo === "manos" && (
        <>
          <path d="M9 27v-7.5L6.5 14a1.7 1.7 0 0 1 3-1.5L12 17V7.5a1.6 1.6 0 0 1 3.2 0V15" />
          <path d="M15.2 15V5.8a1.6 1.6 0 0 1 3.2 0V15M18.4 15V7.5a1.6 1.6 0 0 1 3.2 0V20c0 4-2.5 7-6 7" />
          <path d="M24.5 6.5h3M26 5v3" />
        </>
      )}
      {tipo === "secuencia" && (
        <>
          <rect x="4" y="4" width="10" height="7" rx="2" />
          <rect x="11" y="13" width="10" height="7" rx="2" />
          <rect x="18" y="22" width="10" height="7" rx="2" />
          <path d="M9 11v3.5h2M16 20v3.5h2" />
        </>
      )}
      {tipo === "decision" && (
        <>
          <path d="M16 28V17" />
          <path d="M16 17 8 9M16 17l8-8" />
          <path d="M5 11V6h5M27 11V6h-5" />
        </>
      )}
      {tipo === "repeticion" && (
        <>
          <path d="M6 15a9 9 0 0 1 16-5.6L25 12" />
          <path d="M25 5.5V12h-6.5" />
          <path d="M26 17a9 9 0 0 1-16 5.6L7 20" />
          <path d="M7 26.5V20h6.5" />
        </>
      )}
      {tipo === "candado" && (
        <>
          <rect x="7" y="14" width="18" height="14" rx="3.5" />
          <path d="M11 14v-3.5a5 5 0 0 1 10 0V14" />
          <path d="M16 20v3" />
        </>
      )}
    </svg>
  );
}
