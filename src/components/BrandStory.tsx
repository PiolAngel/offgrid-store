const PILLARS = [
  {
    title: "Multimarca",
    text: "Distintas marcas de streetwear y sneakers reunidas en una sola tienda.",
  },
  {
    title: "Básicos y piezas clave",
    text: "Remeras, pantalones, hoodies y sneakers elegidos para combinar entre sí.",
  },
  {
    title: "Hecha para Paraguay",
    text: "Una tienda pensada para el mercado paraguayo, con precios en guaraníes.",
  },
] as const;

export default function BrandStory() {
  return (
    <section
      id="nosotros"
      aria-labelledby="nosotros-titulo"
      className="border-t border-ink/10 py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            Nosotros
          </p>

          <h2
            id="nosotros-titulo"
            className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl"
          >
            Lo esencial, <span className="italic">bien elegido.</span>
          </h2>

          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            OFFGRID es una tienda multimarca de ropa urbana, básicos premium y sneakers. Reunimos
            en un solo lugar piezas pensadas para la calle y para todos los días.
          </p>
        </div>

        <ul className="lg:col-span-7">
          {PILLARS.map((pillar, index) => (
            <li
              key={pillar.title}
              className="grid grid-cols-[3rem_1fr] gap-4 border-t border-ink/15 py-7 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-7"
            >
              <span aria-hidden="true" className="font-serif text-2xl italic text-warm">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-serif text-2xl text-ink">{pillar.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{pillar.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}