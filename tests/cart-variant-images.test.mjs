// Comprueba todas las variantes de los 12 productos con los fixtures reales.
import assert from "node:assert/strict";
import { products } from "../src/data/products.ts";
import { getCartVariantImage } from "../src/lib/cart-variant-image.ts";

assert.equal(products.length, 12);
let totalVariants=0;
for (const product of products) {
  for (const variant of product.variants ?? []) {
    totalVariants++;
    const expected = variant.image || variant.gallery?.[0];
    assert(expected, `Sin foto para ${product.name} / ${variant.color}`);
    assert.equal(getCartVariantImage(product,variant.color),expected);
  }
}
const tee=products.find(p=>p.slug==="essential-tee");
assert(tee);
assert.equal(getCartVariantImage(tee,"Gris"),"/products/tees/essential-tee-grey-1.webp");
assert.notEqual(getCartVariantImage(tee,"Gris"),tee.image);
assert.equal(getCartVariantImage(tee,"Crema"),"/products/tees/essential-tee.png");
console.log(`VARIANT_IMAGES_PASS: ${products.length} productos, ${totalVariants} variantes`);
