
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import {
  DELIVERY_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/order-labels";
import {
  DELIVERY_COST,
  FREE_SHIPPING_THRESHOLD,
  formatPrice,
  getDeliveryCost,
} from "@/lib/pricing";
import { readJSON, removeKey, writeJSON } from "@/lib/storage";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type {
  DeliveryMethod,
  Order,
  PaymentMethod,
} from "@/types";

const DRAFT_KEY = "offgrid:checkout-draft:v1";

type Step = 1 | 2 | 3 | 4;

interface Draft {
  requestId: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod | "";
  step: Step;
}

const INITIAL_DRAFT: Draft = {
  requestId: "",
  name: "",
  phone: "",
  address: "",
  notes: "",
  deliveryMethod: "delivery",
  paymentMethod: "",
  step: 1,
};

function normalizePhone(phone: string) {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("595")) return digits;
  if (digits.startsWith("0")) digits = digits.slice(1);

  return `595${digits}`;
}

function validateCustomer(draft: Draft) {
  const errors: Record<string, string> = {};

  if (
    draft.name.trim().length < 3 ||
    draft.name.trim().split(/\s+/).length < 2
  ) {
    errors.name = "Ingresá tu nombre y apellido.";
  }

  const phone = normalizePhone(draft.phone);
  if (!/^5959\d{8}$/.test(phone)) {
    errors.phone = "Ingresá un número paraguayo válido.";
  }

  if (draft.deliveryMethod === "delivery" && draft.address.trim().length < 5) {
    errors.address = "Ingresá tu dirección o una referencia.";
  }

  return errors;
}

function parseDraft(raw: unknown): Draft {
  if (typeof raw !== "object" || raw === null) return INITIAL_DRAFT;

  const data = raw as Record<string, unknown>;

  return {
    requestId: typeof data.requestId === "string" ? data.requestId : "",
    name: typeof data.name === "string" ? data.name : "",
    phone: typeof data.phone === "string" ? data.phone : "",
    address: typeof data.address === "string" ? data.address : "",
    notes: typeof data.notes === "string" ? data.notes : "",
    deliveryMethod: data.deliveryMethod === "pickup" ? "pickup" : "delivery",
    paymentMethod:
      data.paymentMethod === "transfer" || data.paymentMethod === "cash"
        ? data.paymentMethod
        : "",
    step:
      data.step === 2 || data.step === 3 || data.step === 4
        ? data.step
        : 1,
  };
}

const inputClass =
  "h-12 w-full rounded-sm border border-[#d9d2c7] bg-transparent px-3 text-sm text-[#211f1c] outline-none placeholder:text-[#a39d94] focus:border-[#211f1c]";

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] tracking-[0.2em] text-[#77716a]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function OptionCard({
  selected,
  title,
  description,
  price,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  price?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-sm border p-4 text-left transition-colors ${
        selected
          ? "border-[#211f1c] bg-[#eee9df]"
          : "border-[#d9d2c7] hover:border-[#211f1c]"
      }`}
    >
      <span
        className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
          selected ? "border-[#211f1c] bg-[#211f1c]" : "border-[#aaa39a]"
        }`}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-[#77716a]">
          {description}
        </span>
      </span>
      {price && <span className="text-sm font-medium">{price}</span>}
    </button>
  );
}

function Totals({
  subtotal,
  deliveryCost,
}: {
  subtotal: number;
  deliveryCost: number;
}) {
  return (
    <dl className="space-y-2 border-t border-[#ded6ca] pt-4 text-sm">
      <div className="flex justify-between">
        <dt className="text-[#77716a]">Subtotal</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-[#77716a]">Delivery</dt>
        <dd>{deliveryCost === 0 ? "GRATIS" : formatPrice(deliveryCost)}</dd>
      </div>
      <div className="flex justify-between pt-1 text-base font-medium">
        <dt>Total</dt>
        <dd>{formatPrice(subtotal + deliveryCost)}</dd>
      </div>
    </dl>
  );
}

export default function CheckoutFlow() {
  const { items, subtotal, clearCart, openCart } = useCart();
  const { createOrder, catalogReady, catalogError, refresh } = useStore();

  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const [draftReady, setDraftReady] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const stored = readJSON<unknown>(DRAFT_KEY);
    const parsed = stored ? parseDraft(stored) : INITIAL_DRAFT;
    const restored = {
      ...parsed,
      requestId: /^[0-9a-f-]{36}$/i.test(parsed.requestId) ? parsed.requestId : crypto.randomUUID(),
    };
    queueMicrotask(() => {
      if (!mounted) return;
      setDraft(restored);
      setDraftReady(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (draftReady && !order) writeJSON(DRAFT_KEY, draft);
  }, [draft, draftReady, order]);

  const errors = validateCustomer(draft);
  const deliveryCost = getDeliveryCost(subtotal, draft.deliveryMethod);
  const total = subtotal + deliveryCost;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSubmitError("");
  }

  function goNext() {
    if (draft.step === 1 && (errors.name || errors.phone)) {
      setShowErrors(true);
      return;
    }

    if (draft.step === 2 && errors.address) {
      setShowErrors(true);
      return;
    }

    if (draft.step === 3 && !draft.paymentMethod) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    update("step", (draft.step + 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setShowErrors(false);
    update("step", (draft.step - 1) as Step);
  }

  async function confirmOrder() {
    if (!draft.paymentMethod || submitting || items.length === 0 || !catalogReady) return;
    if (Object.keys(validateCustomer(draft)).length) {
      update("step", errors.address && !errors.name && !errors.phone ? 2 : 1);
      setShowErrors(true);
      return;
    }

    const phone = normalizePhone(draft.phone);

    if (!/^5959\d{8}$/.test(phone)) {
      update("step", 1);
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
    const result = await createOrder({
      requestId: draft.requestId,
      customer: {
        name: draft.name.trim(),
        phone,
        address: draft.address.trim(),
        notes: draft.notes.trim() || undefined,
      },
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        image: item.product.image,
      })),
      subtotal,
      deliveryCost,
      total,
      deliveryMethod: draft.deliveryMethod,
      paymentMethod: draft.paymentMethod,
      paymentStatus: "pending",
      status: "pending",
    });

    removeKey(DRAFT_KEY);
    clearCart();
    setOrder(result);
    window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo registrar el pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!draftReady) {
    return (
      <section className="px-5 py-20 text-center text-sm text-[#77716a]">
        Cargando tu pedido...
      </section>
    );
  }

  if (order) {
    const message = [
      `Hola OFFGRID, quiero confirmar mi pedido ${order.code}.`,
      "",
      `Cliente: ${order.customer.name}`,
      `Teléfono: +${order.customer.phone}`,
      `Dirección: ${order.customer.address || "Retiro a coordinar"}`,
      `Entrega: ${DELIVERY_METHOD_LABELS[order.deliveryMethod]}`,
      `Pago: ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`,
      "",
      ...order.items.map(
        (item) =>
          `• ${item.name} — ${item.color}, talle ${item.size} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`,
      ),
      "",
      `Total: ${formatPrice(order.total)}`,
    ].join("\n");

    return (
      <section className="mx-auto max-w-2xl px-5 py-12 text-[#211f1c] sm:py-16">
        <div className="border border-[#d9d2c7] bg-[#f5f1e9] p-6 sm:p-9">
          <p className="text-[10px] tracking-[0.3em] text-[#77716a]">
            PEDIDO REGISTRADO
          </p>
          <h1 className="mt-3 font-serif text-4xl">
            ¡Gracias por tu pedido!
          </h1>
          <p className="mt-6 text-[10px] tracking-[0.2em] text-[#77716a]">
            CÓDIGO DE PEDIDO
          </p>
          <p className="mt-1 text-3xl font-medium tracking-widest">
            {order.code}
          </p>

          <p className="mt-5 bg-[#eee9df] px-4 py-3 text-xs leading-relaxed text-[#5e5a52]">
            Tu pedido fue registrado. Para coordinar la entrega y el pago, enviá el mensaje por WhatsApp. No se realizó ningún cobro online.
          </p>

          <div className="mt-6 space-y-2 text-sm">
            <p><strong>Cliente:</strong> {order.customer.name}</p>
            <p><strong>Teléfono:</strong> +{order.customer.phone}</p>
            <p><strong>Entrega:</strong> {DELIVERY_METHOD_LABELS[order.deliveryMethod]}</p>
            <p><strong>Pago:</strong> {PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
          </div>

          <div className="mt-6">
            {order.items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="flex justify-between border-b border-[#ded6ca] py-3 text-sm">
                <span>{item.name} · {item.color} · {item.size} x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Totals subtotal={order.subtotal} deliveryCost={order.deliveryCost} />
          </div>

          <a
            href={buildWhatsAppUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex min-h-14 items-center justify-center bg-[#211f1c] px-5 text-center text-xs font-medium tracking-[0.15em] text-[#f5f1e9] hover:bg-[#45413b]"
          >
            ENVIAR PEDIDO POR WHATSAPP
          </a>

          <Link
            href="/"
            className="mt-3 flex min-h-14 items-center justify-center border border-[#211f1c] text-xs tracking-[0.15em]"
          >
            SEGUIR COMPRANDO
          </Link>
          <p className="mt-3 text-center text-[11px] text-[#89837c]">
            WhatsApp abrirá un mensaje preparado. Vos decidís si lo enviás.
          </p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-serif text-3xl">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-[#77716a]">
          Agregá productos para continuar con tu compra.
        </p>
        <Link
          href="/#catalogo"
          className="mt-7 inline-flex min-h-12 items-center bg-[#211f1c] px-7 text-xs tracking-widest text-[#f5f1e9]"
        >
          VER CATÁLOGO
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 text-[#211f1c] sm:px-8 sm:py-12">
      <nav className="mb-8" aria-label="Etapas del pedido">
        <ol className="grid grid-cols-4 gap-2">
          {["Tus datos", "Entrega", "Pago", "Confirmación"].map((label, index) => {
            const number = (index + 1) as Step;
            return (
              <li key={label}>
                <span className={`block h-1 rounded-full ${number <= draft.step ? "bg-[#211f1c]" : "bg-[#d8d0c4]"}`} />
                <span className="mt-2 block text-[10px] tracking-wider text-[#77716a] sm:text-xs">
                  {number}. <span className="hidden sm:inline">{label.toUpperCase()}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="min-w-0">
          {draft.step === 1 && (
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl">Tus datos</h1>
              <p className="mt-2 text-sm text-[#77716a]">
                Los usamos para coordinar la entrega de tu pedido.
              </p>
              <div className="mt-7 space-y-5">
                <Field
                  label="NOMBRE COMPLETO"
                  value={draft.name}
                  onChange={(value) => update("name", value)}
                  placeholder="Nombre y apellido"
                  error={showErrors ? errors.name : undefined}
                />
                <Field
                  label="TELÉFONO / WHATSAPP"
                  value={draft.phone}
                  onChange={(value) => update("phone", value)}
                  placeholder="0981 123 456"
                  type="tel"
                  error={showErrors ? errors.phone : undefined}
                />
                <Field
                  label="REFERENCIAS (OPCIONAL)"
                  value={draft.notes}
                  onChange={(value) => update("notes", value)}
                  placeholder="Portón negro, cerca de..."
                />
              </div>
            </div>
          )}

          {draft.step === 2 && (
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl">Método de entrega</h1>
              <p className="mt-2 text-sm text-[#77716a]">
                Delivery gratis desde {formatPrice(FREE_SHIPPING_THRESHOLD)}.
              </p>
              <div className="mt-7 space-y-3">
                <OptionCard
                  selected={draft.deliveryMethod === "delivery"}
                  title="Delivery"
                  description="Lo llevamos a la dirección indicada."
                  price={freeShipping ? "GRATIS" : formatPrice(DELIVERY_COST)}
                  onClick={() => update("deliveryMethod", "delivery")}
                />
                <OptionCard
                  selected={draft.deliveryMethod === "pickup"}
                  title="Retiro en local"
                  description="Coordinaremos el punto de retiro por WhatsApp."
                  price="GRATIS"
                  onClick={() => update("deliveryMethod", "pickup")}
                />
              </div>
              {draft.deliveryMethod === "delivery" && (
                <div className="mt-5">
                  <Field
                    label="DIRECCIÓN DE ENTREGA"
                    value={draft.address}
                    onChange={(value) => update("address", value)}
                    placeholder="Calle, número, barrio, ciudad"
                    error={showErrors ? errors.address : undefined}
                  />
                </div>
              )}
              {freeShipping && (
                <p className="mt-4 text-xs text-[#5e5a52]">
                  ¡Tu compra alcanza el envío gratis!
                </p>
              )}
            </div>
          )}

          {draft.step === 3 && (
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl">Método de pago</h1>
              <p className="mt-3 bg-[#eee9df] px-4 py-3 text-xs leading-relaxed text-[#5e5a52]">
                No se cobra online. Coordinaremos el pago por WhatsApp al confirmar tu pedido.
              </p>
              <div className="mt-6 space-y-3">
                <OptionCard
                  selected={draft.paymentMethod === "transfer"}
                  title="Transferencia"
                  description="Coordinaremos los datos bancarios por WhatsApp antes del pago."
                  onClick={() => update("paymentMethod", "transfer")}
                />
                <OptionCard
                  selected={draft.paymentMethod === "cash"}
                  title="Efectivo"
                  description="Pago en efectivo al recibir el pedido."
                  onClick={() => update("paymentMethod", "cash")}
                />
              </div>
              {showErrors && !draft.paymentMethod && (
                <p role="alert" className="mt-3 text-xs text-red-700">
                  Elegí un método de pago.
                </p>
              )}
            </div>
          )}

          {draft.step === 4 && (
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl">Confirmá tu pedido</h1>
              <p className="mt-2 text-sm text-[#77716a]">
                Revisá tus datos antes de registrar el pedido.
              </p>
              <div className="mt-7 space-y-4 text-sm">
                <div className="border border-[#d9d2c7] p-4">
                  <p className="text-[10px] tracking-widest text-[#77716a]">CLIENTE</p>
                  <p className="mt-2">{draft.name}</p>
                  <p>{draft.phone}</p>
                  {draft.deliveryMethod === "delivery" && <p>{draft.address}</p>}
                  {draft.notes && <p>{draft.notes}</p>}
                  <button onClick={() => update("step", 1)} className="mt-3 text-xs underline">Editar</button>
                </div>
                <div className="border border-[#d9d2c7] p-4">
                  <p className="text-[10px] tracking-widest text-[#77716a]">ENTREGA</p>
                  <p className="mt-2">{DELIVERY_METHOD_LABELS[draft.deliveryMethod]}</p>
                  <button onClick={() => update("step", 2)} className="mt-3 text-xs underline">Editar</button>
                </div>
                <div className="border border-[#d9d2c7] p-4">
                  <p className="text-[10px] tracking-widest text-[#77716a]">PAGO</p>
                  <p className="mt-2">{draft.paymentMethod ? PAYMENT_METHOD_LABELS[draft.paymentMethod] : ""}</p>
                  <button onClick={() => update("step", 3)} className="mt-3 text-xs underline">Editar</button>
                </div>
              </div>
              {!catalogReady && (
                <div role="status" className="mt-5 text-sm text-[#77716a]">
                  {catalogError ? "El inventario no está disponible. No confirmaremos pedidos sin verificar el stock." : "Comprobando disponibilidad y precios..."}
                  {catalogError && <button type="button" className="ml-2 underline" onClick={() => void refresh()}>Reintentar</button>}
                </div>
              )}
              {submitError && (
                <div role="alert" className="mt-5 text-sm text-red-700">
                  {submitError}
                  <button onClick={openCart} className="ml-2 underline">Revisar carrito</button>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {draft.step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="min-h-14 border border-[#211f1c] px-7 text-xs tracking-widest"
              >
                VOLVER
              </button>
            ) : (
              <Link
                href="/#catalogo"
                className="flex min-h-14 items-center justify-center border border-[#d8d0c4] px-7 text-xs tracking-widest"
              >
                SEGUIR COMPRANDO
              </Link>
            )}

            {draft.step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="min-h-14 bg-[#211f1c] px-9 text-xs tracking-widest text-[#f5f1e9]"
              >
                CONTINUAR
              </button>
            ) : (
              <button
                type="button"
                onClick={confirmOrder}
                disabled={submitting || !catalogReady}
                className="min-h-14 bg-[#211f1c] px-9 text-xs tracking-widest text-[#f5f1e9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "REGISTRANDO PEDIDO..." : !catalogReady ? "VERIFICANDO DISPONIBILIDAD..." : `CONFIRMAR PEDIDO · ${formatPrice(total)}`}
              </button>
            )}
          </div>
        </div>

        <aside className="rounded-sm border border-[#d9d2c7] bg-[#f5f1e9] p-5 lg:sticky lg:top-36">
          <p className="text-[10px] tracking-[0.25em] text-[#77716a]">TU PEDIDO</p>
          <ul className="mt-3 divide-y divide-[#ded6ca]">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="mt-1 text-xs text-[#77716a]">
                    {item.color} · Talle {item.size} · x{item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-xs font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-2">
            <Totals subtotal={subtotal} deliveryCost={deliveryCost} />
          </div>
        </aside>
      </div>
    </section>
  );
}
