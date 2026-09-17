import type { NivelDecision } from "@/tipos/juego";

export const nivelCargarCelular: NivelDecision = {
  tipo: "decision",
  identificador: "cargar-celular",
  identificadorMundo: "decisiones",
  numero: 3,
  titulo: "Cargar el celular",
  descripcion: "Para decidir bien, primero hay que observar.",
  instruccion: "Elige qué hacer antes de decidir y completa las dos ramas.",
  situacion: "Estás usando el celular y no sabes cuánta batería le queda.",
  objetivo: "Evita que el celular se apague por falta de batería.",
  espacios: [
    { identificador: "antes-1", zona: "antes", orden: 1, acepta: "accion" },
    { identificador: "condicion", zona: "condicion", orden: 1, acepta: "condicion" },
    { identificador: "entonces-1", zona: "entonces", orden: 1, acepta: "accion" },
    { identificador: "si-no-1", zona: "siNo", orden: 1, acepta: "accion" },
  ],
  fichas: [
    { identificador: "revisar-bateria", texto: "Revisar la batería", tipo: "accion" },
    { identificador: "bateria-baja", texto: "La batería está baja", tipo: "condicion" },
    { identificador: "conectar-cargador", texto: "Conectar el cargador", tipo: "accion" },
    {
      identificador: "seguir-usando",
      texto: "Seguir usando el celular",
      tipo: "accion",
    },
    { identificador: "llego-mensaje", texto: "Llegó un mensaje", tipo: "condicion" },
    {
      identificador: "desconectar-cargador",
      texto: "Desconectar el cargador",
      tipo: "accion",
    },
  ],
  soluciones: [
    {
      antes: ["revisar-bateria"],
      condicion: "bateria-baja",
      entonces: ["conectar-cargador"],
      siNo: ["seguir-usando"],
      despues: [],
    },
  ],
  escenarios: [
    { identificador: "bateria-poca", texto: "Batería baja", condicionCumplida: true },
    { identificador: "bateria-mucha", texto: "Batería alta", condicionCumplida: false },
  ],
  icono: "bateria",
  tema: { color: "#f7c948", sombra: "#b99732" },
  tipoAnimacion: "celular",
  mensajes: {
    pendiente: "Llena todos los espacios para probar tu decisión.",
    completa: "Decisión completa. El celular no se apagará.",
    error: "Esa decisión todavía no cuida la batería.",
    celebracion: "Batería a salvo.",
  },
};

export default nivelCargarCelular;
