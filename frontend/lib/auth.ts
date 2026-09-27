// lib/auth.ts

import { apiFetch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

export type SessionPermission =
  | string
  | {
      id?: number | string;
      code?: string;
      name?: string;
      module?: string;
    };

export type SessionRole = {
  id: number;
  code: string;
  name: string;
  permissions: SessionPermission[];
};

export type SessionUser = {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: string;

  role: SessionRole;

  /**
   * Permissions disponibles directement
   * sur l'utilisateur.
   */
  permissions: SessionPermission[];
};

/* =========================================================
   TOKEN
========================================================= */

const TOKEN_KEY = "doctech_access_token";

/* =========================================================
   NORMALIZE PERMISSIONS
========================================================= */

function normalizePermissions(raw: any): SessionPermission[] {
  if (Array.isArray(raw?.role?.permissions)) {
    return raw.role.permissions;
  }

  if (Array.isArray(raw?.permissions)) {
    return raw.permissions;
  }

  return [];
}

/* =========================================================
   NORMALIZE USER
========================================================= */

function normalize(raw: any): SessionUser {
  const permissions = normalizePermissions(raw);

  const role: SessionRole = {
    id: Number(raw?.role?.id ?? raw?.role_id ?? 0),

    code: String(raw?.role?.code ?? raw?.role_code ?? ""),

    name: String(raw?.role?.name ?? raw?.role_name ?? ""),

    permissions,
  };

  return {
    id: Number(raw?.id ?? 0),

    code: String(raw?.code ?? ""),

    firstName: String(raw?.firstName ?? raw?.first_name ?? ""),

    lastName: String(raw?.lastName ?? raw?.last_name ?? ""),

    email: String(raw?.email ?? ""),

    phone: raw?.phone ?? null,

    status: String(raw?.status ?? ""),

    role,

    permissions,
  };
}

/* =========================================================
   SAVE TOKEN
========================================================= */

function saveToken(token: string, rememberMe: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  /*
   * On supprime d'abord les anciennes sessions
   * pour éviter d'avoir deux tokens différents.
   */

  sessionStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(TOKEN_KEY);

  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

/* =========================================================
   GET TOKEN
========================================================= */

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(TOKEN_KEY)
  );
}

/* =========================================================
   CLEAR TOKEN
========================================================= */

export function clearStoredToken() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(TOKEN_KEY);
}

/* =========================================================
   LOGIN
========================================================= */

export async function login(
  email: string,
  password: string,
  rememberMe = false,
) {
  const response = await apiFetch<any>("/auth/login", {
    method: "POST",

    bodyJson: {
      email: email.trim(),
      password,
      rememberMe,
    },
  });

  console.log("==========================================");

  console.log("             AUTH LOGIN");

  console.log("==========================================");

  console.log("[AUTH] LOGIN RESPONSE :", response);

  /* =======================================================
     RÉCUPÉRATION ROBUSTE DU TOKEN
  ======================================================= */

  const token =
    response?.token ??
    response?.data?.token ??
    response?.accessToken ??
    response?.data?.accessToken ??
    response?.data?.data?.token ??
    null;

  console.log("[AUTH] TOKEN REÇU :", token ? "OUI" : "NON");

  /*
   * Si le backend ne retourne aucun token,
   * on arrête ici.
   */

  if (!token) {
    console.error("[AUTH] Aucun token JWT retourné par le serveur.");

    throw new Error(
      "Connexion réussie mais aucun token JWT n'a été retourné par le serveur.",
    );
  }

  /* =======================================================
     SAUVEGARDE TOKEN
  ======================================================= */

  saveToken(String(token), rememberMe);

  console.log(
    "[AUTH] TOKEN SAUVEGARDÉ :",
    getStoredToken() ? "OUI" : "NON",
  );

  /* =======================================================
     RÉCUPÉRATION UTILISATEUR
  ======================================================= */

  const rawUser =
    response?.user ??
    response?.data?.user ??
    response?.data?.data?.user ??
    {};

  const user = normalize(rawUser);

  console.log("[AUTH] USER :", user);

  console.log("[AUTH] ROLE :", user.role);

  console.log("[AUTH] ROLE CODE :", user.role.code);

  console.log("[AUTH] ROLE NAME :", user.role.name);

  console.log("[AUTH] PERMISSIONS :", user.role.permissions);

  console.log("==========================================");

  return {
    ...response,

    /*
     * On retourne toujours le token
     * à la racine pour simplifier son utilisation
     * dans la page de connexion.
     */

    token,

    user,
  };
}

/* =========================================================
   LOGOUT
========================================================= */

export async function logout() {
  try {
    /*
     * On essaye d'informer le backend.
     */

    return await apiFetch("/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    /*
     * Même si le backend refuse le logout
     * parce que le token est déjà expiré,
     * on supprime quand même le token local.
     */

    console.error("[AUTH] Erreur logout :", error);

    throw error;
  } finally {
    clearStoredToken();
  }
}

/* =========================================================
   GET CURRENT USER
========================================================= */

export async function getMe() {
  console.log("==========================================");

  console.log("             AUTH /ME");

  console.log("==========================================");

  /* =======================================================
     VÉRIFICATION TOKEN LOCAL
  ======================================================= */

  const token = getStoredToken();

  console.log("[AUTH] TOKEN PRÉSENT :", token ? "OUI" : "NON");

  /*
   * Aucun token = utilisateur non connecté.
   *
   * On retourne null au lieu de throw pour que les
   * appelants (comme AdminShell) puissent gérer
   * proprement le cas "non authentifié" sans
   * polluer la console avec une erreur.
   */

  if (!token) {
    console.warn(
      "[AUTH] Aucun token trouvé dans localStorage/sessionStorage.",
    );

    return null;
  }

  /* =======================================================
     APPEL BACKEND
  ======================================================= */

  let response: any;

  try {
    response = await apiFetch<any>("/auth/me", {
      method: "GET",
    });
  } catch (error) {
    /*
     * Token expiré / invalide → on nettoie et
     * on retourne null (pas de throw).
     */

    console.warn("[AUTH] /auth/me a échoué :", error);

    clearStoredToken();

    return null;
  }

  console.log("[AUTH] /auth/me RESPONSE :", response);

  /* =======================================================
     RÉCUPÉRATION USER
  ======================================================= */

  const rawUser =
    response?.user ??
    response?.data?.user ??
    response?.data?.data?.user ??
    response?.data ??
    {};

  /* =======================================================
     VÉRIFICATION USER
  ======================================================= */

  if (!rawUser || !rawUser.id) {
    console.warn("[AUTH] Utilisateur authentifié introuvable.");

    return null;
  }

  /* =======================================================
     NORMALISATION
  ======================================================= */

  const user = normalize(rawUser);

  /* =======================================================
     DEBUG
  ======================================================= */

  console.log("[AUTH] USER :", user);

  console.log("[AUTH] USER ID :", user.id);

  console.log("[AUTH] USER CODE :", user.code);

  console.log("[AUTH] USER EMAIL :", user.email);

  console.log("[AUTH] ROLE :", user.role);

  console.log("[AUTH] ROLE ID :", user.role.id);

  console.log("[AUTH] ROLE CODE :", user.role.code);

  console.log("[AUTH] ROLE NAME :", user.role.name);

  console.log("[AUTH] PERMISSIONS :", user.role.permissions);

  console.log("==========================================");

  /* =======================================================
     RETOUR
  ======================================================= */

  return {
    ...response,
    user,
  };
}