import { apiFetch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

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
  home: number | null;
  desk: number | null;
};

export type ShippingCostsResponse = {
  items: ShippingCost[];
  fee: number | null;
};

/* =========================================================
   EXTRAIRE BODY ELOGISTIA
========================================================= */

function getElogistiaBody(
  response: any
): any[] {
  /*
   * Réponse backend :
   *
   * {
   *   ok: true,
   *   data: {
   *     body: [...]
   *   }
   * }
   */

  if (Array.isArray(response?.data?.body)) {
    return response.data.body;
  }

  if (Array.isArray(response?.body)) {
    return response.body;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

/* =========================================================
   WILAYAS
========================================================= */

export async function getDeliveryWilayas(): Promise<
  DeliveryWilaya[]
> {
  try {
    const response = await apiFetch<any>(
      "/elogistia/wilayas"
    );

    console.log(
      "🚚 ELOGISTIA WILAYAS RESPONSE:",
      response
    );

    const rows =
      getElogistiaBody(response);

    console.log(
      "🚚 ELOGISTIA WILAYAS BODY:",
      rows
    );

    return rows
      .map(
        (item: any): DeliveryWilaya | null => {
          /*
           * Elogistia retourne :
           *
           * {
           *   Id: "31",
           *   wilaya: "Oran"
           * }
           */

          const id =
            item?.Id ??
            item?.id ??
            item?.ID ??
            item?.code;

          const name =
            item?.wilaya ??
            item?.Wilaya ??
            item?.name ??
            item?.nom;

          if (
            id === undefined ||
            id === null ||
            !name
          ) {
            return null;
          }

          return {
            id: String(id),
            name: String(name).trim(),
          };
        }
      )
      .filter(
        (
          item
        ): item is DeliveryWilaya =>
          item !== null
      );

  } catch (error) {
    console.error(
      "❌ Elogistia wilayas :",
      error
    );

    return [];
  }
}

/* =========================================================
   COMMUNES
========================================================= */

export async function getDeliveryMunicipalities(
  wilaya: string | number
): Promise<DeliveryCommune[]> {
  if (
    wilaya === undefined ||
    wilaya === null ||
    String(wilaya).trim() === ""
  ) {
    return [];
  }

  try {
    const response =
      await apiFetch<any>(
        `/elogistia/municipalities?wilaya=${encodeURIComponent(
          String(wilaya)
        )}`
      );

    console.log(
      "🏙️ ELOGISTIA COMMUNES RESPONSE:",
      response
    );

    const rows =
      getElogistiaBody(response);

    console.log(
      "🏙️ ELOGISTIA COMMUNES BODY:",
      rows
    );

    return rows
      .map(
        (item: any): DeliveryCommune | null => {
          const id =
            item?.Id ??
            item?.id ??
            item?.ID ??
            item?.code ??
            item?.communeID ??
            item?.communeId;

          const name =
            item?.commune ??
            item?.Commune ??
            item?.communeLabel ??
            item?.name ??
            item?.nom;

          if (
            id === undefined ||
            id === null ||
            !name
          ) {
            return null;
          }

          return {
            id: String(id),
            name: String(name).trim(),
          };
        }
      )
      .filter(
        (
          item
        ): item is DeliveryCommune =>
          item !== null
      );

  } catch (error) {
    console.error(
      "❌ Elogistia communes :",
      error
    );

    return [];
  }
}

/* =========================================================
   AGENCES
========================================================= */

export async function getDeliveryAgences(
  wilaya?: string | number
): Promise<DeliveryAgence[]> {
  try {
    let url =
      "/elogistia/agences";

    if (
      wilaya !== undefined &&
      wilaya !== null &&
      String(wilaya).trim() !== ""
    ) {
      url +=
        `?wilaya=${encodeURIComponent(
          String(wilaya)
        )}`;
    }

    const response =
      await apiFetch<any>(url);

    const rows =
      getElogistiaBody(response);

    return rows
      .map(
        (item: any): DeliveryAgence | null => {
          const id =
            item?.Id ??
            item?.id ??
            item?.ID ??
            item?.code;

          const name =
            item?.agence ??
            item?.agenceLabel ??
            item?.name ??
            item?.nom;

          if (
            id === undefined ||
            id === null ||
            !name
          ) {
            return null;
          }

          return {
            id: String(id),
            name: String(name).trim(),
          };
        }
      )
      .filter(
        (
          item
        ): item is DeliveryAgence =>
          item !== null
      );

  } catch (error) {
    console.error(
      "❌ Elogistia agences :",
      error
    );

    return [];
  }
}

/* =========================================================
   TARIFS
========================================================= */

export async function getShippingCosts(
  wilaya?: string | number
): Promise<ShippingCostsResponse> {
  try {
    let url =
      "/elogistia/shipping-costs";

    if (
      wilaya !== undefined &&
      wilaya !== null &&
      String(wilaya).trim() !== ""
    ) {
      url +=
        `?wilaya=${encodeURIComponent(
          String(wilaya)
        )}`;
    }

    const response =
      await apiFetch<any>(url);

    console.log(
      "💰 ELOGISTIA SHIPPING RESPONSE:",
      response
    );

    const rows =
      getElogistiaBody(response);

    console.log(
      "💰 ELOGISTIA SHIPPING BODY:",
      rows
    );

    const items: ShippingCost[] =
      rows.map(
        (item: any) => {
          const wilayaId =
            item?.wilayaID ??
            item?.wilayaId ??
            item?.wilaya_id ??
            item?.Id ??
            "";

          const name =
            item?.wilayaLabel ??
            item?.wilaya ??
            item?.name ??
            "";

          const home =
            item?.home !== undefined &&
            item?.home !== null
              ? Number(item.home)
              : null;

          const desk =
            item?.stopdesk !== undefined &&
            item?.stopdesk !== null
              ? Number(item.stopdesk)
              : item?.desk !== undefined &&
                item?.desk !== null
              ? Number(item.desk)
              : null;

          return {
            wilayaId: String(
              wilayaId
            ),
            name: String(name).trim(),
            home:
              home !== null &&
              Number.isFinite(home)
                ? home
                : null,
            desk:
              desk !== null &&
              Number.isFinite(desk)
                ? desk
                : null,
          };
        }
      );

    console.log(
      "💰 TARIFS NORMALISÉS:",
      items
    );

    return {
      items,
      fee: null,
    };

  } catch (error) {
    console.error(
      "❌ Elogistia frais livraison :",
      error
    );

    return {
      items: [],
      fee: null,
    };
  }
}