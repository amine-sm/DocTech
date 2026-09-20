import { apiFetch } from "@/lib/api";

export type DeliveryWilaya = { id: string | number; name: string };
export type DeliveryCommune = { id: string | number; name: string };
export type DeliveryAgence = { id: string | number; name: string; address?: string; phone?: string; wilayaId?: string | number | null; communeId?: string | number | null };
export type ShippingCost = { wilayaId: string | number; name?: string; home?: number | null; desk?: number | null };

export async function getDeliveryWilayas() {
  const response = await apiFetch<DeliveryWilaya[]>("/delivery/wilayas");
  return Array.isArray(response.data) ? response.data : [];
}

export async function getDeliveryMunicipalities(wilaya: string | number) {
  const response = await apiFetch<DeliveryCommune[]>(`/delivery/municipalities?wilaya=${encodeURIComponent(String(wilaya))}`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function getDeliveryAgences(wilaya?: string | number) {
  const path = wilaya
    ? `/delivery/agences?wilaya=${encodeURIComponent(String(wilaya))}`
    : "/delivery/agences";
  const response = await apiFetch<DeliveryAgence[]>(path);
  return Array.isArray(response.data) ? response.data : [];
}

export async function getShippingCosts(wilaya?: string | number) {
  const path = wilaya
    ? `/delivery/shipping-costs?wilaya=${encodeURIComponent(String(wilaya))}`
    : "/delivery/shipping-costs";
  const response = await apiFetch<{ items: ShippingCost[]; fee: number | null; fallback: number }>(path);
  return response.data || { items: [], fee: null, fallback: 800 };
}
