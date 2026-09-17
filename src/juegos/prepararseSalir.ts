import type { NivelDecision } from "@/tipos/juego";

export const nivelPrepararseSalir: NivelDecision = {
  tipo: "decision",
  identificador: "prepararse-salir",
  identificadorMundo: "decisiones",
  numero: 5,
  titulo: "Prepararse para salir",
  descripcion: "Observa, decide y sigue adelante pase lo que pase.",
  instruccion:
    "Lo que va en DESPUÉS ocurre en los dos casos. Cualquier ficha cabe en cualquier espacio.",
  situacion:
    "Vas a salir a la escuela. Desde tu cuarto no sabes si hace frío, pero hay un termómetro en la ventana.",
  objetivo: "Vístete según la temperatura y luego sal de casa.",
  espacios: [
    { identificador: "antes-1", zona: "antes", orden: 1, acepta: "cualquiera" },
    { identificador: "condicion", zona: "condicion", orden: 1, acepta: "cualquiera" },
    { identificador: "entonces-1", zona: "entonces", orden: 1, acepta: "cualquiera" },
    { identificador: "si-no-1", zona: "siNo", orden: 1, acepta: "cualquiera" },
    { identificador: "despues-1", zona: "despues", orden: 1, acepta: "cualquiera" },
  ],
  fichas: [
    { identificador: "mirar-termometro", texto: "Mirar el termómetro", tipo: "accion" },
    { identificador: "hace-frio", texto: "Hace frío", tipo: "condicion" },
    { identificador: "ponerse-chaqueta", texto: "Ponerse la chaqueta", tipo: "accion" },
    { identificador: "ponerse-ropa-ligera", texto: "Ponerse ropa ligera", tipo: "accion" },
    { identificador: "salir-casa", texto: "Salir de casa", tipo: "accion" },
    { identificador: "mirar-reloj", texto: "Mirar el reloj", tipo: "accion" },
    { identificador: "es-lunes", texto: "Es lunes", tipo: "condicion" },
    { identificador: "quitarse-zapatos", texto: "Quitarse los zapatos", tipo: "accion" },
  ],
  soluciones: [
    {
      antes: ["mirar-termometro"],
      condicion: "hace-frio",
      entonces: ["ponerse-chaqueta"],
      siNo: ["ponerse-ropa-ligera"],
      despues: ["salir-casa"],
    },
  ],
  escenarios: [
    { identificador: "dia-frio", texto: "Día frío", condicionCumplida: true },
    { identificador: "dia-calido", texto: "Día cálido", condicionCumplida: false },
  ],
  icono: "termometro",
  tema: { color: "#ff725e", sombra: "#b64b42" },
  tipoAnimacion: "salir",
  mensajes: {
    pendiente: "Llena todos los espacios para probar tu plan.",
    completa: "Plan completo. Sales con la ropa adecuada.",
    error: "Ese plan todavía no te prepara para salir.",
    celebracion: "¡Listo para salir!",
  },
};

export default nivelPrepararseSalir;
