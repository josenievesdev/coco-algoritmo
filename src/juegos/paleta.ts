import type { Nivel } from "@/tipos/juego";

export const nivelPaleta: Nivel = {
  identificador: "preparar-paleta",
  identificadorMundo: "primeros-algoritmos",
  numero: 3,
  titulo: "Preparar una paleta helada",
  descripcion:
    "Del jugo al congelador: el frío también necesita un orden exacto.",
  instruccion: "Ordena los pasos para que la paleta salga perfecta del molde.",
  pasos: [
    { identificador: "preparar-jugo", texto: "Preparar el jugo" },
    { identificador: "verter-molde", texto: "Verterlo en el molde" },
    { identificador: "colocar-palito", texto: "Colocar el palito" },
    {
      identificador: "llevar-congelador",
      texto: "Llevar el molde al congelador",
    },
    { identificador: "esperar-congelar", texto: "Esperar a que se congele" },
    { identificador: "sacar-paleta", texto: "Sacar la paleta del molde" },
  ],
  icono: "paleta",
  tema: { color: "#ff725e", sombra: "#b64b42" },
  tipoAnimacion: "paleta",
  mensajes: {
    pendiente: "El molde reaccionará con cada paso que logres conectar.",
    completa: "Secuencia completa. La paleta está lista.",
    error: "Ese orden todavía no congela la paleta.",
    celebracion: "Paleta lista.",
  },
};

export default nivelPaleta;
