
// lib/api.ts

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

/**
 * URL de base du backend sans /api final.
 *
 * Exemple :
 * API_URL = http://localhost:4000/api
 *
 * backendUrl("/uploads/test.jpg")
 * =>
 * http://localhost:4000/uploads/test.jpg
 */
export function backendUrl(path?: string | null): string {
  if (!path) return "";

  let cleanPath = path;

  // 1. Nettoyer si l'URL contient localhost
  if (cleanPath.includes("localhost:4000") || cleanPath.includes("127.0.0.1:4000")) {
    cleanPath = cleanPath.replace(/https?:\/\/(localhost|127\.0\.0\.1):4000/, "");
  }

  if (
    cleanPath.startsWith("data:") ||
    cleanPath.startsWith("blob:")
  ) {
    return cleanPath;
  }

  const backendBase = API_URL.replace(/\/api\/?$/, "");

  // 2. Si l'URL est déjà une URL absolue externe (ou déjà avec /api/uploads-file)
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    // Si c'est notre propre domaine mais avec /uploads/ au lieu de /api/uploads-file/
    if (cleanPath.includes("/uploads/") && !cleanPath.includes("/api/uploads-file/")) {
      return cleanPath.replace("/uploads/", "/api/uploads-file/");
    }
    return cleanPath;
  }

  const formattedPath = cleanPath.startsWith("/")
    ? cleanPath
    : `/${cleanPath}`;

  // 3. Redirection des chemins /uploads/ vers /api/uploads-file/ pour cPanel
  if (formattedPath.startsWith("/uploads/")) {
    const relativePart = formattedPath.replace("/uploads/", "");
    return `${backendBase}/api/uploads-file/${relativePart}`;
  }

  return `${backendBase}${formattedPath}`;
}
/**
 * URL complète de l'API.
 *
 * Exemple :
 * apiUrl("/auth/me")
 * =>
 * http://localhost:4000/api/auth/me
 */
export function apiUrl(path: string): string {
  if (!path) return API_URL;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  const cleanBase = API_URL.replace(/\/+$/, "");

  const cleanPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}

/**
 * Options personnalisées pour apiFetch.
 */
type ApiFetchOptions = RequestInit & {
  bodyJson?: unknown;
};

/**
 * Récupération du JWT stocké côté navigateur.
 */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    sessionStorage.getItem("doctech_access_token") ||
    localStorage.getItem("doctech_access_token")
  );
}

/**
 * API principale.
 *
 * Supporte :
 * - JWT Bearer
 * - Cookie HttpOnly
 * - JSON
 * - FormData
 * - GET / POST / PUT / PATCH / DELETE
 */
export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    bodyJson,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const headers = new Headers(customHeaders);

  headers.set("Accept", "application/json");

  /**
   * JSON
   */
  if (bodyJson !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  /**
   * JWT fallback.
   */
  const token = getStoredToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  /**
   * Ne pas définir Content-Type manuellement
   * pour FormData.
   */
  if (fetchOptions.body instanceof FormData) {
    headers.delete("Content-Type");
  }

  const response = await fetch(apiUrl(path), {
    ...fetchOptions,

    /**
     * Permet d'envoyer le cookie JWT HttpOnly.
     */
    credentials: "include",

    headers,

    body:
      bodyJson !== undefined
        ? JSON.stringify(bodyJson)
        : fetchOptions.body,
  });

  /**
   * Lecture de la réponse.
   */
  let data: any = null;

  try {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    }
  } catch {
    data = null;
  }

  /**
   * Gestion des erreurs.
   */
  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Erreur API ${response.status}`
    );
  }

  return data as T;
}

/**
 * GET
 */
export async function apiGet<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "GET",
  });
}

/**
 * POST
 *
 * Exemple :
 *
 * apiPost("/products", {
 *   name: "Clavier",
 *   price: 3500
 * })
 */
export async function apiPost<T = any>(
  path: string,
  body?: unknown,
  options: ApiFetchOptions = {}
): Promise<T> {
  /**
   * Si FormData, on l'envoie directement.
   */
  if (body instanceof FormData) {
    return apiFetch<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  }

  return apiFetch<T>(path, {
    ...options,
    method: "POST",
    bodyJson: body,
  });
}

/**
 * PUT
 */
export async function apiPut<T = any>(
  path: string,
  body?: unknown,
  options: ApiFetchOptions = {}
): Promise<T> {
  if (body instanceof FormData) {
    return apiFetch<T>(path, {
      ...options,
      method: "PUT",
      body,
    });
  }

  return apiFetch<T>(path, {
    ...options,
    method: "PUT",
    bodyJson: body,
  });
}

/**
 * PATCH
 */
export async function apiPatch<T = any>(
  path: string,
  body?: unknown,
  options: ApiFetchOptions = {}
): Promise<T> {
  if (body instanceof FormData) {
    return apiFetch<T>(path, {
      ...options,
      method: "PATCH",
      body,
    });
  }

  return apiFetch<T>(path, {
    ...options,
    method: "PATCH",
    bodyJson: body,
  });
}

/**
 * DELETE
 */
export async function apiDelete<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "DELETE",
  });
}

/**
 * UPLOAD IMAGE
 *
 * Backend :
 *
 * POST /api/upload
 *
 * FormData :
 * image = File
 *
 * Le backend peut retourner :
 *
 * {
 *   "url": "/uploads/image.jpg"
 * }
 *
 * ou :
 *
 * {
 *   "imageUrl": "/uploads/image.jpg"
 * }
 */
export async function uploadImage(
  file: File,
  fieldName = "image"
): Promise<string> {
  if (!file) {
    throw new Error("Aucune image sélectionnée.");
  }

  const formData = new FormData();
  formData.append(fieldName, file);

  const token = getStoredToken();

  const headers = new Headers();
  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  /**
   * IMPORTANT :
   * Ne jamais définir Content-Type manuellement
   * pour FormData.
   */
  const response = await fetch(
    apiUrl("/uploads/image"),
    {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    }
  );

  let data: any = null;

  try {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Erreur upload ${response.status}`
    );
  }

  /**
   * Backend actuel :
   *
   * {
   *   ok: true,
   *   data: {
   *     filename: "...",
   *     url: "http://localhost:4000/uploads/..."
   *   }
   * }
   */
  const imagePath =
    data?.data?.url ||
    data?.url ||
    data?.imageUrl ||
    data?.image ||
    data?.path ||
    data?.file?.url;

  if (!imagePath) {
    throw new Error(
      "L'upload a réussi mais aucune URL d'image n'a été retournée par le serveur."
    );
  }

  /**
   * URL absolue
   */
  if (
    typeof imagePath === "string" &&
    (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    )
  ) {
    return imagePath;
  }

  /**
   * URL relative
   */
  return backendUrl(String(imagePath));
}

/**
 * UPLOAD MULTIPLE IMAGES
 *
 * Backend :
 * POST /api/upload
 *
 * Plusieurs fichiers avec :
 * images[]
 */
export async function uploadImages(
  files: File[],
  fieldName = "images"
): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  const formData = new FormData();

  for (const file of files) {
    formData.append(fieldName, file);
  }

  const token = getStoredToken();

  const headers = new Headers();

  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    apiUrl("/upload"),
    {
      method: "POST",

      credentials: "include",

      headers,

      body: formData,
    }
  );

  let data: any = null;

  try {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Erreur upload ${response.status}`
    );
  }

  const images =
    data?.urls ||
    data?.images ||
    data?.files ||
    data?.data ||
    [];

  if (!Array.isArray(images)) {
    throw new Error(
      "Le serveur n'a pas retourné une liste d'images valide."
    );
  }

  return images
    .map((item: any) => {
      const value =
        typeof item === "string"
          ? item
          : item?.url ||
            item?.imageUrl ||
            item?.path;

      if (!value) return null;

      if (
        value.startsWith("http://") ||
        value.startsWith("https://")
      ) {
        return value;
      }

      return backendUrl(value);
    })
    .filter(Boolean);
}

/**
 * Convertit une URL d'image relative
 * en URL complète.
 *
 * Exemple :
 *
 * imageUrl("/uploads/test.jpg")
 *
 * =>
 * http://localhost:4000/uploads/test.jpg
 */
export function imageUrl(
  value?: string | null
): string {
  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return backendUrl(value);
}

/**
 * Vérifie si une URL est absolue.
 */
export function isAbsoluteUrl(
  value: string
): boolean {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

/**
 * Récupère data si l'API retourne :
 *
 * {
 *   data: [...]
 * }
 *
 * sinon retourne directement la réponse.
 */
export function unwrap<T = any>(
  response: any
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return response.data as T;
  }

  return response as T;
}

