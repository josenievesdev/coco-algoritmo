"use client";

import { useState } from "react";
import PantallaInicio from "@/componentes/PantallaInicio";
import TableroJuego from "@/componentes/TableroJuego";
import { useEstadoJuego } from "@/juegos/estadoJuego";

type VistaJuego = "inicio" | "tablero";

export default function ExperienciaJuego() {
  const [vista, setVista] = useState<VistaJuego>("inicio");
  const iniciarJuego = useEstadoJuego((estado) => estado.iniciarJuego);

  function comenzarPartida(): void {
    iniciarJuego();
    setVista("tablero");
  }

  if (vista === "inicio") {
    return <PantallaInicio alJugar={comenzarPartida} />;
  }

  return <TableroJuego alSalir={() => setVista("inicio")} />;
}
