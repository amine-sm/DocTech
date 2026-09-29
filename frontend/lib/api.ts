// lib/api.ts

// ============================================================
// CONFIGURATION BACKEND
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backenddoctech.aladinnutritiondz.com/api";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://backenddoctech.aladinnutritiondz.com";


// ============================================================
// LOG CONFIGURATION
// ============================================================

if (typeof window !== "undefined") {
  console.log("[API] API_URL:", API_URL);
  console.log("[API] BACKEND_URL:", BACKEND_URL);
}


// ============================================================
// NORMALISATION URL BACKEND
// ============================================================

/**
 * Construit une URL complète pour les fichiers/images du backend.
 *
 * Backend :
 *
 * API REST :
 * https://backenddoctech.aladinnutritiondz.com/api
 *
 * Images :
 * https://backenddoctech.aladinnutritiondz.com/api/uploads-file/xxx.jpg
 *
 * Exemples :
 *
 * /uploads/test.jpg
 * =>
 * https://backenddoctech.aladinnutritiondz.com/api/uploads-file/test.jpg
 *
 * uploads/test.jpg
 * =>
 * https://backenddoctech.aladinnutritiondz.com/api/uploads-file/test.jpg
 *
 * http://localhost:4000/uploads/test.jpg
 * =>
 * https://backenddoctech.aladinnutritiondz.com/api/uploads-file/test.jpg
 *
 * http://localhost:4000/api/uploads-file/test.jpg
 * =>
 * https://backenddoctech.aladinnutritiondz.com/api/uploads-file/test.jpg
 */
export function backendUrl(path?: string | null): string {
  if (!path) return "";

  let value = String(path).trim();

  if (!value) return "";

  // ==========================================================
  // DATA / BLOB
  // ==========================================================

  if (
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  const backendOrigin = BACKEND_URL.replace(/\/+$/, "");
  const uploadBase = `${backendOrigin}/api/uploads-file`;

  // ==========================================================
  // ANCIENNES URL LOCALHOST
  // ==========================================================

  value = value.replace(
    /^https?:\/\/localhost:4000/i,
    ""
  );

  value = value.replace(
    /^https?:\/\/127\.0\.0\.1:4000/i,
    ""
  );

  // ==========================================================
  // URL PRODUCTION DÉJÀ CORRECTE
  // ==========================================================

  if (
    value.startsWith(`${uploadBase}/`)
  ) {
    return value;
  }

  // ==========================================================
  // /api/uploads-file/xxx
  // ==========================================================

  if (
    value.startsWith("/api/uploads-file/")
  ) {
    return `${backendOrigin}${value}`;
  }

  // ==========================================================
  // /uploads-file/xxx
  // ==========================================================

  if (
    value.startsWith("/uploads-file/")
  ) {
    return `${backendOrigin}/api${value}`;
  }

  // ==========================================================
  // /uploads/xxx
  // ==========================================================

  if (
    value.startsWith("/uploads/")
  ) {
    const fileName = value.replace(
      /^\/uploads\//,
      ""
    );

    return `${uploadBase}/${fileName}`;
  }

  // ==========================================================
  // uploads/xxx
  // ==========================================================

  if (
    value.startsWith("uploads/")
  ) {
    const fileName = value.replace(
      /^uploads\//,
      ""
    );

    return `${uploadBase}/${fileName}`;
  }

  // ==========================================================
  // URL ABSOLUE
  // ==========================================================

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    try {
      const url = new URL(value);

      // Ancienne URL :
      // https://backend.../uploads/image.jpg
      // => https://backend.../api/uploads-file/image.jpg
      const match = url.pathname.match(
        /\/uploads\/(.+)$/i
      );

      if (match?.[1]) {
        return `${uploadBase}/${match[1]}`;
      }

      // Ancienne URL localhost qui aurait encore
      // été conservée après le nettoyage ci-dessus.
      if (
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1"
      ) {
        const localMatch = url.pathname.match(
          /\/(?:api\/)?uploads(?:-file)?\/(.+)$/i
        );

        if (localMatch?.[1]) {
          return `${uploadBase}/${localMatch[1]}`;
        }
      }

      return value;
    } catch {
      return value;
    }
  }

  // ==========================================================
  // /api/...
  // ==========================================================

  if (value.startsWith("/api/")) {
    return `${backendOrigin}${value}`;
  }

  // ==========================================================
  // AUTRE URL RELATIVE
  //
  // Pour une image stockée comme simple nom :
  // photo.jpg
  // => /api/uploads-file/photo.jpg
  // ==========================================================

  const cleanPath = value.replace(/^\/+/, "");

  if (!cleanPath.startsWith("api/")) {
    return `${uploadBase}/${cleanPath}`;
  }

  return `${backendOrigin}/${cleanPath}`;
}

// ============================================================
// URL API
// ============================================================

/**
 * Construit une URL REST complète.
 *
 * Exemple :
 *
 * apiUrl("/public/articles")
 *
 * =>
 *
 * https://backenddoctech.aladinnutritiondz.com/api/public/articles
 */
export function apiUrl(
  path: string
): string {

  if (!path) {
    return API_URL;
  }


  // URL déjà absolue
  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {

    return path;
  }


  const cleanBase =
    API_URL.replace(
      /\/+$/,
      ""
    );

  const cleanPath =
    path.startsWith("/")
      ? path
      : `/${path}`;


  return `${cleanBase}${cleanPath}`;
}


// ============================================================
// OPTIONS API FETCH
// ============================================================

type ApiFetchOptions =
  RequestInit & {
    bodyJson?: unknown;
  };


// ============================================================
// RÉCUPÉRATION JWT
// ============================================================

function getStoredToken(): string | null {

  if (
    typeof window === "undefined"
  ) {

    return null;
  }


  return (
    sessionStorage.getItem(
      "doctech_access_token"
    ) ||
    localStorage.getItem(
      "doctech_access_token"
    )
  );
}


// ============================================================
// API FETCH PRINCIPALE
// ============================================================

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {

  const {
    bodyJson,
    headers: customHeaders,
    ...fetchOptions
  } = options;


  // ==========================================================
  // HEADERS
  // ==========================================================

  const headers =
    new Headers(
      customHeaders
    );

  headers.set(
    "Accept",
    "application/json"
  );


  // ==========================================================
  // JSON
  // ==========================================================

  if (
    bodyJson !== undefined
  ) {

    headers.set(
      "Content-Type",
      "application/json"
    );
  }


  // ==========================================================
  // JWT
  // ==========================================================

  const token =
    getStoredToken();

  if (token) {

    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }


  // ==========================================================
  // FORMDATA
  // ==========================================================

  if (
    typeof FormData !== "undefined" &&
    fetchOptions.body instanceof FormData
  ) {

    // Important :
    // Ne pas définir Content-Type manuellement.
    //
    // Le navigateur doit ajouter :
    //
    // multipart/form-data; boundary=...
    //

    headers.delete(
      "Content-Type"
    );
  }


  // ==========================================================
  // URL
  // ==========================================================

  const url =
    apiUrl(path);


  if (
    typeof window !== "undefined"
  ) {

    console.log(
      "[API REQUEST]",
      url
    );
  }


  // ==========================================================
  // FETCH
  // ==========================================================

  const response =
    await fetch(
      url,
      {
        ...fetchOptions,

        credentials:
          "include",

        headers,

        body:
          bodyJson !== undefined
            ? JSON.stringify(
                bodyJson
              )
            : fetchOptions.body,
      }
    );


  // ==========================================================
  // RESPONSE
  // ==========================================================

  let data: any = null;


  try {

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    if (
      contentType.includes(
        "application/json"
      )
    ) {

      data =
        await response.json();

    } else {

      const text =
        await response.text();


      if (text) {

        try {

          data =
            JSON.parse(
              text
            );

        } catch {

          data = text;
        }
      }
    }

  } catch {

    data = null;
  }


  // ==========================================================
  // ERREUR API
  // ==========================================================

  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.error ||
      `Erreur API ${response.status}`
    );
  }


  // ==========================================================
  // RETURN
  // ==========================================================

  return data as T;
}


// ============================================================
// GET
// ============================================================

export async function apiGet<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {

  return apiFetch<T>(
    path,
    {
      ...options,
      method: "GET",
    }
  );
}


// ============================================================
// POST
// ============================================================

export async function apiPost<T = any>(
  path: string,
  body?: unknown,
  options: ApiFetchOptions = {}
): Promise<T> {

  // ----------------------------------------------------------
  // FORMDATA
  // ----------------------------------------------------------

  if (
    typeof FormData !== "undefined" &&
    body instanceof FormData
  ) {

    return apiFetch<T>(
      path,
      {
        ...options,
        method: "POST",
        body,
      }
    );
  }


  // ----------------------------------------------------------
  // JSON
  // ----------------------------------------------------------

  return apiFetch<T>(
    path,
    {
      ...options,
      method: "POST",
      bodyJson: body,
    }
  );
}


// ============================================================
// PUT
// ============================================================

export async function apiPut<T = any>(
  path: string,
  body?: unknown,
  options: ApiFetchOptions = {}
): Promise<T> {

  // ----------------------------------------------------------
  // FORMDATA
  // ----------------------------------------------------------

  if (
    typeof FormData !== "undefined" &&
    body instanceof FormData
  ) {

    return apiFetch<T>(
      path,
      {
        ...options,
        method: "PUT",
        body,
      }
    );
  }


  // ----------------------------------------------------------
  // JSON
  // ----------------------------------------------------------

  return apiFetch<T>(
    path,
    {
      ...options,
      method: "PUT",
      bodyJson: body,
    }
  );
}


// ============================================================
// PATCH
// ============================================================

export async function apiPatch<T = any>(
  path: string,
  body?: unknown,
  options: ApiFetchOptions = {}
): Promise<T> {

  // ----------------------------------------------------------
  // FORMDATA
  // ----------------------------------------------------------

  if (
    typeof FormData !== "undefined" &&
    body instanceof FormData
  ) {

    return apiFetch<T>(
      path,
      {
        ...options,
        method: "PATCH",
        body,
      }
    );
  }


  // ----------------------------------------------------------
  // JSON
  // ----------------------------------------------------------

  return apiFetch<T>(
    path,
    {
      ...options,
      method: "PATCH",
      bodyJson: body,
    }
  );
}


// ============================================================
// DELETE
// ============================================================

export async function apiDelete<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {

  return apiFetch<T>(
    path,
    {
      ...options,
      method: "DELETE",
    }
  );
}


// ============================================================
// UPLOAD IMAGE
// ============================================================

/**
 * Upload d'une image.
 *
 * Backend :
 *
 * POST /api/uploads/image
 *
 * Le fichier est ensuite servi par :
 *
 * GET /api/uploads-file/:filename
 */
export async function uploadImage(
  file: File,
  fieldName = "image"
): Promise<string> {

  if (!file) {

    throw new Error(
      "Aucune image sélectionnée."
    );
  }


  // ==========================================================
  // FORMDATA
  // ==========================================================

  const formData =
    new FormData();

  formData.append(
    fieldName,
    file
  );


  // ==========================================================
  // TOKEN
  // ==========================================================

  const token =
    getStoredToken();


  // ==========================================================
  // HEADERS
  // ==========================================================

  const headers =
    new Headers();

  headers.set(
    "Accept",
    "application/json"
  );


  if (token) {

    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }


  // ==========================================================
  // REQUEST
  // ==========================================================

  const response =
    await fetch(
      apiUrl(
        "/uploads/image"
      ),
      {
        method: "POST",

        credentials:
          "include",

        headers,

        body:
          formData,
      }
    );


  // ==========================================================
  // RESPONSE
  // ==========================================================

  let data: any = null;


  try {

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    if (
      contentType.includes(
        "application/json"
      )
    ) {

      data =
        await response.json();

    } else {

      const text =
        await response.text();


      if (text) {

        try {

          data =
            JSON.parse(
              text
            );

        } catch {

          data = text;
        }
      }
    }

  } catch {

    data = null;
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.error ||
      `Erreur upload ${response.status}`
    );
  }


  // ==========================================================
  // URL IMAGE
  // ==========================================================

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


  // ==========================================================
  // NORMALISATION
  // ==========================================================

  return backendUrl(
    String(imagePath)
  );
}


// ============================================================
// UPLOAD MULTIPLE IMAGES
// ============================================================

export async function uploadImages(
  files: File[],
  fieldName = "images"
): Promise<string[]> {

  if (
    !files ||
    files.length === 0
  ) {

    return [];
  }


  // ==========================================================
  // FORMDATA
  // ==========================================================

  const formData =
    new FormData();


  for (
    const file of files
  ) {

    formData.append(
      fieldName,
      file
    );
  }


  // ==========================================================
  // TOKEN
  // ==========================================================

  const token =
    getStoredToken();


  // ==========================================================
  // HEADERS
  // ==========================================================

  const headers =
    new Headers();

  headers.set(
    "Accept",
    "application/json"
  );


  if (token) {

    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }


  // ==========================================================
  // REQUEST
  // ==========================================================

  const response =
    await fetch(
      apiUrl(
        "/upload"
      ),
      {
        method: "POST",

        credentials:
          "include",

        headers,

        body:
          formData,
      }
    );


  // ==========================================================
  // RESPONSE
  // ==========================================================

  let data: any = null;


  try {

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    if (
      contentType.includes(
        "application/json"
      )
    ) {

      data =
        await response.json();

    } else {

      const text =
        await response.text();


      if (text) {

        try {

          data =
            JSON.parse(
              text
            );

        } catch {

          data = text;
        }
      }
    }

  } catch {

    data = null;
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.error ||
      `Erreur upload ${response.status}`
    );
  }


  // ==========================================================
  // IMAGES
  // ==========================================================

  const images =
    data?.urls ||
    data?.images ||
    data?.files ||
    data?.data ||
    [];


  if (
    !Array.isArray(images)
  ) {

    throw new Error(
      "Le serveur n'a pas retourné une liste d'images valide."
    );
  }


  // ==========================================================
  // NORMALISATION DES IMAGES
  // ==========================================================

  return images
    .map(
      (item: any) => {

        const value =
          typeof item === "string"
            ? item
            : item?.url ||
              item?.imageUrl ||
              item?.path;


        if (!value) {
          return null;
        }


        return backendUrl(
          String(value)
        );
      }
    )
    .filter(
      Boolean
    ) as string[];
}


// ============================================================
// IMAGE URL
// ============================================================

/**
 * Utiliser cette fonction dans ProductCard,
 * listes, détails produits, etc.
 *
 * Exemple :
 *
 * imageUrl("/uploads/photo.jpg")
 *
 * =>
 *
 * https://backenddoctech.aladinnutritiondz.com/api/uploads-file/photo.jpg
 */
export function imageUrl(
  value?: string | null
): string {

  if (!value) {
    return "";
  }

  return backendUrl(
    value
  );
}


// ============================================================
// ABSOLUTE URL
// ============================================================

export function isAbsoluteUrl(
  value: string
): boolean {

  return (
    value.startsWith(
      "http://"
    ) ||
    value.startsWith(
      "https://"
    )
  );
}


// ============================================================
// UNWRAP API RESPONSE
// ============================================================

/**
 * Si l'API retourne :
 *
 * {
 *   data: [...]
 * }
 *
 * retourne [...]
 *
 * Sinon retourne directement
 * la réponse.
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