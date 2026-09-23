
"use client";

import CrudManager from "@/components/admin/CrudManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useLocale } from "@/components/LocaleProvider";

import {
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  Phone,
  FileText,
} from "lucide-react";

export default function Page() {
  const { text, isArabic } = useLocale();
  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1800px] space-y-6 p-4 md:p-6 lg:p-8">
        {/* HEADER */}
        <AdminPageHeader
          eyebrow={text("Achats", "المشتريات")}
          title={text("Fournisseurs", "الموردون")}
          subtitle={text("Pilotez vos partenaires, contacts, coordonnées et statut commercial depuis un espace unique.", "أدر شركاءك وجهات الاتصال والبيانات وحالة النشاط التجاري من مكان واحد.")}
          icon={<Building2 size={18} />}
        />

        {/* QUICK INFO */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* PARTENAIRES */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Partenaires
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-900">{text("Fournisseurs", "الموردون")}</h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <Building2 size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">{text("Centralisez vos partenaires commerciaux", "اجمع شركاءك التجاريين في مكان واحد")}</p>
          </div>

          {/* CONTACTS */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Coordination
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-900">
                  Contacts
                </h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FE5737]">
                <Users size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">{text("Contacts et coordonnées commerciales", "جهات الاتصال والبيانات التجارية")}</p>
          </div>

          {/* STATUT */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Activité
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-900">{text("Statut", "الحالة")}</h3>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={23} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-400">{text("Suivez les fournisseurs actifs et inactifs", "تابع الموردين النشطين وغير النشطين")}</p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* BLUE ACCENT */}
          <div className="h-1 w-full bg-[#2563EB]" />

          <div className="p-1 md:p-2">
            <CrudManager
              title={text("Fournisseurs", "الموردون")}
              subtitle={text("Créez, modifiez et gérez vos partenaires et leurs coordonnées commerciales directement depuis cette interface.", "أنشئ وعدّل وأدر شركاءك وبياناتهم التجارية مباشرة من هذه الواجهة.")}
              endpoint="/fournisseurs"
              columns={[
                /* CODE */
                {
                  key: "code",
                  label: text("Code", "الرمز"),
                  render: (row) => (
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs font-black text-slate-600">
                      {row.code || "—"}
                    </span>
                  ),
                },

                /* NOM */
                {
                  key: "nom",
                  label: text("Nom", "الاسم"),
                  render: (row) => (
                    <div className="min-w-[180px]">
                      <p className="text-sm font-black text-slate-900">
                        {row.nom || "—"}
                      </p>

                      {row.email && (
                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                          {row.email}
                        </p>
                      )}
                    </div>
                  ),
                },

                /* CONTACT */
                {
                  key: "contact_name",
                  label: text("Contact", "جهة الاتصال"),
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                        <Users size={15} />
                      </div>

                      <span className="text-sm font-bold text-slate-700">
                        {row.contact_name || "—"}
                      </span>
                    </div>
                  ),
                },

                /* TELEPHONE */
                {
                  key: "telephone",
                  label: text("Téléphone", "الهاتف"),
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <Phone
                        size={15}
                        className="text-[#2563EB]"
                      />

                      <span className="text-sm font-semibold text-slate-700">
                        {row.telephone || "—"}
                      </span>
                    </div>
                  ),
                },

                /* WILAYA */
                {
                  key: "wilaya",
                  label: text("Wilaya", "الولاية"),
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <MapPin size={15} />
                      </div>

                      <span className="text-sm font-bold text-slate-700">
                        {row.wilaya || "—"}
                      </span>
                    </div>
                  ),
                },

                /* STATUT */
                {
                  key: "statut",
                  label: text("Statut", "الحالة"),
                  render: (row) =>
                    row.statut === "ACTIF" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={13} />{text("Actif", "نشط")}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">{text("Inactif", "غير نشط")}</span>
                    ),
                },

                /* NIF */
                {
                  key: "nif",
                  label: text("NIF", "الرقم الجبائي NIF"),
                  render: (row) => (
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {row.nif || "—"}
                    </span>
                  ),
                },

                /* NIS */
                {
                  key: "nis",
                  label: text("NIS", "الرقم الإحصائي NIS"),
                  render: (row) => (
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {row.nis || "—"}
                    </span>
                  ),
                },
              ]}
              fields={[
                /* NOM */
                {
                  name: "nom",
                  label: text("Nom", "الاسم"),
                  required: true,
                },

                /* CONTACT */
                {
                  name: "contactName",
                  label: text("Contact", "جهة الاتصال"),
                  fromRow: "contact_name",
                },

                /* EMAIL */
                {
                  name: "email",
                  label: text("Email", "البريد الإلكتروني"),
                  type: "email",
                },

                /* TELEPHONE */
                {
                  name: "telephone",
                  label: text("Téléphone", "الهاتف"),
                },

                /* ADRESSE */
                {
                  name: "adresse",
                  label: text("Adresse", "العنوان"),
                  colSpan: true,
                },

                /* WILAYA */
                {
                  name: "wilaya",
                  label: text("Wilaya", "الولاية"),
                },

                /* NIF */
                {
                  name: "nif",
                  label: text("NIF", "الرقم الجبائي NIF"),
                },

                /* NIS */
                {
                  name: "nis",
                  label: text("NIS", "الرقم الإحصائي NIS"),
                },

                /* REGISTRE COMMERCE */
                {
                  name: "registreCommerce",
                  label: text("Registre de commerce", "السجل التجاري"),
                  fromRow: "registre_commerce",
                },

                /* STATUT */
                {
                  name: "statut",
                  label: text("Statut", "الحالة"),
                  type: "select",
                  options: [
                    {
                      label: text("Actif", "نشط"),
                      value: "ACTIF",
                    },
                    {
                      label: text("Inactif", "غير نشط"),
                      value: "INACTIF",
                    },
                  ],
                },

                /* NOTES */
                {
                  name: "notes",
                  label: text("Notes", "ملاحظات"),
                  type: "textarea",
                  colSpan: true,
                },
              ]}
            />
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-medium text-slate-400 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#60A5FA]" />

            <span>Gestion des fournisseurs</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span>
              Partenaires{" "}
              <strong className="text-slate-700">
                commerciaux
              </strong>
            </span>

            <span>
              Coordonnées{" "}
              <strong className="text-slate-700">
                centralisées
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

