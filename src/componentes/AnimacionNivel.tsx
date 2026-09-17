"use client";

import AnimacionCafe from "@/componentes/AnimacionCafe";
import AnimacionLavadora from "@/componentes/AnimacionLavadora";
import AnimacionManos from "@/componentes/AnimacionManos";
import AnimacionPaleta from "@/componentes/AnimacionPaleta";
import AnimacionSemilla from "@/componentes/AnimacionSemilla";
import type { EvaluacionSecuencia, TipoAnimacionNivel } from "@/tipos/juego";

interface PropiedadesAnimacionNivel {
  tipo: TipoAnimacionNivel;
  evaluacion: EvaluacionSecuencia;
  modoCelebracion?: boolean;
}

/** Elige la animación propia de cada nivel sin alterar `AnimacionCafe`. */
export default function AnimacionNivel({
  tipo,
  evaluacion,
  modoCelebracion = false,
}: PropiedadesAnimacionNivel) {
  switch (tipo) {
    case "semilla":
      return (
        <AnimacionSemilla
          evaluacion={evaluacion}
          modoCelebracion={modoCelebracion}
        />
      );
    case "paleta":
      return (
        <AnimacionPaleta
          evaluacion={evaluacion}
          modoCelebracion={modoCelebracion}
        />
      );
    case "lavadora":
      return (
        <AnimacionLavadora
          evaluacion={evaluacion}
          modoCelebracion={modoCelebracion}
        />
      );
    case "manos":
      return (
        <AnimacionManos
          evaluacion={evaluacion}
          modoCelebracion={modoCelebracion}
        />
      );
    case "cafe":
    default:
      return (
        <AnimacionCafe
          evaluacion={evaluacion}
          modoCelebracion={modoCelebracion}
        />
      );
  }
}
