"use client";

import { Howl } from "howler";

export type NombreSonido = "mover" | "encaje" | "error" | "exito";

interface NotaSonido {
  frecuencia: number;
  inicio: number;
  duracion: number;
  intensidad: number;
}

interface DefinicionSonido {
  duracion: number;
  volumen: number;
  notas: NotaSonido[];
}

const definicionesSonido: Record<NombreSonido, DefinicionSonido> = {
  mover: {
    duracion: 0.085,
    volumen: 0.18,
    notas: [
      { frecuencia: 150, inicio: 0, duracion: 0.075, intensidad: 0.8 },
      { frecuencia: 310, inicio: 0.008, duracion: 0.045, intensidad: 0.28 },
    ],
  },
  encaje: {
    duracion: 0.2,
    volumen: 0.24,
    notas: [
      { frecuencia: 523.25, inicio: 0, duracion: 0.13, intensidad: 0.7 },
      { frecuencia: 659.25, inicio: 0.07, duracion: 0.13, intensidad: 0.72 },
    ],
  },
  error: {
    duracion: 0.22,
    volumen: 0.18,
    notas: [
      { frecuencia: 220, inicio: 0, duracion: 0.14, intensidad: 0.62 },
      { frecuencia: 174.61, inicio: 0.08, duracion: 0.14, intensidad: 0.55 },
    ],
  },
  exito: {
    duracion: 0.72,
    volumen: 0.3,
    notas: [
      { frecuencia: 523.25, inicio: 0, duracion: 0.3, intensidad: 0.55 },
      { frecuencia: 659.25, inicio: 0.11, duracion: 0.34, intensidad: 0.6 },
      { frecuencia: 783.99, inicio: 0.23, duracion: 0.4, intensidad: 0.62 },
      { frecuencia: 1046.5, inicio: 0.38, duracion: 0.32, intensidad: 0.46 },
    ],
  },
};

const sonidosCargados = new Map<NombreSonido, Howl>();
let sonidosActivos = true;

function escribirTexto(
  vista: DataView,
  desplazamiento: number,
  texto: string,
): void {
  for (let indice = 0; indice < texto.length; indice += 1) {
    vista.setUint8(desplazamiento + indice, texto.charCodeAt(indice));
  }
}

function crearFuenteSonido(definicion: DefinicionSonido): string {
  const frecuenciaMuestreo = 22050;
  const cantidadMuestras = Math.ceil(
    definicion.duracion * frecuenciaMuestreo,
  );
  const datos = new Uint8Array(44 + cantidadMuestras);
  const vista = new DataView(datos.buffer);

  escribirTexto(vista, 0, "RIFF");
  vista.setUint32(4, 36 + cantidadMuestras, true);
  escribirTexto(vista, 8, "WAVE");
  escribirTexto(vista, 12, "fmt ");
  vista.setUint32(16, 16, true);
  vista.setUint16(20, 1, true);
  vista.setUint16(22, 1, true);
  vista.setUint32(24, frecuenciaMuestreo, true);
  vista.setUint32(28, frecuenciaMuestreo, true);
  vista.setUint16(32, 1, true);
  vista.setUint16(34, 8, true);
  escribirTexto(vista, 36, "data");
  vista.setUint32(40, cantidadMuestras, true);

  for (let indice = 0; indice < cantidadMuestras; indice += 1) {
    const tiempo = indice / frecuenciaMuestreo;
    let muestra = 0;

    for (const nota of definicion.notas) {
      const tiempoNota = tiempo - nota.inicio;

      if (tiempoNota < 0 || tiempoNota > nota.duracion) {
        continue;
      }

      const avanceNota = tiempoNota / nota.duracion;
      const entrada = Math.min(1, avanceNota / 0.08);
      const salida = Math.pow(1 - avanceNota, 2.2);
      const fase = Math.PI * 2 * nota.frecuencia * tiempoNota;
      const timbre = Math.sin(fase) + Math.sin(fase * 2.01) * 0.18;
      muestra += timbre * entrada * salida * nota.intensidad;
    }

    datos[44 + indice] = Math.max(
      0,
      Math.min(255, Math.round(128 + muestra * 72)),
    );
  }

  let contenidoBinario = "";

  for (let indice = 0; indice < datos.length; indice += 1) {
    contenidoBinario += String.fromCharCode(datos[indice]);
  }

  return `data:audio/wav;base64,${window.btoa(contenidoBinario)}`;
}

function obtenerSonido(nombre: NombreSonido): Howl | null {
  if (typeof window === "undefined") {
    return null;
  }

  const sonidoExistente = sonidosCargados.get(nombre);

  if (sonidoExistente) {
    return sonidoExistente;
  }

  const definicion = definicionesSonido[nombre];
  const sonido = new Howl({
    src: [crearFuenteSonido(definicion)],
    format: ["wav"],
    volume: definicion.volumen,
    preload: true,
  });

  sonidosCargados.set(nombre, sonido);
  return sonido;
}

export function prepararSonidos(): void {
  if (!sonidosActivos) {
    return;
  }

  (Object.keys(definicionesSonido) as NombreSonido[]).forEach(obtenerSonido);
}

export function configurarSonidosActivos(activos: boolean): void {
  sonidosActivos = activos;

  if (!activos) {
    sonidosCargados.forEach((sonido) => sonido.stop());
  } else {
    prepararSonidos();
  }
}

export function obtenerEstadoSonidos(): boolean {
  return sonidosActivos;
}

export function reproducirSonido(nombre: NombreSonido): void {
  if (!sonidosActivos) {
    return;
  }

  obtenerSonido(nombre)?.play();
}
