import type { NivelDecision } from "@/tipos/juego";

export const nivelCruzarCalle: NivelDecision = {
  tipo: "decision",
  identificador: "cruzar-calle",
  identificadorMundo: "decisiones",
  numero: 2,
  titulo: "Cruzar la calle",
  descripcion: "Dos caminos: qué hacer si ocurre y qué hacer si no.",
  instruccion: "Completa la condición y las dos ramas de la decisión.",
  situacion: "Llegas a un paso peatonal con semáforo.",
  objetivo: "Cruza solo cuando sea seguro.",
  espacios: [
    { identificador: "condicion", zona: "condicion", orden: 1, acepta: "condicion" },
    { identificador: "entonces-1", zona: "entonces", orden: 1, acepta: "accion" },
    { identificador: "si-no-1", zona: "siNo", orden: 1, acepta: "accion" },
  ],
  fichas: [
    {
      identificador: "semaforo-verde",
      texto: "El semáforo peatonal está en verde",
      tipo: "condicion",
    },
    { identificador: "cruzar", texto: "Cruzar", tipo: "accion" },
    { identificador: "esperar", texto: "Esperar", tipo: "accion" },
    { identificador: "tengo-prisa", texto: "Tengo prisa", tipo: "condicion" },
    { identificador: "correr-sin-mirar", texto: "Correr sin mirar", tipo: "accion" },
  ],
  soluciones: [
    {
      antes: [],
      condicion: "semaforo-verde",
      entonces: ["cruzar"],
      siNo: ["esperar"],
      despues: [],
    },
  ],
  escenarios: [
    { identificador: "luz-verde", texto: "Luz verde", condicionCumplida: true },
    { identificador: "luz-roja", texto: "Luz roja", condicionCumplida: false },
  ],
  icono: "semaforo",
  tema: { color: "#8be0bf", sombra: "#4d9a82" },
  tipoAnimacion: "semaforo",
  mensajes: {
    pendiente: "Llena todos los espacios para probar tu decisión.",
    completa: "Decisión completa. Cruzas con seguridad.",
    error: "Esa decisión todavía no es segura.",
    celebracion: "Cruce seguro.",
  },
};

export default nivelCruzarCalle;
