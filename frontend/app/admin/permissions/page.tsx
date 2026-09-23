"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

import { apiFetch } from "@/lib/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type Permission = {
  id: number | string;
  module?: string;
  code?: string;
  name?: string;
};

type PermissionsResponse = {
  success?: boolean;
  groups?: Permission[];
};

export default function Page() {
  const [rows, setRows] = useState<Permission[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPermissions() {
      try {
        setError("");

        const response = await apiFetch<PermissionsResponse | Permission[]>(
          "/permissions",
        );

        if (!mounted) return;

        // Compatibilité avec les deux formats :
        // 1. { success: true, groups: [...] }
        // 2. [...]
        if (Array.isArray(response)) {
          setRows(response);
          return;
        }

        setRows(
          Array.isArray(response?.groups)
            ? response.groups
            : [],
        );
      } catch (e: any) {
        if (!mounted) return;

        setError(
          e?.message ||
            "Impossible de charger les permissions.",
        );

        setRows([]);
      }
    }

    loadPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  const groups = useMemo(() => {
    return rows.reduce<Record<string, Permission[]>>(
      (accumulator, permission) => {
        const moduleName =
          String(permission.module || "Autres").trim() ||
          "Autres";

        if (!accumulator[moduleName]) {
          accumulator[moduleName] = [];
        }

        accumulator[moduleName].push(permission);

        return accumulator;
      },
      {},
    );
  }, [rows]);

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Sécurité RBAC"
        title="Permissions"
        subtitle="Visualisez toutes les permissions disponibles et leur organisation par module."
        icon={<ShieldCheck size={14} />}
      />

      {error && (
        <div className="mb-5 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(groups).map(
          ([module, items]) => (
            <section
              key={module}
              className="rounded-[25px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <KeyRound size={17} />
                </span>

                <div>
                  <h2 className="font-black capitalize">
                    {module}
                  </h2>

                  <p className="text-[10px] text-slate-400">
                    {items.length} permission(s)
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {items.map((permission) => (
                  <div
                    key={permission.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <b className="text-[10px] text-[#2563EB]">
                      {permission.code || "-"}
                    </b>

                    <p className="mt-1 text-[10px] text-slate-500">
                      {permission.name || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ),
        )}
      </div>

      {!error && rows.length === 0 && (
        <div className="py-10 text-center text-sm font-semibold text-slate-400">
          Aucune permission disponible.
        </div>
      )}
    </div>
  );
}