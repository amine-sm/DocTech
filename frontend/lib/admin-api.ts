import { apiFetch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type AdminListResponse<T = Record<string, unknown>> = {
  data: T[];
  pagination?: AdminPagination;
};

export type ListResult<T = Record<string, unknown>> = {
  rows: T[];
  pagination?: AdminPagination;
};

/* =========================================================
   HELPERS
========================================================= */

function normalizePagination(
  pagination: unknown,
): AdminPagination | undefined {
  if (!pagination || typeof pagination !== "object") {
    return undefined;
  }

  const value = pagination as Record<string, unknown>;

  return {
    page: Number(value.page ?? 1),
    limit: Number(value.limit ?? 20),
    total: Number(value.total ?? 0),
    pages: Number(value.pages ?? 1),
  };
}

/* =========================================================
   LIST
========================================================= */

export async function adminList<
  T = Record<string, unknown>,
>(
  endpoint: string,
  query = "",
): Promise<ListResult<T>> {
  const response = await apiFetch<
    AdminListResponse<T> | T[]
  >(`${endpoint}${query}`);

  /*
   * Cas où l'API retourne directement un tableau :
   *
   * [
   *   {...},
   *   {...}
   * ]
   */
  if (Array.isArray(response)) {
    return {
      rows: response,
      pagination: undefined,
    };
  }

  /*
   * Cas normal :
   *
   * {
   *   data: [...],
   *   pagination: {...}
   * }
   */
  return {
    rows: Array.isArray(response.data)
      ? response.data
      : [],
    pagination: normalizePagination(
      response.pagination,
    ),
  };
}

/* =========================================================
   GET
========================================================= */

export async function adminGet<
  T = Record<string, unknown>,
>(
  endpoint: string,
  id: number | string,
): Promise<T> {
  const response = await apiFetch<
    | T
    | {
        data: T;
      }
  >(`${endpoint}/${id}`);

  /*
   * API wrapper :
   *
   * {
   *   data: {...}
   * }
   */
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as { data: T }).data;
  }

  /*
   * API qui retourne directement l'objet.
   */
  return response as T;
}

/* =========================================================
   CREATE
========================================================= */

export async function adminCreate<
  T = unknown,
>(
  endpoint: string,
  payload: unknown,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "POST",
    bodyJson: payload,
  });
}

/* =========================================================
   UPDATE
========================================================= */

export async function adminUpdate<
  T = unknown,
>(
  endpoint: string,
  id: number | string,
  payload: unknown,
  method: "PUT" | "PATCH" = "PUT",
): Promise<T> {
  return apiFetch<T>(
    `${endpoint}/${id}`,
    {
      method,
      bodyJson: payload,
    },
  );
}

/* =========================================================
   DELETE
========================================================= */

export async function adminDelete<
  T = unknown,
>(
  endpoint: string,
  id: number | string,
): Promise<T> {
  return apiFetch<T>(
    `${endpoint}/${id}`,
    {
      method: "DELETE",
    },
  );
}