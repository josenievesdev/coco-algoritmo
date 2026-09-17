"use client";

import AnimacionCafe from "@/componentes/AnimacionCafe";
import AnimacionCelular from "@/componentes/AnimacionCelular";
import AnimacionLavadora from "@/componentes/AnimacionLavadora";
import AnimacionLluvia from "@/componentes/AnimacionLluvia";
import AnimacionManos from "@/componentes/AnimacionManos";
import AnimacionPaleta from "@/componentes/AnimacionPaleta";
import AnimacionPlanta from "@/componentes/AnimacionPlanta";
import AnimacionSalir from "@/componentes/AnimacionSalir";
import AnimacionSemaforo from "@/componentes/AnimacionSemaforo";
import AnimacionSemilla from "@/componentes/AnimacionSemilla";
import type { ReactNode } from "react";
import type { EvaluacionSecuencia, TipoAnimacionNivel } from "@/tipos/juego";

interface PropiedadesAnimacionNivel {
  tipo: TipoAnimacionNivel;
  evaluacion: EvaluacionSecuencia;
  modoCelebracion?: boolean;
  /** Solo para niveles de decisión: indicador neutral de espacios llenos. */
  indicador?: ReactNode;
}

/** Elige la animación propia de cada nivel sin alterar `AnimacionCafe`. */
export default function AnimacionNivel({
  tipo,
  evaluacion,
  modoCelebracion = false,
  indicador,
}: PropiedadesAnimacionNivel) {
  const propiedadesDecision = { evaluacion, modoCelebracion, indicador };

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
    case "lluvia":
      return <AnimacionLluvia {...propiedadesDecision} />;
    case "semaforo":
      return <AnimacionSemaforo {...propiedadesDecision} />;
    case "celular":
      return <AnimacionCelular {...propiedadesDecision} />;
    case "planta":
      return <AnimacionPlanta {...propiedadesDecision} />;
    case "salir":
      return <AnimacionSalir {...propiedadesDecision} />;
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
