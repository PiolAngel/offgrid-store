
const ANNOUNCEMENT = "DELIVERY GRATIS EN PEDIDOS DE ₲ 500.000 O MÁS";

export default function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Promoción de envío"
      className="bg-ink px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-cream sm:text-[11px] sm:tracking-[0.18em]"
    >
      <p>{ANNOUNCEMENT}</p>
    </div>
  );
}
