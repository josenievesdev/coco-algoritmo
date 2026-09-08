"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AnimacionCafe from "@/componentes/AnimacionCafe";
import type { EvaluacionSecuencia, ResultadoJuego } from "@/tipos/juego";

interface PropiedadesNotificacionResultado {
  resultado: ResultadoJuego;
  evaluacion: EvaluacionSecuencia;
  numeroMovimiento: number;
  mostrarCelebracion: boolean;
}

export default function NotificacionResultado({
  resultado,
  evaluacion,
  numeroMovimiento,
  mostrarCelebracion,
}: PropiedadesNotificacionResultado) {
  const reducirMovimiento = useReducedMotion();
  const esProgreso = resultado === "progreso";
  const esEncaje = resultado === "encaje";
  const mostrarAviso = esProgreso || esEncaje || resultado === "error";
  const claseAviso = esProgreso
    ? "border-[#8be0bf]/55 bg-[#203d3a]/95"
    : esEncaje
      ? "border-[#f7c948]/55 bg-[#3d3423]/95"
      : "border-[#ff725e]/55 bg-[#43243c]/95";
  const claseIcono = esProgreso
    ? "bg-[#8be0bf]"
    : esEncaje
      ? "bg-[#f7c948]"
      : "bg-[#ff725e]";

  return (
    <>
      <AnimatePresence mode="wait">
        {mostrarAviso && (
          <div
            key={`${resultado}-${numeroMovimiento}`}
            className="pointer-events-none fixed inset-x-3 z-[70] flex justify-center sm:inset-x-6"
            style={{
              top: "max(5.25rem, calc(env(safe-area-inset-top) + 4.5rem))",
            }}
          >
            <motion.div
              initial={
                reducirMovimiento
                  ? { opacity: 0 }
                  : { opacity: 0, y: -18, scale: 0.94 }
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: reducirMovimiento ? 0 : [7, 0],
              }}
              exit={
                reducirMovimiento
                  ? { opacity: 0 }
                  : { opacity: 0, y: -10, scale: 0.97 }
              }
              transition={{
                duration: reducirMovimiento ? 0.12 : 0.28,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className={`flex w-full max-w-md items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.38)] backdrop-blur-xl ${claseAviso}`}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <motion.span
                initial={
                  reducirMovimiento
                    ? { opacity: 0 }
                    : { scale: 0.4, rotate: -18 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-black text-[#17122f] ${claseIcono}`}
              >
                {esProgreso ? "+" : esEncaje ? "·" : "~"}
              </motion.span>
              <div>
                <p className="text-[0.6rem] font-black tracking-[0.17em] text-[#f9efdb]/52">
                  {esProgreso
                    ? "LA CADENA AVANZA"
                    : esEncaje
                      ? "PIEZA EN SU LUGAR"
                      : "PRUEBA OTRO ENLACE"}
                </p>
                <p className="mt-1 text-sm font-black leading-tight text-[#f9efdb] sm:text-base">
                  {esProgreso
                    ? `${evaluacion.cantidadEnPosicionCorrecta} piezas ya encajan.`
                    : esEncaje
                      ? "Buen encaje. Ahora conecta los pasos anteriores."
                      : "Ese orden todavía no prepara el café."}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resultado === "exito" && mostrarCelebracion && (
          <motion.div
            key="celebracion-cafe"
            className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center p-4"
            role="status"
            aria-live="assertive"
            aria-atomic="true"
          >
            <motion.div
              className="absolute inset-0 bg-[#0d0921]/72 backdrop-blur-[5px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={
                reducirMovimiento
                  ? { opacity: 0 }
                  : { opacity: 0, y: 22, scale: 0.86, rotateX: 10 }
              }
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={
                reducirMovimiento
                  ? { opacity: 0 }
                  : { opacity: 0, y: -14, scale: 0.96 }
              }
              transition={{
                duration: reducirMovimiento ? 0.12 : 0.34,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="sombra-neon relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-[#8be0bf]/45 bg-[#211843] px-5 pb-6 pt-4 text-center [perspective:900px]"
            >
              <motion.div
                className="absolute -left-1/2 top-0 h-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/18 to-transparent"
                animate={reducirMovimiento ? undefined : { x: [0, 850] }}
                transition={{ duration: 0.8, delay: 0.35, ease: "easeInOut" }}
              />
              <AnimacionCafe evaluacion={evaluacion} modoCelebracion />
              <motion.div
                initial={
                  reducirMovimiento
                    ? { opacity: 0 }
                    : { scale: 0, rotate: -25 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={
                  reducirMovimiento
                    ? { duration: 0.1 }
                    : {
                        delay: 0.48,
                        type: "spring",
                        stiffness: 330,
                        damping: 18,
                      }
                }
                className="mx-auto -mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#8be0bf] text-xl font-black text-[#17122f] shadow-[0_5px_0_#438b77]"
                aria-hidden="true"
              >
                ✓
              </motion.div>
              <motion.p
                initial={
                  reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: 7 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reducirMovimiento ? 0 : 0.54,
                  duration: reducirMovimiento ? 0.1 : 0.28,
                }}
                className="mt-4 text-[0.62rem] font-black tracking-[0.2em] text-[#8be0bf]"
              >
                SECUENCIA DESBLOQUEADA
              </motion.p>
              <motion.h2
                initial={
                  reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: 7 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reducirMovimiento ? 0 : 0.6,
                  duration: reducirMovimiento ? 0.1 : 0.28,
                }}
                className="mt-1.5 text-3xl font-black tracking-[-0.06em] text-[#f9efdb]"
              >
                Café listo.
              </motion.h2>
              <p className="mt-2 text-sm font-bold text-[#f9efdb]/55">
                Todo encajó en el orden perfecto.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
