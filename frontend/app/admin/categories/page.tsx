
"use client";

import CrudManager, {
  type FieldOption,
} from "@/components/admin/CrudManager";

import { adminList } from "@/lib/admin-api";
import { backendUrl } from "@/lib/api";

import AdminPageHeader from "@/components/admin/AdminPageHeader";

import {
  Tags,
  Boxes,
  FolderTree,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
} from "lucide-react";

export default function Page() {
  const load = async () => {
    const result = await adminList<any>(
      "/categories",
      "?limit=200"
    );

    return {
      parentId: [
        {
          label: "Aucune (racine)",
          value: "",
        },
        ...result.rows.map((item) => ({
          label: item.name_ar
            ? `${item.name} / ${item.name_ar}`
            : item.name,
          value: item.id,
        })),
      ] as FieldOption[],
    };
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1800px] space-y-6 p-4 md:p-6 lg:p-8">

        {/* =========================================================
            HEADER
        ========================================================= */}
        <AdminPageHeader
          eyebrow="Catalogue"
          title="Catégories"
          subtitle="Organisez votre catalogue avec une structure bilingue FR / AR, images, catégories parentes et ordre d'affichage."
          icon={<Tags size={18} />}
        />

        {/* =========================================================
            QUICK INFO
        ========================================================= */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* CARD 1 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Organisation
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-900">
                  Catégories
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <FolderTree size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Structurez votre catalogue facilement
            </p>
          </div>

          {/* CARD 2 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Multilingue
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-900">
                  FR / AR
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FE5737]">
                <Tags size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Noms et descriptions bilingues
            </p>
          </div>

          {/* CARD 3 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Catalogue
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-900">
                  Actif
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Gestion des catégories disponibles
            </p>
          </div>
        </div>

        {/* =========================================================
            MAIN MANAGER
        ========================================================= */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TOP ACCENT */}
          <div className="h-1 w-full bg-[#2563EB]" />

          <div className="p-1 md:p-2">

            <CrudManager
              title="Catégories / التصنيفات"
              subtitle="Créez, modifiez et organisez vos catégories directement depuis cette interface."
              endpoint="/categories"
              onLoadOptions={load}

              columns={[
                {
                  key: "image_url",
                  label: "Image",

                  render: (row) =>
                    row.image_url ? (
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                        <img
                          src={backendUrl(
                            row.image_url
                          )}
                          alt={row.name || ""}
                          className="h-full w-full object-contain p-1.5"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                        <ImageIcon size={22} />
                      </div>
                    ),
                },

                {
                  key: "name",
                  label: "Nom FR",

                  render: (row) => (
                    <div className="min-w-[180px]">
                      <p className="text-sm font-black text-slate-900">
                        {row.name || "—"}
                      </p>

                      {row.slug && (
                        <p className="mt-1 font-mono text-[10px] font-semibold text-slate-400">
                          /{row.slug}
                        </p>
                      )}
                    </div>
                  ),
                },

                {
                  key: "name_ar",
                  label: "الاسم AR",

                  render: (row) => (
                    <span
                      dir="rtl"
                      className="font-semibold text-slate-700"
                    >
                      {row.name_ar || "—"}
                    </span>
                  ),
                },

                {
                  key: "parent_name",
                  label: "Parent",

                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                        <FolderTree size={15} />
                      </div>

                      <span className="text-sm font-bold text-slate-700">
                        {row.parent_name ||
                          "Catégorie racine"}
                      </span>
                    </div>
                  ),
                },

                {
                  key: "article_count",
                  label: "Articles",

                  render: (row) => (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                      <Boxes
                        size={15}
                        className="text-[#2563EB]"
                      />

                      <span className="text-xs font-black text-slate-700">
                        {row.article_count ?? 0}
                      </span>
                    </div>
                  ),
                },

                {
                  key: "sort_order",
                  label: "Ordre",

                  render: (row) => (
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 font-mono text-xs font-black text-slate-600">
                      {row.sort_order ?? 0}
                    </span>
                  ),
                },

                {
                  key: "active",
                  label: "Actif",

                  render: (row) =>
                    row.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={13} />
                        Oui
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                        Non
                      </span>
                    ),
                },
              ]}

              fields={[
                {
                  name: "name",
                  label: "Nom français",
                  required: true,
                },

                {
                  name: "nameAr",
                  label: "الاسم بالعربية",
                  fromRow: "name_ar",
                },

                {
                  name: "slug",
                  label: "Slug",
                },

                {
                  name: "parentId",
                  label: "Catégorie parent",
                  type: "select",
                  fromRow: "parent_id",
                },

                {
                  name: "sortOrder",
                  label: "Ordre d'affichage",
                  type: "number",
                  fromRow: "sort_order",
                },

                {
                  name: "imageUrl",
                  label: "Image",
                  type: "image",
                  fromRow: "image_url",
                  colSpan: true,
                },

                {
                  name: "description",
                  label: "Description française",
                  type: "textarea",
                  colSpan: true,
                },

                {
                  name: "descriptionAr",
                  label: "الوصف بالعربية",
                  type: "textarea",
                  fromRow: "description_ar",
                  colSpan: true,
                },

                {
                  name: "active",
                  label: "Active",
                  type: "checkbox",
                },
              ]}
            />

          </div>
        </div>

        {/* =========================================================
            FOOTER INFO
        ========================================================= */}
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-medium text-slate-400 shadow-sm sm:flex-row sm:items-center">

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#60A5FA]" />

            <span>
              Gestion des catégories
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Catalogue{" "}
              <strong className="text-slate-700">
                FR / AR
              </strong>
            </span>

            <span>
              Organisation{" "}
              <strong className="text-slate-700">
                hiérarchique
              </strong>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
