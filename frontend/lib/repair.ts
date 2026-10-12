import { apiFetch } from "@/lib/api";

/* =========================================================

   TYPES

========================================================= */

export type RepairStatus =

  | "EN_ATTENTE"

  | "TICKET_CREE"

  | "APPAREIL_RECU"

  | "DIAGNOSTIC"

  | "DEVIS_ENVOYE"

  | "DEVIS_ACCEPTE"

  | "DEVIS_REFUSE"

  | "EN_REPARATION"

  | "REPARATION_TERMINEE"

  | "PRET_A_RECUPERER"

  | "RECUPERE"

  | "ANNULE"

  | "IRREPARABLE";

export interface RepairType {

  id: number;

  name: string;

  name_ar?: string | null;

  description?: string | null;

  pricing_mode?: "DEVIS" | "FIXE" | string | null;

  base_price?: number | string | null;

  active?: boolean | number;

  created_at?: string;

  updated_at?: string;

}

export interface Repair {

  id: number;

  ticket_number: string;

  customer_name: string;

  customer_email?: string | null;

  customer_phone?: string | null;

  device: string;

  brand?: string | null;

  model?: string | null;

  serial_number?: string | null;

  repair_type_id?: number | null;

  repair_type_name?: string | null;

  problem: string;

  description?: string | null;

  customer_note?: string | null;

  admin_note?: string | null;

  diagnosis?: string | null;

  status: RepairStatus | string;

  technician_id?: number | null;

  technician_name?: string | null;

  estimated_price?: number | string | null;

  final_price?: number | string | null;

  received_at?: string | null;

  diagnosed_at?: string | null;

  quote_sent_at?: string | null;

  quote_accepted_at?: string | null;

  started_at?: string | null;

  completed_at?: string | null;

  ready_at?: string | null;

  recovered_at?: string | null;

  created_at?: string;

  updated_at?: string;

}

export interface RepairHistory {

  id: number;

  old_status?: string | null;

  new_status: string;

  comment?: string | null;

  user_id?: number | null;

  user_name?: string | null;

  created_at?: string;

}

export interface RepairQuoteItem {

  id?: number;

  description: string;

  quantity: number;

  unit_price: number;

  total?: number;

}

export interface RepairQuote {

  id: number;

  repair_id: number;

  quote_number: string;

  subtotal: number;

  labor_cost: number;

  discount: number;

  total: number;

  status: string;

  customer_comment?: string | null;

  sent_at?: string | null;

  accepted_at?: string | null;

  refused_at?: string | null;

  expires_at?: string | null;

  items?: RepairQuoteItem[];

}

export interface RepairTracking {

  repair: Repair;

  history: RepairHistory[];

  quotes: RepairQuote[];

  timeline?: any[];

}

/* =========================================================

   TYPES DE RÉPARATION

========================================================= */

export async function getRepairTypes(): Promise<

  RepairType[]

> {

  const response = await apiFetch<any>(

    "/repair-types",

  );

  return (

    response?.data ??

    response?.types ??

    response ??

    []

  );

}

export async function getRepairType(

  id: number,

) {

  return apiFetch<any>(

    `/repair-types/${id}`,

  );

}

export async function createRepairType(

  data: {

    name: string;

    name_ar?: string;

    description?: string;

    pricing_mode?: string;

    base_price?: number;

    active?: boolean;

  },

) {

  return apiFetch<any>(

    "/repair-types",

    {

      method: "POST",

      bodyJson: data,

    },

  );

}

export async function updateRepairType(

  id: number,

  data: {

    name?: string;

    name_ar?: string;

    description?: string;

    pricing_mode?: string;

    base_price?: number;

    active?: boolean;

  },

) {

  return apiFetch<any>(

    `/repair-types/${id}`,

    {

      method: "PUT",

      bodyJson: data,

    },

  );

}

export async function deleteRepairType(

  id: number,

) {

  return apiFetch<any>(

    `/repair-types/${id}`,

    {

      method: "DELETE",

    },

  );

}

/* =========================================================

   CLIENT

   CRÉER UNE DEMANDE DE RÉPARATION

========================================================= */

export async function createRepair(
  data: {
    customer_name: string;
    customer_email?: string;
    customer_phone: string;
    device: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    repair_type_id?: number | null;
    problem: string;
    description?: string;
    customer_note?: string;
  },
) {
  const payload = {
    ...data,
    customer_name: String(data.customer_name ?? "").trim(),
    customer_phone: String(data.customer_phone ?? "").trim(),
    device: String(data.device ?? "").trim(),
    problem: String(data.problem ?? "").trim(),
    customer_email: data.customer_email?.trim() || undefined,
    brand: data.brand?.trim() || undefined,
    model: data.model?.trim() || undefined,
    serial_number: data.serial_number?.trim() || undefined,
    description: data.description?.trim() || undefined,
    customer_note: data.customer_note?.trim() || undefined,
  };

  if (!payload.customer_name || !payload.customer_phone || !payload.device || !payload.problem) {
    throw new Error("Le nom, le téléphone, l'appareil et le type de panne sont obligatoires.");
  }

  // Route backend attendue : POST /api/reparations
  return apiFetch<any>("/reparations", {
    method: "POST",
    bodyJson: payload,
  });
}

/* =========================================================

   TRACKING CLIENT

========================================================= */

export async function getRepairTracking(
  ticket: string,
): Promise<RepairTracking & { success?: boolean; message?: string }> {
  const normalizedTicket = String(ticket ?? "").trim();
  if (!normalizedTicket) {
    throw new Error("Veuillez saisir une référence de réparation.");
  }

  // Le backend renvoie habituellement { success: true, data: { repair, history, quotes } }.
  const response = await apiFetch<any>(
    `/reparations/tracking/${encodeURIComponent(normalizedTicket)}`,
    { method: "GET" },
  );

  if (response?.success === false) {
    throw new Error(response?.message || "Aucune réparation trouvée avec cette référence.");
  }

  const data = response?.data ?? response;
  const repair = data?.repair ?? response?.repair ?? data;

  if (!repair || typeof repair !== "object" || (!repair.ticket_number && !repair.id)) {
    throw new Error("La réponse du serveur ne contient pas les informations de réparation attendues.");
  }

  // Renvoie une forme stable : repair, history et quotes sont toujours accessibles.
  return {
    ...response,
    ...data,
    repair,
    history: data?.history ?? response?.history ?? [],
    quotes: data?.quotes ?? response?.quotes ?? [],
  } as RepairTracking & { success?: boolean; message?: string };
}

/* =========================================================

   ADMIN — LISTE

========================================================= */

export async function getRepairs(

  params?: {

    status?: string;

    search?: string;

    technician_id?: number | string;

    page?: number;

    limit?: number;

  },

) {

  const searchParams =

    new URLSearchParams();

  if (params?.status) {

    searchParams.set(

      "status",

      params.status,

    );

  }

  if (params?.search) {

    searchParams.set(

      "search",

      params.search,

    );

  }

  if (params?.technician_id) {

    searchParams.set(

      "technician_id",

      String(

        params.technician_id,

      ),

    );

  }

  if (params?.page) {

    searchParams.set(

      "page",

      String(params.page),

    );

  }

  if (params?.limit) {

    searchParams.set(

      "limit",

      String(params.limit),

    );

  }

  const query =

    searchParams.toString();

  return apiFetch<any>(

    `/reparations${

      query

        ? `?${query}`

        : ""

    }`,

  );

}

/* =========================================================

   ADMIN — RECHERCHE PAR TICKET

========================================================= */

export async function getRepairByTicket(

  ticket: string,

) {

  const response =

    await apiFetch<any>(

      `/reparations/tracking/${encodeURIComponent(

        ticket,

      )}`,

    );

  return (

    response?.data ??

    response

  );

}

/* =========================================================

   ADMIN — DÉTAIL PAR ID

   L'ID reste interne à l'API.

   L'URL FRONTEND utilise ?ticket=

========================================================= */

export async function getRepair(

  id: number,

) {

  return apiFetch<any>(

    `/reparations/${id}`,

  );

}

/* =========================================================

   ADMIN — MODIFIER

========================================================= */

export async function updateRepair(

  id: number,

  data: Record<

    string,

    any

  >,

) {

  return apiFetch<any>(

    `/reparations/${id}`,

    {

      method: "PUT",

      bodyJson: data,

    },

  );

}

/* =========================================================

   STATUT

========================================================= */

export async function updateRepairStatus(

  id: number,

  status: RepairStatus | string,

  comment?: string,

) {

  return apiFetch<any>(

    `/reparations/${id}/status`,

    {

      method: "PUT",

      bodyJson: {

        status,

        comment,

      },

    },

  );

}

/* =========================================================

   TECHNICIEN

========================================================= */

export async function assignRepairTechnician(

  id: number,

  technicianId: number,

) {

  return apiFetch<any>(

    `/reparations/${id}/technician`,

    {

      method: "PUT",

      bodyJson: {

        technician_id:

          technicianId,

      },

    },

  );

}

/* =========================================================

   DIAGNOSTIC

========================================================= */

export async function addRepairDiagnosis(

  id: number,

  data: {

    diagnosis: string;

    estimated_price?: number;

  },

) {

  return apiFetch<any>(

    `/reparations/${id}/diagnostic`,

    {

      method: "PUT",

      bodyJson: data,

    },

  );

}

/* =========================================================

   NOTE ADMIN

========================================================= */

export async function updateRepairNote(

  id: number,

  note: string,

) {

  return apiFetch<any>(

    `/reparations/${id}/note`,

    {

      method: "PUT",

      bodyJson: {

        admin_note: note,

      },

    },

  );

}

/* =========================================================

   APPAREIL REÇU

========================================================= */

export async function markRepairReceived(

  id: number,

) {

  return updateRepairStatus(

    id,

    "APPAREIL_RECU",

  );

}

/* =========================================================

   COMMENCER RÉPARATION

========================================================= */

export async function startRepair(

  id: number,

) {

  return updateRepairStatus(

    id,

    "EN_REPARATION",

  );

}

/* =========================================================

   TERMINER RÉPARATION

========================================================= */

export async function finishRepair(

  id: number,

) {

  return updateRepairStatus(

    id,

    "REPARATION_TERMINEE",

  );

}

/* =========================================================

   PRÊT À RÉCUPÉRER

========================================================= */

export async function markRepairReady(

  id: number,

) {

  return updateRepairStatus(

    id,

    "PRET_A_RECUPERER",

  );

}

/* =========================================================

   RÉCUPÉRÉ

========================================================= */

export async function markRepairRecovered(

  id: number,

) {

  return updateRepairStatus(

    id,

    "RECUPERE",

  );

}

/* =========================================================

   DEVIS

========================================================= */

export async function createRepairQuote(

  id: number,

  data: {

    items: RepairQuoteItem[];

    labor_cost?: number;

    discount?: number;

    customer_comment?: string;

    expires_at?: string;

  },

) {

  return apiFetch<any>(

    `/reparations/${id}/devis`,

    {

      method: "POST",

      bodyJson: data,

    },

  );

}

/* =========================================================

   ENVOYER LE DEVIS

========================================================= */

export async function sendRepairQuote(

  id: number,

) {

  return apiFetch<any>(

    `/reparations/${id}/devis/send`,

    {

      method: "POST",

    },

  );

}

/* =========================================================

   CLIENT — ACCEPTER DEVIS

========================================================= */

export async function acceptRepairQuote(

  id: number,

) {

  return apiFetch<any>(

    `/reparations/${id}/devis/accept`,

    {

      method: "POST",

    },

  );

}

/* =========================================================

   CLIENT — REFUSER DEVIS

========================================================= */

export async function refuseRepairQuote(

  id: number,

  comment?: string,

) {

  return apiFetch<any>(

    `/reparations/${id}/devis/refuse`,

    {

      method: "POST",

      bodyJson: {

        customer_comment:

          comment,

      },

    },

  );

}

/* =========================================================

   DEVIS PAR TICKET

========================================================= */

export async function getRepairQuoteByTicket(

  ticket: string,

) {

  return apiFetch<any>(

    `/reparations/tracking/${encodeURIComponent(

      ticket,

    )}/devis`,

  );

}

/* =========================================================

   HISTORIQUE

========================================================= */

export async function getRepairHistory(

  id: number,

) {

  return apiFetch<any>(

    `/reparations/${id}/history`,

  );

}

/* =========================================================

   DASHBOARD

========================================================= */

export async function getRepairDashboardStats() {

  return apiFetch<any>(

    "/reparations/dashboard/stats",

  );

}

/* =========================================================

   TECHNICIENS

========================================================= */

export async function getRepairTechnicians() {

  return apiFetch<any>(

    "/reparations/technicians",

  );

}

/* =========================================================

   SUPPRIMER / ANNULER

========================================================= */

export async function cancelRepair(

  id: number,

  reason?: string,

) {

  return updateRepairStatus(

    id,

    "ANNULE",

    reason,

  );

}