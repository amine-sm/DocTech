"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Edit,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useLocale } from "@/components/LocaleProvider";
import { apiFetch } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type Permission = {
  id: number;
  code: string;
  module: string;
  name?: string | null;
  description?: string | null;
};

type Role = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  is_system?: boolean | number;
  permission_count?: number | string;
};

type RoleDetail = Role & {
  permissions?: Permission[];
};

type PermissionGroup = {
  module: string;
  permissions: Permission[];
};

type RoleForm = {
  code: string;
  name: string;
  description: string;
  permissionIds: number[];
};

/* =========================================================
   HELPERS
========================================================= */

function isTrue(value: unknown): boolean {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

function normalizePermissions(result: any): Permission[] {
  const data = result?.data ?? result;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  return [];
}

function normalizeRoles(result: any): Role[] {
  const data = result?.data ?? result;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function normalizePermission(permission: any): Permission {
  return {
    id: Number(permission.id),
    code: String(permission.code || ""),
    module: String(
      permission.module ||
        permission.code?.split(".")[0] ||
        "general",
    ),
    name: permission.name ?? null,
    description: permission.description ?? null,
  };
}

function formatModuleName(module: string): string {
  return module
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* =========================================================
   PAGE
========================================================= */

export default function RolesPage() {
  const { text, isArabic } = useLocale();

  /* =======================================================
     DATA
  ======================================================= */

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* =======================================================
     ERROR
  ======================================================= */

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     MODAL
  ======================================================= */

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  /* =======================================================
     FORM
  ======================================================= */

  const emptyForm: RoleForm = {
    code: "",
    name: "",
    description: "",
    permissionIds: [],
  };

  const [form, setForm] = useState<RoleForm>(emptyForm);

  /* =======================================================
     LOAD ROLES
  ======================================================= */

  async function loadRoles(refresh = false) {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await apiFetch<any>("/roles");

      const rows = normalizeRoles(result);

      setRoles(
        rows.map((role: any) => ({
          ...role,
          id: Number(role.id),
          permission_count: Number(
            role.permission_count ?? 0,
          ),
        })),
      );
    } catch (err: any) {
      console.error("Erreur chargement rôles:", err);

      setError(
        err?.message ||
          text(
            "Impossible de charger les rôles.",
            "تعذر تحميل الأدوار.",
          ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =======================================================
     LOAD PERMISSIONS
  ======================================================= */

  async function loadPermissions() {
    try {
      const result = await apiFetch<any>(
        "/permissions",
      );

      const rows = normalizePermissions(result).map(
        normalizePermission,
      );

      setPermissions(rows);
    } catch (err) {
      console.error(
        "Erreur chargement permissions:",
        err,
      );
    }
  }

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void Promise.all([
      loadRoles(),
      loadPermissions(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     GROUP PERMISSIONS
  ======================================================= */

  const permissionGroups = useMemo<
    PermissionGroup[]
  >(() => {
    const map = new Map<
      string,
      Permission[]
    >();

    for (const permission of permissions) {
      const module =
        permission.module || "general";

      if (!map.has(module)) {
        map.set(module, []);
      }

      map.get(module)!.push(permission);
    }

    return Array.from(map.entries())
      .map(([module, items]) => ({
        module,
        permissions: items.sort((a, b) =>
          a.code.localeCompare(b.code),
        ),
      }))
      .sort((a, b) =>
        a.module.localeCompare(b.module),
      );
  }, [permissions]);

  /* =======================================================
     FILTER ROLES
  ======================================================= */

  const filteredRoles = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return roles;
    }

    return roles.filter((role) => {
      return (
        String(role.code)
          .toLowerCase()
          .includes(value) ||
        String(role.name)
          .toLowerCase()
          .includes(value) ||
        String(role.description || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [roles, search]);

  /* =======================================================
     OPEN CREATE
  ======================================================= */

  function openCreate() {
    setEditingRole(null);
    setForm({
      ...emptyForm,
      permissionIds: [],
    });
    setFormError("");
    setFormOpen(true);
  }

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  async function openEdit(role: Role) {
    try {
      setFormError("");
      setEditingRole(role);
      setFormOpen(true);

      const result = await apiFetch<any>(
        `/roles/${role.id}`,
      );

      const detail: RoleDetail =
        result?.data ??
        result ??
        role;

      const selectedIds = Array.isArray(
        detail.permissions,
      )
        ? detail.permissions.map((permission) =>
            Number(permission.id),
          )
        : [];

      setForm({
        code: String(detail.code || ""),
        name: String(detail.name || ""),
        description: String(
          detail.description || "",
        ),
        permissionIds: selectedIds,
      });
    } catch (err: any) {
      console.error(
        "Erreur chargement rôle:",
        err,
      );

      setFormError(
        err?.message ||
          text(
            "Impossible de charger le rôle.",
            "تعذر تحميل الدور.",
          ),
      );
    }
  }

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  function closeModal() {
    if (saving) return;

    setFormOpen(false);
    setEditingRole(null);
    setForm(emptyForm);
    setFormError("");
  }

  /* =======================================================
     TOGGLE PERMISSION
  ======================================================= */

  function togglePermission(
    permissionId: number,
  ) {
    setForm((current) => {
      const exists =
        current.permissionIds.includes(
          permissionId,
        );

      return {
        ...current,
        permissionIds: exists
          ? current.permissionIds.filter(
              (id) => id !== permissionId,
            )
          : [
              ...current.permissionIds,
              permissionId,
            ],
      };
    });
  }

  /* =======================================================
     TOGGLE MODULE
  ======================================================= */

  function toggleModule(
    group: PermissionGroup,
  ) {
    const ids = group.permissions.map(
      (permission) => permission.id,
    );

    const allSelected = ids.every((id) =>
      form.permissionIds.includes(id),
    );

    setForm((current) => {
      if (allSelected) {
        return {
          ...current,
          permissionIds:
            current.permissionIds.filter(
              (id) => !ids.includes(id),
            ),
        };
      }

      return {
        ...current,
        permissionIds: Array.from(
          new Set([
            ...current.permissionIds,
            ...ids,
          ]),
        ),
      };
    });
  }

  /* =======================================================
     SELECT ALL
  ======================================================= */

  function selectAllPermissions() {
    setForm((current) => ({
      ...current,
      permissionIds: permissions.map(
        (permission) => permission.id,
      ),
    }));
  }

  /* =======================================================
     CLEAR ALL
  ======================================================= */

  function clearAllPermissions() {
    setForm((current) => ({
      ...current,
      permissionIds: [],
    }));
  }

  /* =======================================================
     SAVE ROLE
  ======================================================= */

  async function saveRole() {
    if (!form.code.trim()) {
      setFormError(
        text(
          "Le code du rôle est obligatoire.",
          "رمز الدور إجباري.",
        ),
      );
      return;
    }

    if (!form.name.trim()) {
      setFormError(
        text(
          "Le nom du rôle est obligatoire.",
          "اسم الدور إجباري.",
        ),
      );
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        code: form.code
          .trim()
          .toUpperCase(),
        name: form.name.trim(),
        description:
          form.description.trim() || null,
        permissionIds:
          form.permissionIds,
      };

      if (editingRole) {
        await apiFetch(
          `/roles/${editingRole.id}`,
          {
            method: "PUT",
            bodyJson: {
              name: payload.name,
              description:
                payload.description,
              permissionIds:
                payload.permissionIds,
            },
          },
        );
      } else {
        await apiFetch("/roles", {
          method: "POST",
          bodyJson: payload,
        });
      }

      closeModal();

      await loadRoles(true);
    } catch (err: any) {
      console.error(
        "Erreur sauvegarde rôle:",
        err,
      );

      setFormError(
        err?.message ||
          text(
            "Impossible d'enregistrer le rôle.",
            "تعذر حفظ الدور.",
          ),
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteRole(role: Role) {
    if (isTrue(role.is_system)) {
      setError(
        text(
          "Un rôle système ne peut pas être supprimé.",
          "لا يمكن حذف دور النظام.",
        ),
      );
      return;
    }

    const confirmed =
      window.confirm(
        text(
          `Voulez-vous vraiment supprimer le rôle "${role.name}" ?`,
          `هل تريد حقاً حذف الدور "${role.name}"؟`,
        ),
      );

    if (!confirmed) return;

    try {
      setDeletingId(role.id);
      setError("");

      await apiFetch(
        `/roles/${role.id}`,
        {
          method: "DELETE",
        },
      );

      await loadRoles(true);
    } catch (err: any) {
      console.error(
        "Erreur suppression rôle:",
        err,
      );

      setError(
        err?.message ||
          text(
            "Impossible de supprimer le rôle.",
            "تعذر حذف الدور.",
          ),
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-full w-full bg-slate-50"
    >
      <div className="w-full space-y-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">

        {/* HEADER */}
        <AdminPageHeader
          title={text(
            "Rôles et permissions",
            "الأدوار والصلاحيات",
          )}
          subtitle={text(
            "Créez des rôles et définissez précisément les permissions de chaque utilisateur.",
            "أنشئ الأدوار وحدد صلاحيات كل مستخدم بدقة.",
          )}
          icon={<Shield size={22} />}
        />

        {/* ACTION */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">
              {roles.length}{" "}
              {text(
                "rôles configurés",
                "أدوار مهيأة",
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-5 text-xs font-black text-white shadow-lg shadow-[#2563EB]/20 transition hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
          >
            <Plus size={17} />
            {text(
              "Nouveau rôle",
              "دور جديد",
            )}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-bold">
                {text(
                  "Une erreur est survenue",
                  "حدث خطأ",
                )}
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* SEARCH */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={text(
                "Rechercher un rôle...",
                "البحث عن دور...",
              )}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
            />
          </div>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
                {text(
                  "Gestion",
                  "الإدارة",
                )}
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-900">
                {text(
                  "Rôles utilisateurs",
                  "أدوار المستخدمين",
                )}
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadRoles(true)
              }
              disabled={refreshing}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {text(
                "Actualiser",
                "تحديث",
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <RefreshCw
                size={28}
                className="animate-spin text-[#2563EB]"
              />
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Shield size={28} />
              </div>

              <h3 className="mt-4 font-black text-slate-800">
                {text(
                  "Aucun rôle trouvé",
                  "لم يتم العثور على أي دور",
                )}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {text(
                  "Créez votre premier rôle.",
                  "أنشئ أول دور لك.",
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wide text-slate-500">
                      {text(
                        "Rôle",
                        "الدور",
                      )}
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wide text-slate-500">
                      {text(
                        "Description",
                        "الوصف",
                      )}
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wide text-slate-500">
                      {text(
                        "Permissions",
                        "الصلاحيات",
                      )}
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wide text-slate-500">
                      {text(
                        "Type",
                        "النوع",
                      )}
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wide text-slate-500">
                      {text(
                        "Actions",
                        "الإجراءات",
                      )}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRoles.map(
                    (role) => {
                      const system = isTrue(
                        role.is_system,
                      );

                      return (
                        <tr
                          key={role.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                                <Shield
                                  size={18}
                                />
                              </div>

                              <div>
                                <p className="font-black text-slate-900">
                                  {role.name}
                                </p>

                                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                  {role.code}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="max-w-[300px] px-5 py-4">
                            <p className="truncate text-sm font-medium text-slate-500">
                              {role.description ||
                                text(
                                  "Aucune description",
                                  "لا يوجد وصف",
                                )}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-[#2563EB]">
                              <KeyRound
                                size={13}
                              />

                              {Number(
                                role.permission_count ??
                                  0,
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            {system ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                                <CheckCircle2
                                  size={13}
                                />
                                {text(
                                  "Système",
                                  "نظام",
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                {text(
                                  "Personnalisé",
                                  "مخصص",
                                )}
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void openEdit(
                                    role,
                                  )
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] transition hover:bg-blue-100"
                                title={text(
                                  "Modifier",
                                  "تعديل",
                                )}
                              >
                                <Edit
                                  size={16}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void deleteRole(
                                    role,
                                  )
                                }
                                disabled={
                                  system ||
                                  deletingId ===
                                    role.id
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                title={text(
                                  "Supprimer",
                                  "حذف",
                                )}
                              >
                                {deletingId ===
                                role.id ? (
                                  <RefreshCw
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={16}
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          MODAL ROLE
      ===================================================== */}

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                  <Shield size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editingRole
                      ? text(
                          "Modifier le rôle",
                          "تعديل الدور",
                        )
                      : text(
                          "Nouveau rôle",
                          "دور جديد",
                        )}
                  </h2>

                  <p className="text-xs font-medium text-slate-400">
                    {text(
                      "Définissez les permissions de ce rôle.",
                      "حدد صلاحيات هذا الدور.",
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">

              {/* ERROR */}
              {formError && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-sm font-semibold">
                    {formError}
                  </p>
                </div>
              )}

              {/* GENERAL INFO */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <label>
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                    {text(
                      "Code",
                      "الرمز",
                    )}
                  </span>

                  <input
                    value={form.code}
                    disabled={Boolean(
                      editingRole,
                    )}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          code: event.target.value,
                        }),
                      )
                    }
                    placeholder="GESTIONNAIRE"
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold uppercase text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                    {text(
                      "Nom",
                      "الاسم",
                    )}
                  </span>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          name: event.target.value,
                        }),
                      )
                    }
                    placeholder={text(
                      "Gestionnaire",
                      "مسؤول",
                    )}
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                    {text(
                      "Description",
                      "الوصف",
                    )}
                  </span>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          description:
                            event.target.value,
                        }),
                      )
                    }
                    rows={3}
                    placeholder={text(
                      "Description du rôle...",
                      "وصف الدور...",
                    )}
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10"
                  />
                </label>
              </div>

              {/* PERMISSION HEADER */}
              <div className="mt-7 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
                    {text(
                      "Accès",
                      "الوصول",
                    )}
                  </p>

                  <h3 className="mt-1 text-lg font-black text-slate-900">
                    {text(
                      "Permissions",
                      "الصلاحيات",
                    )}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {form.permissionIds.length} /{" "}
                    {permissions.length}{" "}
                    {text(
                      "permissions sélectionnées",
                      "صلاحيات محددة",
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={
                      selectAllPermissions
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-50 px-3 text-xs font-black text-[#2563EB] transition hover:bg-blue-100"
                  >
                    <Check
                      size={14}
                    />

                    {text(
                      "Tout sélectionner",
                      "تحديد الكل",
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={
                      clearAllPermissions
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-600 transition hover:bg-slate-200"
                  >
                    <X size={14} />

                    {text(
                      "Tout retirer",
                      "إلغاء الكل",
                    )}
                  </button>
                </div>
              </div>

              {/* PERMISSION GROUPS */}
              <div className="mt-5 space-y-4">
                {permissionGroups.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                    <KeyRound
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-bold text-slate-500">
                      {text(
                        "Aucune permission disponible.",
                        "لا توجد صلاحيات متاحة.",
                      )}
                    </p>
                  </div>
                ) : (
                  permissionGroups.map(
                    (group) => {
                      const ids =
                        group.permissions.map(
                          (permission) =>
                            permission.id,
                        );

                      const selectedCount =
                        ids.filter((id) =>
                          form.permissionIds.includes(
                            id,
                          ),
                        ).length;

                      const allSelected =
                        selectedCount ===
                          ids.length &&
                        ids.length > 0;

                      const someSelected =
                        selectedCount > 0 &&
                        selectedCount <
                          ids.length;

                      return (
                        <div
                          key={group.module}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          {/* MODULE HEADER */}
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                                <KeyRound
                                  size={16}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-black text-slate-800">
                                  {formatModuleName(
                                    group.module,
                                  )}
                                </p>

                                <p className="text-[10px] font-bold text-slate-400">
                                  {
                                    group
                                      .permissions
                                      .length
                                  }{" "}
                                  {text(
                                    "permissions",
                                    "صلاحيات",
                                  )}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleModule(
                                  group,
                                )
                              }
                              className={[
                                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-black transition",
                                allSelected
                                  ? "bg-[#2563EB] text-white"
                                  : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "flex h-4 w-4 items-center justify-center rounded border",
                                  allSelected
                                    ? "border-white bg-white text-[#2563EB]"
                                    : someSelected
                                      ? "border-[#2563EB] bg-[#2563EB]"
                                      : "border-slate-300",
                                ].join(" ")}
                              >
                                {allSelected ? (
                                  <Check
                                    size={11}
                                  />
                                ) : someSelected ? (
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                ) : null}
                              </span>

                              {text(
                                "Tout",
                                "الكل",
                              )}
                            </button>
                          </div>

                          {/* PERMISSIONS */}
                          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                            {group.permissions.map(
                              (
                                permission,
                              ) => {
                                const checked =
                                  form.permissionIds.includes(
                                    permission.id,
                                  );

                                return (
                                  <button
                                    key={
                                      permission.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      togglePermission(
                                        permission.id,
                                      )
                                    }
                                    className={[
                                      "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                                      checked
                                        ? "border-blue-200 bg-blue-50"
                                        : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white",
                                    ].join(
                                      " ",
                                    )}
                                  >
                                    <span
                                      className={[
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                                        checked
                                          ? "border-[#2563EB] bg-[#2563EB] text-white"
                                          : "border-slate-300 bg-white",
                                      ].join(
                                        " ",
                                      )}
                                    >
                                      {checked && (
                                        <Check
                                          size={
                                            13
                                          }
                                          strokeWidth={
                                            3
                                          }
                                        />
                                      )}
                                    </span>

                                    <span className="min-w-0">
                                      <span
                                        className={[
                                          "block truncate text-xs font-black",
                                          checked
                                            ? "text-[#2563EB]"
                                            : "text-slate-700",
                                        ].join(
                                          " ",
                                        )}
                                      >
                                        {
                                          permission.code
                                        }
                                      </span>

                                      {permission.name && (
                                        <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-400">
                                          {
                                            permission.name
                                          }
                                        </span>
                                      )}
                                    </span>
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      );
                    },
                  )
                )}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="h-11 rounded-xl px-5 text-xs font-black text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                {text(
                  "Annuler",
                  "إلغاء",
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  void saveRole()
                }
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 text-xs font-black text-white shadow-lg shadow-[#2563EB]/20 transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Check size={16} />
                )}

                {editingRole
                  ? text(
                      "Enregistrer",
                      "حفظ",
                    )
                  : text(
                      "Créer le rôle",
                      "إنشاء الدور",
                    )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}