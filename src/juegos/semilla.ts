import type { Nivel } from "@/tipos/juego";

export const nivelSemilla: Nivel = {
  identificador: "sembrar-semilla",
  identificadorMundo: "primeros-algoritmos",
  numero: 2,
  titulo: "Sembrar una semilla",
  descripcion:
    "La tierra, la semilla y el agua tienen cada una su turno.",
  instruccion: "Ordena los pasos para que la semilla pueda germinar.",
  pasos: [
    { identificador: "llenar-tierra", texto: "Llenar la maceta con tierra" },
    { identificador: "hacer-hueco", texto: "Hacer un pequeño hueco" },
    { identificador: "poner-semilla", texto: "Poner la semilla" },
    { identificador: "cubrir-semilla", texto: "Cubrirla con tierra" },
    { identificador: "regar-semilla", texto: "Regarla" },
  ],
  icono: "brote",
  tema: { color: "#8be0bf", sombra: "#4d9a82" },
  tipoAnimacion: "semilla",
  mensajes: {
    pendiente: "La maceta reaccionará con cada paso que logres conectar.",
    completa: "Secuencia completa. La semilla ya germina.",
    error: "Ese orden todavía no hace crecer la semilla.",
    celebracion: "Brote a la vista.",
  },
};

export default nivelSemilla;
