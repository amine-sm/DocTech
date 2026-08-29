import type { Product } from "@/lib/catalog";

export type CartItem = { product: Product; quantity: number };
const CART_KEY = "doctech-cart-v1";
export const CART_EVENT = "doctech-cart-updated";

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getCart(): CartItem[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (!hasStorage()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function addToCart(product: Product, quantity = 1) {
  const items = getCart();
  const existing = items.find((item) => item.product.id === product.id);
  if (existing) existing.quantity = Math.min(99, existing.quantity + Math.max(1, quantity));
  else items.push({ product, quantity: Math.max(1, quantity) });
  saveCart(items);
  return items;
}

export function updateCartQuantity(productId: number, quantity: number) {
  const items = getCart();
  const next = quantity <= 0
    ? items.filter((item) => item.product.id !== productId)
    : items.map((item) => item.product.id === productId ? { ...item, quantity: Math.min(99, quantity) } : item);
  saveCart(next);
  return next;
}

export function removeFromCart(productId: number) {
  const next = getCart().filter((item) => item.product.id !== productId);
  saveCart(next);
  return next;
}

export function clearCart() { saveCart([]); }
export function getCartCount(items = getCart()) { return items.reduce((sum, item) => sum + item.quantity, 0); }
export function getCartSubtotal(items = getCart()) { return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0); }
