import Image from "next/image";

/*
  Imagen del banner. Por ahora reutiliza /collection-01.jpeg, que ya está en tu carpeta public.
  Para usar otra, guardala en public/ y cambiá esta ruta.
*/
const COLLECTION_IMAGE = "/collection-01.jpeg";

export default function EditorialBanner() {
  return (
    <section
      id="coleccion"
      aria-labelledby="coleccion-titulo"
      className="border-t border-ink/10 bg-sand py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="relative aspect-square w-full overflow-hidden border border-ink/15 bg-cream lg:col-span-6">
          <Image
            src={COLLECTION_IMAGE}
            alt="Colección 01 de OFFGRID"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-contain"
          />
        </div>

        <div className="lg:col-span-6 lg:pl-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            Colección 01
          </p>

          <h2
            id="coleccion-titulo"
            className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl"
          >
            Piezas para <span className="italic">combinar sin esfuerzo.</span>
          </h2>

          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            Sneakers, remeras, pantalones y hoodies en una paleta neutra, pensados para mezclarse
            entre sí y acompañar el día a día.
          </p>

          <a
            href="#catalogo"
            className="mt-9 inline-flex items-center bg-ink px-8 py-4 text-[12px] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:bg-ink/85"
          >
            Ver el catálogo
          </a>
        </div>
      </div>
    </section>
  );
}