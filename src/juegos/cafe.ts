import type { Juego } from "@/tipos/juego";

export const juegoCafe: Juego = {
  identificador: "preparar-cafe",
  nombre: "Preparar café",
  descripcion:
    "Una receta sencilla se convierte en tu primer reto de lógica.",
  instruccion: "Ordena los pasos para que la taza llegue lista a la mesa.",
  bloques: [
    "Calentar agua",
    "Agregar café",
    "Agregar azúcar",
    "Mezclar",
    "Servir",
  ],
  solucion: [
    "Calentar agua",
    "Agregar café",
    "Agregar azúcar",
    "Mezclar",
    "Servir",
  ],
  secuenciaInicial: [
    "Agregar azúcar",
    "Servir",
    "Calentar agua",
    "Mezclar",
    "Agregar café",
  ],
};

export default juegoCafe;
