import type { Product } from "@/lib/catalog";

const FAVORITES_KEY = "doctech-favorites-session-v1";
export const FAVORITES_EVENT = "doctech-favorites-updated";

function hasSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getFavorites(): Product[] {
  if (!hasSessionStorage()) return [];
  try {
    const raw = window.sessionStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(products: Product[]) {
  if (!hasSessionStorage()) return;
  window.sessionStorage.setItem(FAVORITES_KEY, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
}

export function isFavorite(productId: number) {
  return getFavorites().some((product) => product.id === productId);
}

export function addFavorite(product: Product) {
  const current = getFavorites();
  if (!current.some((item) => item.id === product.id)) current.unshift(product);
  saveFavorites(current);
  return current;
}

export function removeFavorite(productId: number) {
  const next = getFavorites().filter((product) => product.id !== productId);
  saveFavorites(next);
  return next;
}

export function toggleFavorite(product: Product) {
  if (isFavorite(product.id)) {
    return { favorite: false, products: removeFavorite(product.id) };
  }
  return { favorite: true, products: addFavorite(product) };
}

export function getFavoritesCount() {
  return getFavorites().length;
}
