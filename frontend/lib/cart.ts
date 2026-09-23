import type { Product } from "@/lib/catalog";

export type CartItem = { product: Product; quantity: number };

const CART_KEY = "doctech-cart-v1";
export const CART_EVENT = "doctech-cart-updated";

/* =========================================================
   STORAGE
========================================================= */

function hasStorage() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

/* =========================================================
   LECTURE
========================================================= */

export function getCart(): CartItem[] {
  if (!hasStorage()) return [];

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CartItem[];

    if (!Array.isArray(parsed)) return [];

    // ⭐ Filtrer les articles dont le stock est devenu 0
    return parsed.filter(
      (item) =>
        item &&
        item.product &&
        Number(item.product.stock ?? 0) > 0
    );
  } catch {
    return [];
  }
}

/* =========================================================
   ÉCRITURE
========================================================= */

export function saveCart(items: CartItem[]) {
  if (!hasStorage()) return;

  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

/* =========================================================
   AJOUT — bloqué si stock = 0
========================================================= */

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const items = getCart();

  const stock = Number(product.stock ?? 0);

  // ⭐ Refuser si rupture de stock
  if (stock <= 0) {
    console.warn(
      `❌ Stock épuisé pour "${product.name}".`
    );
    return items;
  }

  const requested = Math.max(1, Number(quantity) || 1);
  const existing = items.find((item) => item.product.id === product.id);

  if (existing) {
    // ⭐ Limiter à 99 ET au stock disponible
    const newQuantity = Math.min(
      99,
      stock,
      existing.quantity + requested
    );
    existing.quantity = newQuantity;
    existing.product.stock = stock;
  } else {
    // ⭐ Ne jamais dépasser le stock
    const initialQuantity = Math.min(99, stock, requested);
    items.push({
      product: { ...product, stock },
      quantity: initialQuantity,
    });
  }

  saveCart(items);
  return items;
}

/* =========================================================
   MISE À JOUR QUANTITÉ
========================================================= */

export function updateCartQuantity(
  productId: number,
  quantity: number
): CartItem[] {
  const items = getCart();

  const next =
    quantity <= 0
      ? items.filter((item) => item.product.id !== productId)
      : items.map((item) => {
          if (item.product.id !== productId) return item;

          const stock = Number(item.product.stock ?? 0);
          const safeQuantity = Math.min(
            99,
            Math.max(1, quantity),
            stock > 0 ? stock : 1
          );

          return { ...item, quantity: safeQuantity };
        });

  saveCart(next);
  return next;
}

/* =========================================================
   SUPPRESSION
========================================================= */

export function removeFromCart(productId: number): CartItem[] {
  const next = getCart().filter(
    (item) => item.product.id !== productId
  );
  saveCart(next);
  return next;
}

export function clearCart() {
  saveCart([]);
}

/* =========================================================
   COMPTEURS
========================================================= */

export function getCartCount(items = getCart()) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items = getCart()) {
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
}