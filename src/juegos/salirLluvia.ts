import type { NivelDecision } from "@/tipos/juego";

export const nivelSalirLluvia: NivelDecision = {
  tipo: "decision",
  identificador: "salir-lluvia",
  identificadorMundo: "decisiones",
  numero: 1,
  titulo: "Salir cuando llueve",
  descripcion: "Tu primera regla: una condición que provoca una acción.",
  instruccion: "Coloca una condición y una acción para completar la regla.",
  situacion: "Vas a salir de casa. Algunos días llueve y otros no.",
  objetivo: "Crea una regla para no mojarte al salir.",
  espacios: [
    { identificador: "condicion", zona: "condicion", orden: 1, acepta: "condicion" },
    { identificador: "entonces-1", zona: "entonces", orden: 1, acepta: "accion" },
  ],
  fichas: [
    { identificador: "esta-lloviendo", texto: "Está lloviendo", tipo: "condicion" },
    { identificador: "llevar-paraguas", texto: "Llevar paraguas", tipo: "accion" },
    { identificador: "tengo-hambre", texto: "Tengo hambre", tipo: "condicion" },
    { identificador: "llevar-gafas-sol", texto: "Llevar gafas de sol", tipo: "accion" },
    { identificador: "abrir-ventana", texto: "Abrir la ventana", tipo: "accion" },
  ],
  soluciones: [
    {
      antes: [],
      condicion: "esta-lloviendo",
      entonces: ["llevar-paraguas"],
      siNo: null,
      despues: [],
    },
  ],
  escenarios: [
    { identificador: "dia-lluvioso", texto: "Día de lluvia", condicionCumplida: true },
    { identificador: "dia-seco", texto: "Día seco", condicionCumplida: false },
  ],
  icono: "paraguas",
  tema: { color: "#7cc6ff", sombra: "#3f7fb3" },
  tipoAnimacion: "lluvia",
  mensajes: {
    pendiente: "Llena todos los espacios para probar tu regla.",
    completa: "Regla completa. Nadie se moja.",
    error: "Esa regla todavía no te protege de la lluvia.",
    celebracion: "Regla lista.",
  },
};

export default nivelSalirLluvia;
