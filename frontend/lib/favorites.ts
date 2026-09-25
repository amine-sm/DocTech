"use client";

import { useEffect, useState, useCallback } from "react";
import type { Product } from "@/lib/catalog";

/* =========================================================
   CONSTANTES
========================================================= */
const FAVORITES_KEY = "doctech-favorites-v1";
export const FAVORITES_EVENT = "doctech-favorites-updated";

/* =========================================================
   HELPERS INTERNES
========================================================= */
function hasLocalStorage() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function readFavorites(): Product[] {
  if (!hasLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeFavorites(products: Product[]) {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
  } catch {
    /* ignore */
  }
}

/* =========================================================
   API IMPÉRATIVE (hors React)
========================================================= */

/** Récupère tous les favoris */
export function getFavorites(): Product[] {
  return readFavorites();
}

/** Écrase la liste complète */
export function saveFavorites(products: Product[]) {
  writeFavorites(products);
}

/** Vérifie si un produit est en favori */
export function isFavorite(productId: number): boolean {
  return readFavorites().some((p) => p.id === productId);
}

/** Ajoute un produit aux favoris */
export function addFavorite(product: Product): Product[] {
  const current = readFavorites();
  if (!current.some((item) => item.id === product.id)) {
    current.unshift(product);
  }
  writeFavorites(current);
  return current;
}

/** Retire un produit des favoris */
export function removeFavorite(productId: number): Product[] {
  const next = readFavorites().filter((p) => p.id !== productId);
  writeFavorites(next);
  return next;
}

/** Bascule un produit (ajoute ou retire) */
export function toggleFavorite(product: Product): {
  favorite: boolean;
  products: Product[];
} {
  if (isFavorite(product.id)) {
    return { favorite: false, products: removeFavorite(product.id) };
  }
  return { favorite: true, products: addFavorite(product) };
}

/** Compte le nombre de favoris */
export function getFavoritesCount(): number {
  return readFavorites().length;
}

/* =========================================================
   HOOK REACT
========================================================= */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Product[]>([]);

  /* -------------------------------------------------------
     INITIALISATION + ÉCOUTE DES CHANGEMENTS
  ------------------------------------------------------- */
  useEffect(() => {
    setFavorites(readFavorites());

    const onChange = () => setFavorites(readFavorites());

    window.addEventListener(FAVORITES_EVENT, onChange);
    window.addEventListener("storage", onChange);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  /* -------------------------------------------------------
     TOGGLE
  ------------------------------------------------------- */
  const toggle = useCallback((product: Product) => {
    const result = toggleFavorite(product);
    setFavorites(result.products);
    return result.favorite;
  }, []);

  /* -------------------------------------------------------
     IS FAVORITE
  ------------------------------------------------------- */
  const isFav = useCallback(
    (id: number) => favorites.some((p) => p.id === id),
    [favorites]
  );

  return {
    favorites,
    count: favorites.length,
    isFavorite: isFav,
    toggle,
  };
}