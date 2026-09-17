import type { NivelSecuencia } from "@/tipos/juego";

export const nivelCafe: NivelSecuencia = {
  tipo: "secuencia",
  identificador: "preparar-cafe",
  identificadorMundo: "primeros-algoritmos",
  numero: 1,
  titulo: "Preparar café",
  descripcion:
    "Una receta sencilla se convierte en tu primer reto de lógica.",
  instruccion: "Ordena los pasos para que la taza llegue lista a la mesa.",
  pasos: [
    { identificador: "calentar-agua", texto: "Calentar agua" },
    { identificador: "agregar-cafe", texto: "Agregar café" },
    { identificador: "agregar-azucar", texto: "Agregar azúcar" },
    { identificador: "mezclar", texto: "Mezclar" },
    { identificador: "servir", texto: "Servir" },
  ],
  icono: "taza",
  tema: { color: "#f7c948", sombra: "#b99732" },
  tipoAnimacion: "cafe",
  mensajes: {
    pendiente: "El café reaccionará con cada paso que logres conectar.",
    completa: "Secuencia completa. El café está listo.",
    error: "Ese orden todavía no prepara el café.",
    celebracion: "Café listo.",
  },
};

export default nivelCafe;
