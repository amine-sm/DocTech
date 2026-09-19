import { apiFetch } from "@/lib/api";

export type SessionUser = {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: string;
  role: {
    id: number;
    code: string;
    name: string;
  };
  permissions?: string[];
};

function normalize(raw: any): SessionUser {
  return {
    id: Number(raw?.id ?? 0),
    code: String(raw?.code ?? ""),
    firstName: String(raw?.firstName ?? raw?.first_name ?? ""),
    lastName: String(raw?.lastName ?? raw?.last_name ?? ""),
    email: String(raw?.email ?? ""),
    phone: raw?.phone ?? null,
    status: String(raw?.status ?? ""),
    role: raw?.role
      ? {
          id: Number(raw.role.id ?? 0),
          code: String(raw.role.code ?? ""),
          name: String(raw.role.name ?? ""),
        }
      : {
          id: Number(raw?.role_id ?? 0),
          code: String(raw?.role_code ?? ""),
          name: String(raw?.role_name ?? ""),
        },
    permissions: Array.isArray(raw?.permissions)
      ? raw.permissions
      : [],
  };
}

const TOKEN_KEY = "doctech_access_token";

function saveToken(token: string, rememberMe: boolean) {
  if (typeof window === "undefined") return;

  // Nettoyer les anciennes valeurs
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);

  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(TOKEN_KEY)
  );
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(
  email: string,
  password: string,
  rememberMe = false
) {
  const r = await apiFetch<any>("/auth/login", {
    method: "POST",
    bodyJson: {
      email: email.trim(),
      password,
      rememberMe,
    },
  });

  if (r?.token) {
    saveToken(r.token, rememberMe);
  }

  return {
    ...r,
    user: normalize(r?.user || r?.data || {}),
  };
}

export async function logout() {
  try {
    return await apiFetch("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearStoredToken();
  }
}

export async function getMe() {
  const r = await apiFetch<any>("/auth/me");

  return {
    ...r,
    user: normalize(r?.user || r?.data || {}),
  };
}