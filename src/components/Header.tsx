"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import FreeShippingBar from "@/components/FreeShippingBar";

const NAV_LINKS = [
  { href: "/#categorias", label: "Categorías" },
  { href: "/#destacados", label: "Destacados" },
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/#coleccion", label: "Colección" },
  { href: "/#nosotros", label: "Nosotros" },
] as const;

const iconButtonClasses =
  "inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-ink/5";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function Header() {
  const { totalItems, openCart } = useCart();
  const pathname = usePathname();
  // Enlaces de fragmento de la misma página: no pasar por el enrutador
  // de Next.js. Repetir un fragmento activo debe volver a desplazar.
  const anchorHref = (absolute: string) => pathname === "/" ? absolute.slice(1) : absolute;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Cierra el menú móvil con la tecla Escape y devuelve el foco al botón.
  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const cartLabel =
    totalItems === 0
      ? "Abrir carrito, vacío"
      : `Abrir carrito, ${totalItems} ${totalItems === 1 ? "producto" : "productos"}`;

  return (
    <div className="sticky top-0 z-40">
  {!pathname.startsWith("/checkout") && <FreeShippingBar />}
  <header className="border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <div className="flex flex-1 items-center">
          <a
            href={anchorHref("/#inicio")}
            aria-label="OFFGRID, ir al inicio"
            className="text-[17px] font-semibold tracking-[0.34em] text-ink"
          >
            OFFGRID
          </a>
        </div>

        {/* Navegación de escritorio */}
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={anchorHref(link.href)}
                  className="relative text-[12px] font-medium uppercase tracking-[0.16em] text-ink after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Acciones */}
        <div className="flex flex-1 items-center justify-end gap-1">
          <a href={anchorHref("/#catalogo")} aria-label="Buscar productos" className={iconButtonClasses}>
            <SearchIcon />
          </a>

          <button
            type="button"
            onClick={openCart}
            aria-label={cartLabel}
            className={`${iconButtonClasses} relative`}
          >
            <BagIcon />
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center bg-ink px-1 text-[10px] font-semibold leading-none text-cream"
              >
                {totalItems}
              </span>
            )}
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className={`${iconButtonClasses} lg:hidden`}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <nav
        id="menu-movil"
        aria-label="Navegación móvil"
        hidden={!menuOpen}
        className="animate-fade-in border-t border-ink/10 bg-cream lg:hidden"
      >
        <ul className="mx-auto max-w-7xl px-5 pb-4 pt-2 sm:px-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="border-b border-ink/10 last:border-b-0">
              <a
                href={anchorHref(link.href)}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-4 font-serif text-3xl text-ink"
              >
                {link.label}
                <span aria-hidden="true" className="text-base text-warm">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      </header>
    </div>
  );
}