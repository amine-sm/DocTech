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
   NORMALIZE PERMISSIONS
========================================================= */

function normalizePermissions(
  raw: any,
): SessionPermission[] {
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
    id: Number(
      raw?.role?.id ??
        raw?.role_id ??
        0,
    ),

    code: String(
      raw?.role?.code ??
        raw?.role_code ??
        "",
    ),

    name: String(
      raw?.role?.name ??
        raw?.role_name ??
        "",
    ),

    permissions,
  };

  return {
    id: Number(raw?.id ?? 0),

    code: String(
      raw?.code ?? "",
    ),

    firstName: String(
      raw?.firstName ??
        raw?.first_name ??
        "",
    ),

    lastName: String(
      raw?.lastName ??
        raw?.last_name ??
        "",
    ),

    email: String(
      raw?.email ?? "",
    ),

    phone:
      raw?.phone ??
      null,

    status: String(
      raw?.status ?? "",
    ),

    role,

    permissions,
  };
}

/* =========================================================
   TOKEN
========================================================= */

const TOKEN_KEY =
  "doctech_access_token";

/* =========================================================
   SAVE TOKEN
========================================================= */

function saveToken(
  token: string,
  rememberMe: boolean,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  sessionStorage.removeItem(
    TOKEN_KEY,
  );

  localStorage.removeItem(
    TOKEN_KEY,
  );

  if (rememberMe) {
    localStorage.setItem(
      TOKEN_KEY,
      token,
    );
  } else {
    sessionStorage.setItem(
      TOKEN_KEY,
      token,
    );
  }
}

/* =========================================================
   GET TOKEN
========================================================= */

export function getStoredToken(): string | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return (
    sessionStorage.getItem(
      TOKEN_KEY,
    ) ||
    localStorage.getItem(
      TOKEN_KEY,
    )
  );
}

/* =========================================================
   CLEAR TOKEN
========================================================= */

export function clearStoredToken() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  sessionStorage.removeItem(
    TOKEN_KEY,
  );

  localStorage.removeItem(
    TOKEN_KEY,
  );
}

/* =========================================================
   LOGIN
========================================================= */

export async function login(
  email: string,
  password: string,
  rememberMe = false,
) {
  const response =
    await apiFetch<any>(
      "/auth/login",
      {
        method: "POST",

        bodyJson: {
          email: email.trim(),
          password,
          rememberMe,
        },
      },
    );

  if (response?.token) {
    saveToken(
      response.token,
      rememberMe,
    );
  }

  const rawUser =
    response?.user ??
    response?.data?.user ??
    response?.data ??
    {};

  return {
    ...response,

    user: normalize(
      rawUser,
    ),
  };
}

/* =========================================================
   LOGOUT
========================================================= */

export async function logout() {
  try {
    return await apiFetch(
      "/auth/logout",
      {
        method: "POST",
      },
    );
  } finally {
    clearStoredToken();
  }
}

/* =========================================================
   GET CURRENT USER
========================================================= */

export async function getMe() {
  const response =
    await apiFetch<any>(
      "/auth/me",
    );

  /**
   * Le backend retourne normalement :
   *
   * {
   *   ok: true,
   *   user: {...}
   * }
   *
   * On accepte également :
   *
   * {
   *   data: {
   *     user: {...}
   *   }
   * }
   */

  const rawUser =
    response?.user ??
    response?.data?.user ??
    response?.data ??
    {};

  const user =
    normalize(rawUser);

  /**
   * Debug temporaire.
   * Tu peux les supprimer plus tard.
   */
  console.log(
    "========== AUTH /ME ==========",
  );

  console.log(
    "Response :",
    response,
  );

  console.log(
    "User :",
    user,
  );

  console.log(
    "Role :",
    user.role,
  );

  console.log(
    "Role code :",
    user.role.code,
  );

  console.log(
    "Role name :",
    user.role.name,
  );

  console.log(
    "Permissions :",
    user.role.permissions,
  );

  console.log(
    "==============================",
  );

  return {
    ...response,
    user,
  };
}