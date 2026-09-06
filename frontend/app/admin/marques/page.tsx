"use client";

import CrudManager from "@/components/admin/CrudManager";
import { backendUrl } from "@/lib/api";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

import {
  PackageCheck,
  Tags,
  Image as ImageIcon,
  CheckCircle2,
  Boxes,
} from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1800px] space-y-6 p-4 md:p-6 lg:p-8">
        {/* HEADER */}
        <AdminPageHeader
          eyebrow="Catalogue"
          title="Marques"
          subtitle="Centralisez les marques, leurs logos, descriptions bilingues et leur ordre d'affichage."
          icon={<PackageCheck size={18} />}
        />

        {/* QUICK INFO */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Organisation */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Organisation
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-900">
                  Marques
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <Tags size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Centralisez toutes vos marques
            </p>
          </div>

          {/* Multilingue */}
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
                <PackageCheck size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">
              Noms et descriptions bilingues
            </p>
          </div>

          {/* Catalogue */}
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
              Marques disponibles dans la boutique
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* BLUE ACCENT */}
          <div className="h-1 w-full bg-[#2563EB]" />

          <div className="p-1 md:p-2">
            <CrudManager
              title="Marques / العلامات التجارية"
              subtitle="Créez, modifiez et organisez vos marques directement depuis cette interface."
              endpoint="/marques"
              columns={[
                /* LOGO */
                {
                  key: "logo_url",
                  label: "Logo",
                  render: (row) =>
                    row.logo_url ? (
                      <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                        <img
                          src={backendUrl(row.logo_url)}
                          alt={row.name || ""}
                          className="h-full w-full object-contain p-1.5"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                        <ImageIcon size={22} />
                      </div>
                    ),
                },

                /* NOM FR */
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

                /* NOM AR */
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

                /* PRODUITS */
                {
                  key: "article_count",
                  label: "Produits liés",
                  render: (row) => (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                      <Boxes
                        size={15}
                        className="text-[#2563EB]"
                      />

                      <span className="text-xs font-black text-slate-700">
                        {row.article_count ?? 0}
                      </span>

                      <span className="text-[10px] font-semibold text-slate-400">
                        produits
                      </span>
                    </div>
                  ),
                },

                /* ORDRE */
                {
                  key: "sort_order",
                  label: "Ordre",
                  render: (row) => (
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 font-mono text-xs font-black text-slate-600">
                      {row.sort_order ?? 0}
                    </span>
                  ),
                },

                /* ACTIF */
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
                /* NOM FR */
                {
                  name: "name",
                  label: "Nom français",
                  required: true,
                },

                /* NOM AR */
                {
                  name: "nameAr",
                  label: "الاسم بالعربية",
                  fromRow: "name_ar",
                },

                /* SLUG */
                {
                  name: "slug",
                  label: "Slug",
                },

                /* ORDRE */
                {
                  name: "sortOrder",
                  label: "Ordre d'affichage",
                  type: "number",
                  fromRow: "sort_order",
                },

                /* LOGO */
                {
                  name: "logoUrl",
                  label: "Logo",
                  type: "image",
                  fromRow: "logo_url",
                  colSpan: true,
                },

                /* DESCRIPTION FR */
                {
                  name: "description",
                  label: "Description française",
                  type: "textarea",
                  colSpan: true,
                },

                /* DESCRIPTION AR */
                {
                  name: "descriptionAr",
                  label: "الوصف بالعربية",
                  type: "textarea",
                  fromRow: "description_ar",
                  colSpan: true,
                },

                /* ACTIVE */
                {
                  name: "active",
                  label: "Active",
                  type: "checkbox",
                },
              ]}
            />
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-medium text-slate-400 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#60A5FA]" />

            <span>Gestion des marques</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span>
              Catalogue{" "}
              <strong className="text-slate-700">
                FR / AR
              </strong>
            </span>

            <span>
              Produits liés{" "}
              <strong className="text-slate-700">
                automatiquement
              </strong>
            </span>

            <span>
              Gestion{" "}
              <strong className="text-slate-700">
                par modal
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}