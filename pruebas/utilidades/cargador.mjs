// Cargador para las pruebas: traduce el alias "@/..." de TypeScript a
// archivos reales dentro de src/ y completa la extensión de las
// importaciones relativas sin ella. Solo usa módulos nativos de Node.
import { existsSync } from "node:fs";
import { extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const carpetaFuente = fileURLToPath(new URL("../../src/", import.meta.url));
const extensiones = [".ts", ".tsx", "/index.ts"];

function buscarArchivo(rutaBase) {
  for (const extension of extensiones) {
    const ruta = rutaBase + extension;

    if (existsSync(ruta)) {
      return pathToFileURL(ruta).href;
    }
  }

  return null;
}

export async function resolve(especificador, contexto, siguiente) {
  if (especificador.startsWith("@/")) {
    const archivo = buscarArchivo(carpetaFuente + especificador.slice(2));

    if (archivo) {
      return siguiente(archivo, contexto);
    }
  }

  const esRelativo =
    especificador.startsWith("./") || especificador.startsWith("../");

  if (esRelativo && !extname(especificador) && contexto.parentURL) {
    const archivo = buscarArchivo(
      fileURLToPath(new URL(especificador, contexto.parentURL)),
    );

    if (archivo) {
      return siguiente(archivo, contexto);
    }
  }

  return siguiente(especificador, contexto);
}
