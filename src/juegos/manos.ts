import type { Nivel } from "@/tipos/juego";

export const nivelManos: Nivel = {
  identificador: "lavar-manos",
  identificadorMundo: "primeros-algoritmos",
  numero: 5,
  titulo: "Lavarse las manos",
  descripcion: "Un hábito de todos los días que también es un algoritmo.",
  instruccion: "Ordena los pasos para dejar las manos limpias y secas.",
  pasos: [
    { identificador: "abrir-grifo", texto: "Abrir el grifo" },
    { identificador: "mojar-manos", texto: "Mojarse las manos" },
    { identificador: "aplicar-jabon", texto: "Aplicar jabón" },
    { identificador: "frotar-manos", texto: "Frotar las manos" },
    { identificador: "enjuagar-manos", texto: "Enjuagarlas" },
    { identificador: "secar-manos", texto: "Secarlas" },
  ],
  icono: "manos",
  tema: { color: "#c9a7ff", sombra: "#7d62b3" },
  tipoAnimacion: "manos",
  mensajes: {
    pendiente: "Las manos reaccionarán con cada paso que logres conectar.",
    completa: "Secuencia completa. Manos limpias y secas.",
    error: "Ese orden todavía no deja las manos limpias.",
    celebracion: "Manos relucientes.",
  },
};

export default nivelManos;
