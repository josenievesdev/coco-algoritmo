"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import IconoNivel from "@/componentes/IconoNivel";
import { obtenerNivelesDeMundo } from "@/datos/juegosDisponibles";
import type { Mundo } from "@/tipos/juego";

const clasePrincipal =
  "rounded-xl border-2 border-[#f7c948] bg-[#f7c948] px-4 text-sm font-black tracking-[0.08em] text-[#21183f] shadow-[0_5px_0_#b99732] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_#b99732]";
const claseSecundaria =
  "rounded-xl border border-[#f9efdb]/20 bg-[#2b2151] px-4 text-sm font-black tracking-[0.08em] text-[#f9efdb]/80 shadow-[0_5px_0_#0e0a20] transition-all hover:-translate-y-0.5 hover:text-[#f7c948] active:translate-y-0.5 active:shadow-[0_2px_0_#0e0a20]";

interface PropiedadesCelebracionMundo {
  mundo: Mundo;
  completados: number;
  alVerNiveles: () => void;
  alVerMundos: () => void;
  /** Mundo siguiente, solo si ya está abierto. */
  mundoSiguiente?: Mundo;
  alIrMundoSiguiente?: () => void;
}

export default function CelebracionMundo({
  mundo,
  completados,
  alVerNiveles,
  alVerMundos,
  mundoSiguiente,
  alIrMundoSiguiente,
}: PropiedadesCelebracionMundo) {
  const reducirMovimiento = useReducedMotion();
  const referenciaBoton = useRef<HTMLButtonElement>(null);
  const niveles = obtenerNivelesDeMundo(mundo.identificador);

  useEffect(() => {
    referenciaBoton.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-mundo-completado"
      onKeyDown={(evento) => {
        if (evento.key === "Escape") {
          alVerNiveles();
        }
      }}
    >
      <motion.div
        className="absolute inset-0 bg-[#0d0921]/80 backdrop-blur-[6px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        aria-hidden="true"
      />
      <motion.div
        initial={
          reducirMovimiento
            ? { opacity: 0 }
            : { opacity: 0, y: 26, scale: 0.86, rotateX: 12 }
        }
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={{
          duration: reducirMovimiento ? 0.12 : 0.42,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="sombra-neon relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-[2rem] border border-[#f7c948]/55 bg-[#211843] px-5 pb-6 pt-7 text-center [perspective:900px] sm:px-7"
      >
        <div
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#8be0bf] via-[#f7c948] to-[#ff725e]"
          aria-hidden="true"
        />
        {!reducirMovimiento &&
          [0, 1, 2, 3, 4, 5].map((indice) => (
            <motion.span
              key={indice}
              className="absolute h-2.5 w-2.5 rounded-sm"
              style={{
                left: `${12 + indice * 15}%`,
                top: "12%",
                backgroundColor: ["#f7c948", "#8be0bf", "#ff725e"][indice % 3],
              }}
              initial={{ opacity: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -26, 40],
                rotate: [0, 120, 260],
              }}
              transition={{
                duration: 1.6,
                delay: 0.25 + indice * 0.07,
                ease: "easeOut",
              }}
              aria-hidden="true"
            />
          ))}

        <motion.div
          initial={reducirMovimiento ? false : { scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-[#f7c948] bg-[#f7c948] text-[#21183f] shadow-[0_7px_0_#b99732]"
          aria-hidden="true"
        >
          <IconoNivel tipo={mundo.icono} className="h-11 w-11" />
        </motion.div>

        <p className="mt-6 text-xs font-black tracking-[0.2em] text-[#8be0bf]">
          MUNDO {String(mundo.numero).padStart(2, "0")} COMPLETADO
        </p>
        <h2
          id="titulo-mundo-completado"
          className="mt-2 text-4xl font-black leading-none tracking-[-0.07em] text-[#f9efdb]"
        >
          ¡{mundo.titulo} dominado!
        </h2>
        <p className="mt-3 text-base font-bold text-[#f9efdb]/65">
          {mundo.mensajes.completado}
        </p>

        <div className="mt-6 rounded-2xl border border-[#f9efdb]/10 bg-[#17122f]/55 p-4">
          <p className="text-3xl font-black tabular-nums text-[#8be0bf]">
            {completados} de {niveles.length}
          </p>
          <p className="mt-1 text-xs font-black tracking-[0.14em] text-[#f9efdb]/50">
            NIVELES SUPERADOS
          </p>
          <ul className="mt-4 flex justify-center gap-2" aria-hidden="true">
            {niveles.map((nivel, indice) => (
              <motion.li
                key={nivel.identificador}
                initial={reducirMovimiento ? false : { scale: 0, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.45 + indice * 0.08, type: "spring", stiffness: 320, damping: 18 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2"
                style={{
                  borderColor: nivel.tema.color,
                  backgroundColor: `${nivel.tema.color}26`,
                  color: nivel.tema.color,
                }}
              >
                <IconoNivel tipo={nivel.icono} className="h-6 w-6" />
              </motion.li>
            ))}
          </ul>
        </div>

        {mundo.mensajes.siguiente && (
          <p
            className={`mt-5 text-sm font-bold ${
              mundoSiguiente ? "text-[#8be0bf]" : "text-[#f9efdb]/55"
            }`}
          >
            {mundo.mensajes.siguiente}
          </p>
        )}

        {mundoSiguiente && alIrMundoSiguiente && (
          <button
            ref={referenciaBoton}
            type="button"
            onClick={alIrMundoSiguiente}
            className={`mt-5 flex min-h-12 w-full items-center justify-center gap-3 ${clasePrincipal}`}
          >
            IR A {mundoSiguiente.titulo.toUpperCase()}
            <span aria-hidden="true">&gt;</span>
          </button>
        )}

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <button
            ref={mundoSiguiente ? undefined : referenciaBoton}
            type="button"
            onClick={alVerNiveles}
            className={`flex min-h-12 flex-1 items-center justify-center ${
              mundoSiguiente ? claseSecundaria : clasePrincipal
            }`}
          >
            VER NIVELES
          </button>
          <button
            type="button"
            onClick={alVerMundos}
            className={`flex min-h-12 flex-1 items-center justify-center ${claseSecundaria}`}
          >
            IR A MUNDOS
          </button>
        </div>
      </motion.div>
    </div>
  );
}
