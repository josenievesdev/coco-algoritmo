"use client";

import { motion } from "framer-motion";

interface PropiedadesPantallaInicio {
  alJugar: () => void;
}

export default function PantallaInicio({
  alJugar,
}: PropiedadesPantallaInicio) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-5 py-5 text-[#f9efdb] sm:px-8 lg:px-12">
      <div
        className="textura-puntos pointer-events-none absolute inset-0 -z-20 opacity-30"
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute -right-32 top-8 -z-10 h-80 w-80 rounded-full border-[28px] border-[#8be0bf]/15 sm:h-[30rem] sm:w-[30rem]"
        animate={{ rotate: 360, scale: [1, 1.04, 1] }}
        transition={{ rotate: { duration: 36, repeat: Infinity, ease: "linear" }, scale: { duration: 7, repeat: Infinity } }}
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-[#ff725e]/10 blur-3xl"
        animate={{ x: [0, 22, 0], y: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#f7c948] bg-[#f7c948] text-xl font-black text-[#21183f] shadow-[0_5px_0_#b99732]">
            C
          </div>
          <div className="leading-none">
            <p className="text-lg font-black tracking-[-0.06em]">COCO</p>
            <p className="mt-1 text-[0.6rem] font-bold tracking-[0.32em] text-[#8be0bf]">
              ALGORITMO
            </p>
          </div>
        </div>
        <div className="rounded-full border border-[#f9efdb]/20 px-3 py-2 text-[0.62rem] font-black tracking-[0.22em] text-[#f9efdb]/55 sm:px-4">
          PROTOTIPO 01
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-7xl items-center gap-14 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:py-8">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-6 flex items-center gap-3 text-xs font-black tracking-[0.2em] text-[#8be0bf]"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#8be0bf] shadow-[0_0_16px_#8be0bf]" />
            RETOS DE LÓGICA EN MODO JUEGO
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="max-w-xl text-[clamp(3.5rem,10vw,7.5rem)] font-black leading-[0.86] tracking-[-0.08em]"
          >
            Piensa.
            <br />
            <span className="text-[#f7c948]">Ordena.</span>
            <br />
            <span className="text-[#ff725e]">Desbloquea.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-lg text-base leading-7 text-[#f9efdb]/65 sm:text-lg"
          >
            Convierte situaciones cotidianas en puzzles de bloques. Encuentra
            el orden, siente el clic y deja que la secuencia haga su magia.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center"
          >
            <button
              type="button"
              onClick={alJugar}
              className="group inline-flex items-center gap-5 rounded-2xl border-2 border-[#f7c948] bg-[#f7c948] px-6 py-4 text-sm font-black tracking-[0.08em] text-[#21183f] shadow-[0_6px_0_#b99732] transition-all hover:-translate-y-1 hover:shadow-[0_10px_0_#b99732] active:translate-y-1 active:shadow-[0_3px_0_#b99732]"
            >
              JUGAR AHORA
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#21183f] text-lg text-[#f7c948] transition-transform group-hover:translate-x-1">
                &gt;
              </span>
            </button>
            <span className="text-xs font-bold tracking-wide text-[#f9efdb]/45">
              SIN LECCIONES. SOLO RETOS.
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[34rem]"
        >
          <div className="absolute -right-3 -top-5 z-10 rounded-xl border-2 border-[#21183f] bg-[#ff725e] px-3 py-2 text-[0.62rem] font-black tracking-[0.14em] text-[#21183f] shadow-[0_5px_0_#b64b42] sm:-right-7">
            RETO 01
          </div>
          <div className="sombra-neon relative overflow-hidden rounded-[2rem] border-2 border-[#f9efdb]/20 bg-[#241b48] p-4 sm:p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8be0bf] via-[#f7c948] to-[#ff725e]" />
            <div className="flex items-start justify-between border-b border-[#f9efdb]/10 pb-5">
              <div>
                <p className="text-[0.62rem] font-black tracking-[0.2em] text-[#8be0bf]">
                  MISIÓN COTIDIANA
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-[#f9efdb]">
                  Preparar café
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7c948] text-2xl font-black text-[#21183f] shadow-[0_5px_0_#b99732]">
                C
              </div>
            </div>
            <div className="py-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#f9efdb]/45">
                Ordena las piezas
              </p>
              <div className="space-y-3">
                {[
                  ["01", "Calentar agua", "#8be0bf"],
                  ["02", "Agregar café", "#f7c948"],
                  ["03", "Mezclar", "#ff725e"],
                ].map(([numero, texto, color]) => (
                  <div
                    key={numero}
                    className="flex items-center gap-3 rounded-xl border border-[#f9efdb]/10 bg-[#17122f]/45 px-3 py-3"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-[#21183f]"
                      style={{ backgroundColor: color }}
                    >
                      {numero}
                    </span>
                    <span className="text-sm font-bold text-[#f9efdb]/85">
                      {texto}
                    </span>
                    <span className="ml-auto flex gap-1 opacity-35">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f9efdb]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f9efdb]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f9efdb]" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#f9efdb]/10 pt-5">
              <span className="text-[0.62rem] font-black tracking-[0.15em] text-[#f9efdb]/40">
                ARRASTRA LOS BLOQUES
              </span>
              <span className="rounded-full bg-[#8be0bf]/15 px-3 py-1.5 text-[0.62rem] font-black tracking-[0.12em] text-[#8be0bf]">
                LISTO PARA JUGAR
              </span>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-[#f9efdb]/15 bg-[#34265f] px-4 py-3 text-xs font-bold text-[#f9efdb]/70 shadow-xl sm:block">
            Cada orden cuenta.
          </div>
        </motion.div>
      </section>
    </main>
  );
}
