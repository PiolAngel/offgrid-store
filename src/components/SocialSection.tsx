/**
 * Redes de la demo: enlazar solo perfiles confirmados por Dirección General.
 * Las variables NEXT_PUBLIC_ son públicas y requieren build para actualizarse.
 */
const NETWORKS = [
  { name: "Instagram", variable: process.env.NEXT_PUBLIC_OFFGRID_INSTAGRAM_URL, host: "instagram.com", handle: "01" },
  { name: "TikTok", variable: process.env.NEXT_PUBLIC_OFFGRID_TIKTOK_URL, host: "tiktok.com", handle: "02" },
] as const;

function validProfile(value: string | undefined, host: string): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    if (parsed.protocol !== "https:" || (hostname !== host && hostname !== "www." + host)) return null;
    if (parsed.pathname === "/" || parsed.pathname === "") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export default function SocialSection() {
  return (
    <section id="redes" aria-labelledby="redes-titulo" className="border-t border-ink/10 bg-[#22221f] py-16 text-cream sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.23em] text-[#c7b9a6]">Comunidad OFFGRID</p>
          <h2 id="redes-titulo" className="mt-4 max-w-lg font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
            El estilo sigue <span className="italic">fuera de la pantalla.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#d3cabe]">
            Inspiración, colecciones y cultura urbana. Este espacio de redes forma parte de la tienda demostrativa.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {NETWORKS.map(({name,variable,host,handle}) => {
            const url = validProfile(variable,host);
            const tile = (
              <>
                <span className="text-[10px] tracking-[0.2em] text-[#c7b9a6]">{handle} / SOCIAL</span>
                <span className="mt-8 flex items-center justify-between gap-3 font-serif text-2xl">
                  {name}<span aria-hidden="true" className="text-lg">{url ? "↗" : "—"}</span>
                </span>
                <span className="mt-2 block text-xs text-[#d3cabe]">{url ? "Visitar perfil oficial" : "Perfil próximamente"}</span>
              </>
            );
            const className = "offgrid-social-tile flex min-h-44 flex-col justify-between border border-[#777063] px-5 py-5 transition-colors duration-200";
            return url ? (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir perfil de ${name} de OFFGRID`} className={className + " hover:border-[#e7d5b9] hover:bg-[#38362f] focus-visible:border-[#e7d5b9]"}>
                {tile}
              </a>
            ) : (
              <div key={name} className={className} aria-label={`${name}: perfil aún no configurado`}>{tile}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
