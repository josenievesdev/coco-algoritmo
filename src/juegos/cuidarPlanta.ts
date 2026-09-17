import type { NivelDecision } from "@/tipos/juego";

export const nivelCuidarPlanta: NivelDecision = {
  tipo: "decision",
  identificador: "cuidar-planta",
  identificadorMundo: "decisiones",
  numero: 4,
  titulo: "Cuidar una planta",
  descripcion: "Sin ayudas: tú decides qué va en cada espacio.",
  instruccion: "Cualquier ficha cabe en cualquier espacio. Piensa cuál corresponde.",
  situacion:
    "Solo la tierra indica si la planta necesita agua. Si recibe agua de más, se enferma.",
  objetivo: "Riega la planta solo cuando lo necesite.",
  espacios: [
    { identificador: "antes-1", zona: "antes", orden: 1, acepta: "cualquiera" },
    { identificador: "condicion", zona: "condicion", orden: 1, acepta: "cualquiera" },
    { identificador: "entonces-1", zona: "entonces", orden: 1, acepta: "cualquiera" },
    { identificador: "si-no-1", zona: "siNo", orden: 1, acepta: "cualquiera" },
  ],
  fichas: [
    { identificador: "tocar-tierra", texto: "Tocar la tierra", tipo: "accion" },
    { identificador: "tierra-seca", texto: "La tierra está seca", tipo: "condicion" },
    { identificador: "regar-planta", texto: "Regar la planta", tipo: "accion" },
    { identificador: "no-regar", texto: "No regar todavía", tipo: "accion" },
    { identificador: "mirar-cielo", texto: "Mirar el cielo", tipo: "accion" },
    { identificador: "esta-nublado", texto: "Está nublado", tipo: "condicion" },
    { identificador: "cortar-hojas", texto: "Cortar las hojas", tipo: "accion" },
  ],
  soluciones: [
    {
      antes: ["tocar-tierra"],
      condicion: "tierra-seca",
      entonces: ["regar-planta"],
      siNo: ["no-regar"],
      despues: [],
    },
  ],
  escenarios: [
    { identificador: "tierra-seca", texto: "Tierra seca", condicionCumplida: true },
    { identificador: "tierra-humeda", texto: "Tierra húmeda", condicionCumplida: false },
  ],
  icono: "regadera",
  tema: { color: "#5cc48b", sombra: "#2f7d57" },
  tipoAnimacion: "planta",
  mensajes: {
    pendiente: "Llena todos los espacios para probar tu decisión.",
    completa: "Decisión completa. La planta recibe lo que necesita.",
    error: "Esa decisión todavía no cuida bien la planta.",
    celebracion: "Planta feliz.",
  },
};

export default nivelCuidarPlanta;
