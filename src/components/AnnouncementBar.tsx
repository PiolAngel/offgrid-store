/*
  Barra de anuncio superior.
  Editá los textos de estas constantes cuando definas las condiciones reales
  de envío. Por ahora no se promete costo ni plazo de entrega.
*/
const ANNOUNCEMENT = "Envíos en Paraguay · Costos y plazos a confirmar";
const SECONDARY_NOTE = "Catálogo de demostración";

export default function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Anuncio"
      className="bg-ink px-5 py-2.5 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-cream"
    >
      <p>
        {ANNOUNCEMENT}
        <span className="hidden sm:inline">
          <span aria-hidden="true" className="mx-3 text-warm">
            /
          </span>
          {SECONDARY_NOTE}
        </span>
      </p>
    </div>
  );
}