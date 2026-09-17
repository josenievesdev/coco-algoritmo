interface PropiedadesEncabezadoMarca {
  children?: React.ReactNode;
  lateral?: React.ReactNode;
}

/** Barra superior compartida por las pantallas de mundos y niveles. */
export default function EncabezadoMarca({
  children,
  lateral,
}: PropiedadesEncabezadoMarca) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {children}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7c948] font-black text-[#21183f] shadow-[0_4px_0_#b99732]">
          C
        </div>
        <div className="hidden leading-none min-[380px]:block">
          <p className="text-base font-black tracking-[-0.06em]">COCO</p>
          <p className="mt-1 text-[0.6rem] font-bold tracking-[0.27em] text-[#8be0bf]">
            ALGORITMO
          </p>
        </div>
      </div>
      {lateral}
    </header>
  );
}
