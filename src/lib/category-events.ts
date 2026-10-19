import type { CategoryId } from "@/types";

/** Evento con el que las tarjetas de categoría le piden al catálogo que filtre. */
export const CATEGORY_SELECT_EVENT = "offgrid:select-category";

export function selectCategory(id: CategoryId): void {
  window.dispatchEvent(new CustomEvent<CategoryId>(CATEGORY_SELECT_EVENT, { detail: id }));
}