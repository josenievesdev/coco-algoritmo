import type { NivelSecuencia } from "@/tipos/juego";

export const nivelLavadora: NivelSecuencia = {
  tipo: "secuencia",
  identificador: "lavar-ropa",
  identificadorMundo: "primeros-algoritmos",
  numero: 4,
  titulo: "Lavar ropa en la lavadora",
  descripcion:
    "Una máquina muy obediente: hará exactamente lo que le ordenes.",
  instruccion: "Ordena los pasos para que la lavadora empiece a lavar.",
  pasos: [
    { identificador: "separar-ropa", texto: "Separar la ropa" },
    { identificador: "meter-ropa", texto: "Ponerla en la lavadora" },
    { identificador: "agregar-detergente", texto: "Agregar detergente" },
    { identificador: "cerrar-puerta", texto: "Cerrar la puerta" },
    { identificador: "elegir-ciclo", texto: "Elegir el ciclo" },
    { identificador: "iniciar-lavado", texto: "Iniciar el lavado" },
  ],
  icono: "lavadora",
  tema: { color: "#7cc6ff", sombra: "#3f7fb3" },
  tipoAnimacion: "lavadora",
  mensajes: {
    pendiente: "La lavadora reaccionará con cada paso que logres conectar.",
    completa: "Secuencia completa. El lavado está en marcha.",
    error: "Ese orden todavía no pone a lavar la ropa.",
    celebracion: "Lavado en marcha.",
  },
};

export default nivelLavadora;
