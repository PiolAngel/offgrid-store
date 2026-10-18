import Image from "next/image";

/*
  Imagen de portada (opcional).
  1. Guardá tu foto en public/hero/ (por ejemplo public/hero/portada.jpg).
  2. Cambiá null por la ruta: const HERO_IMAGE = "/hero/portada.jpg";
  Mientras sea null se muestra el bloque visual de reserva.
  Formato recomendado: vertical, proporción aproximada 4:5.
*/
const HERO_IMAGE: string | null = null;

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

function HeroPlaceholder() {
  return (
    <div aria-label="Identidad visual y colección de OFFGRID" className="absolute inset-0">
      <div className="absolute left-[10%] top-[12%] aspect-square w-[52%] overflow-hidden bg-warm">
        <Image
  src="/og-image.jpeg"
  alt="OFFGRID, identidad visual de la marca"
  fill
  loading="eager"
  sizes="(min-width: 1024px) 25vw, 45vw"
  className="object-contain"
/>
      </div>

      <div className="absolute bottom-[9%] right-[9%] aspect-square w-[42%] overflow-hidden border border-ink/20 bg-cream">
        <Image
          src="/collection-01.jpeg"
          alt="Colección 01 de OFFGRID"
          fill
          sizes="(min-width: 1024px) 22vw, 40vw"
          className="object-contain"
        />
      </div>

      <div className="pointer-events-none absolute inset-4 border border-ink/15" />
    </div>
  );
}

export default function Hero() {
  return (
    <section id="inicio" aria-labelledby="hero-titulo">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:py-16">
        {/* Texto */}
        <div className="flex flex-col justify-center lg:col-span-5">
          <p
            className="animate-fade-up text-[11px] font-medium uppercase tracking-[0.22em] text-muted"
            style={{ animationDelay: "60ms" }}
          >
            Streetwear · Básicos · Sneakers
          </p>

          <h1
            id="hero-titulo"
            className="mt-6 animate-fade-up font-serif text-5xl leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "140ms" }}
          >
            Lo esencial,
            <br />
            <span className="italic">llevado a la calle.</span>
          </h1>

          <p
            className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-muted sm:text-lg"
            style={{ animationDelay: "220ms" }}
          >
            Ropa urbana, básicos premium y sneakers de distintas marcas, seleccionados para el
            ritmo de todos los días.
          </p>

          <div
            className="mt-9 flex animate-fade-up flex-wrap items-center gap-x-8 gap-y-4"
            style={{ animationDelay: "300ms" }}
          >
            <a
              href="#catalogo"
              className="group inline-flex items-center gap-3 bg-ink px-8 py-4 text-[12px] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:bg-ink/85"
            >
              Explorar productos
              <ArrowIcon />
            </a>

            <a
              href="#destacados"
              className="relative text-[12px] font-medium uppercase tracking-[0.18em] text-ink after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-ink after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-50 focus-visible:after:scale-x-50"
            >
              Ver destacados
            </a>
          </div>

          <p
            className="mt-12 max-w-md animate-fade-up border-t border-ink/15 pt-4 text-xs text-muted"
            style={{ animationDelay: "380ms" }}
          >
            Catálogo de demostración: los productos y precios son ficticios.
          </p>
        </div>

        {/* Imagen o bloque de reserva */}
        <div
          className="relative aspect-[4/5] w-full animate-fade-in overflow-hidden bg-sand lg:col-span-7 lg:aspect-auto lg:min-h-[620px]"
          style={{ animationDelay: "120ms" }}
        >
          {HERO_IMAGE ? (
            <Image
              src={HERO_IMAGE}
              alt="Fotografía de portada de la colección OFFGRID"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          ) : (
            <HeroPlaceholder />
          )}
        </div>
      </div>
    </section>
  );
}