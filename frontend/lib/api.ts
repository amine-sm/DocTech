const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

export type ApiResponse<T = unknown> = { ok: boolean; data?: T; user?: T; message?: string; pagination?: { page: number; limit: number; total: number; pages: number }; [key: string]: unknown };

export class ApiError extends Error { status: number; data?: unknown; constructor(message: string, status = 500, data?: unknown) { super(message); this.name = "ApiError"; this.status = status; this.data = data; } }

export function backendUrl(path?: string | null) {
  if (!path) return "/images/categories/pc-portable.png";
  if (/^https?:\/\//i.test(path) || path.startsWith("/images/")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit & { bodyJson?: unknown } = {}): Promise<ApiResponse<T>> {
  const { bodyJson, headers, ...rest } = options;
  const response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...rest,
    credentials: "include",
    headers: { ...(bodyJson !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
    body: bodyJson !== undefined ? JSON.stringify(bodyJson) : options.body,
  });
  const text = await response.text();
  let payload: ApiResponse<T> = { ok: response.ok };
  if (text) { try { payload = JSON.parse(text); } catch { payload = { ok: response.ok, message: text }; } }
  if (!response.ok) throw new ApiError(payload.message || `Erreur HTTP ${response.status}`, response.status, payload);
  return payload;
}

export async function uploadImage(file: File) {
  const form = new FormData(); form.append("image", file);
  const result = await apiFetch<{ url: string }>("/uploads/image", { method: "POST", body: form });
  return result.data;
}
