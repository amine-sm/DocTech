import { apiFetch } from "@/lib/api";

export type DeliveryWilaya = {
  id: string | number;
  name: string;
};

export type DeliveryCommune = {
  id: string | number;
  name: string;
};

export type DeliveryAgence = {
  id: string | number;
  name: string;
};

export type ShippingCost = {
  wilayaId: string | number;
  name?: string;
  home?: number | null;
  desk?: number | null;
};

export type ShippingCostsResponse = {
  items: ShippingCost[];
  fee: number | null;
};

type ApiListResponse<T> = {
  ok?: boolean;
  data?: T[];
  message?: string;
};

type ApiResponse<T> = {
  ok?: boolean;
  data?: T;
  message?: string;
};

/* =========================================================
   WILAYAS ELOGISTIA
========================================================= */

export async function getDeliveryWilayas(): Promise<DeliveryWilaya[]> {
  try {
    const response = await apiFetch<ApiListResponse<DeliveryWilaya>>(
      "/elogistia/wilayas",
    );

    if (!Array.isArray(response?.data)) {
      return [];
    }

    return response.data
      .filter(
        (item) =>
          item?.id !== undefined &&
          item?.id !== null &&
          String(item?.name ?? "").trim() !== "",
      )
      .map((item) => ({
        id: item.id,
        name: String(item.name).trim(),
      }));
  } catch (error) {
    console.error("❌ Elogistia wilayas :", error);
    return [];
  }
}

/* =========================================================
   COMMUNES ELOGISTIA
========================================================= */

export async function getDeliveryMunicipalities(
  wilaya: string | number,
): Promise<DeliveryCommune[]> {
  if (!wilaya) {
    return [];
  }

  try {
    const response = await apiFetch<ApiListResponse<DeliveryCommune>>(
      `/elogistia/municipalities?wilaya=${encodeURIComponent(
        String(wilaya),
      )}`,
    );

    if (!Array.isArray(response?.data)) {
      return [];
    }

    return response.data
      .filter(
        (item) =>
          item?.id !== undefined &&
          item?.id !== null &&
          String(item?.name ?? "").trim() !== "",
      )
      .map((item) => ({
        id: item.id,
        name: String(item.name).trim(),
      }));
  } catch (error) {
    console.error("❌ Elogistia communes :", error);
    return [];
  }
}

/* =========================================================
   AGENCES ELOGISTIA
========================================================= */

export async function getDeliveryAgences(
  wilaya?: string | number,
): Promise<DeliveryAgence[]> {
  try {
    let url = "/elogistia/agences";

    if (wilaya !== undefined && wilaya !== null && wilaya !== "") {
      url += `?wilaya=${encodeURIComponent(String(wilaya))}`;
    }

    const response = await apiFetch<ApiListResponse<DeliveryAgence>>(url);

    if (!Array.isArray(response?.data)) {
      return [];
    }

    return response.data
      .filter(
        (item) =>
          item?.id !== undefined &&
          item?.id !== null &&
          String(item?.name ?? "").trim() !== "",
      )
      .map((item) => ({
        id: item.id,
        name: String(item.name).trim(),
      }));
  } catch (error) {
    console.error("❌ Elogistia agences :", error);
    return [];
  }
}

/* =========================================================
   FRAIS ELOGISTIA
========================================================= */

export async function getShippingCosts(
  wilaya?: string | number,
): Promise<ShippingCostsResponse> {
  try {
    let url = "/elogistia/shipping-costs";

    if (wilaya !== undefined && wilaya !== null && wilaya !== "") {
      url += `?wilaya=${encodeURIComponent(String(wilaya))}`;
    }

    const response = await apiFetch<
      ApiResponse<ShippingCostsResponse>
    >(url);

    if (!response?.data) {
      return {
        items: [],
        fee: null,
      };
    }

    return {
      items: Array.isArray(response.data.items)
        ? response.data.items.map((item) => ({
            wilayaId: item.wilayaId,
            name: item.name,
            home:
              item.home !== null && item.home !== undefined
                ? Number(item.home)
                : null,
            desk:
              item.desk !== null && item.desk !== undefined
                ? Number(item.desk)
                : null,
          }))
        : [],
      fee:
        response.data.fee !== null &&
        response.data.fee !== undefined
          ? Number(response.data.fee)
          : null,
    };
  } catch (error) {
    console.error("❌ Elogistia frais livraison :", error);

    return {
      items: [],
      fee: null,
    };
  }
}