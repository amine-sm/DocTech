"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, ImagePlus, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { adminCreate, adminDelete, adminGet, adminList, adminUpdate } from "@/lib/admin-api";
import { backendUrl, uploadImage } from "@/lib/api";
import { useLocale } from "@/components/LocaleProvider";

export type FieldOption = { label: string; value: string | number };
export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "textarea" | "select" | "multiselect" | "checkbox" | "datetime-local" | "image";
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  fromRow?: string;
  transform?: (v: any) => any;
  colSpan?: boolean;
};
export type CrudColumn = { key: string; label: string; render?: (row: any) => React.ReactNode };

export default function CrudManager({
  title,
  subtitle,
  endpoint,
  fields,
  columns,
  search = true,
  createLabel = "Ajouter",
  pageSize = 50,
  onLoadOptions,
}: {
  title: string;
  subtitle?: string;
  endpoint: string;
  fields: CrudField[];
  columns: CrudColumn[];
  search?: boolean;
  createLabel?: string;
  pageSize?: number;
  onLoadOptions?: () => Promise<Record<string, FieldOption[]>>;
}) {
  const { text } = useLocale();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [opts, setOpts] = useState<Record<string, FieldOption[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = search && q.trim()
        ? `?limit=${pageSize}&search=${encodeURIComponent(q.trim())}`
        : `?limit=${pageSize}`;
      const result = await adminList(endpoint, query);
      setRows(result.rows);
    } catch (e: any) {
      setError(e.message || text("Erreur", "خطأ"));
    } finally {
      setLoading(false);
    }
  }, [endpoint, pageSize, q, search]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    onLoadOptions?.().then(setOpts).catch(() => {});
  }, [onLoadOptions]);

  function openCreate() {
    setEditing(null);
    const initial: Record<string, any> = {};
    fields.forEach((field) => {
      initial[field.name] = field.type === "checkbox" ? true : "";
    });
    setForm(initial);
    setError("");
    setModal(true);
  }

  async function openEdit(row: any) {
    setError("");
    try {
      const detail = await adminGet(endpoint, row.id);
      setEditing(detail);
      const initial: Record<string, any> = {};
      fields.forEach((field) => {
        let value = detail[field.fromRow || field.name];
        if (field.type === "datetime-local" && value) value = String(value).slice(0, 16);
        if (field.type === "checkbox") value = Boolean(value);
        if (field.type === "multiselect" && Array.isArray(value)) {
          value = value.map((item: any) => (typeof item === "object" ? item.id : item));
        }
        initial[field.name] = value ?? (field.type === "multiselect" ? [] : "");
      });
      setForm(initial);
      setModal(true);
    } catch (e: any) {
      setError(e.message || text("Erreur", "خطأ"));
    }
  }

  async function handleImage(fieldName: string, file?: File) {
    if (!file) return;
    setUploadingField(fieldName);
    setError("");
    try {
      const uploaded = await uploadImage(file);
      if (!uploaded?.url) throw new Error("URL de l'image manquante.");
      setForm((current) => ({ ...current, [fieldName]: uploaded.url }));
    } catch (e: any) {
      setError(e.message || "Impossible d'envoyer l'image.");
    } finally {
      setUploadingField(null);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, any> = {};
      fields.forEach((field) => {
        let value = form[field.name];
        if (field.type === "number" && value !== "") value = Number(value);
        if (field.transform) value = field.transform(value);
        payload[field.name] = value === "" && !field.required ? null : value;
      });
      if (editing) await adminUpdate(endpoint, editing.id, payload);
      else await adminCreate(endpoint, payload);
      setModal(false);
      await load();
    } catch (e: any) {
      setError(e.message || text("Erreur", "خطأ"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: any) {
    if (!confirm(`${text("Supprimer", "حذف")} ${row.name || row.nom || row.code || text("cet élément", "هذا العنصر")} ?`)) return;
    try {
      await adminDelete(endpoint, row.id);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const empty = useMemo(() => !loading && rows.length === 0, [loading, rows]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-600">{text("Gestion", "الإدارة")}</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-.04em]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <button onClick={openCreate} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-xs font-black text-white shadow-lg shadow-blue-600/20">
          <Plus size={16} /> {createLabel === "Ajouter" ? text("Ajouter", "إضافة") : createLabel}
        </button>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          {search && (
            <div className="relative flex-1">
              <Search size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={text("Rechercher...", "بحث...")} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 ps-11 pe-4 text-sm outline-none focus:border-blue-300" />
            </div>
          )}
          <button onClick={load} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-600">
            <RefreshCw size={14} /> {text("Actualiser", "تحديث")}
          </button>
        </div>

        {error && !modal && <div className="m-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-400">
              <tr>
                {columns.map((column) => <th key={column.key} className="px-4 py-3 font-black">{column.label}</th>)}
                <th className="px-4 py-3 text-right font-black">{text("Actions", "الإجراءات")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="p-10 text-center text-sm text-slate-400">{text("Chargement...", "جارٍ التحميل...")}</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  {columns.map((column) => <td key={column.key} className="px-4 py-3 text-xs font-semibold text-slate-700">{column.render ? column.render(row) : String(row[column.key] ?? "—")}</td>)}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(row)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Edit3 size={14} /></button>
                      <button onClick={() => remove(row)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {empty && <div className="p-12 text-center text-sm text-slate-400">{text("Aucun résultat.", "لا توجد نتائج.")}</div>}
        </div>

        <div className="space-y-3 p-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-400">{text("Chargement...", "جارٍ التحميل...")}</div>
          ) : rows.length > 0 ? rows.map((row) => (
            <article key={row.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-3">
                {columns.map((column) => (
                  <div key={column.key} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-[.11em] text-slate-400">{column.label}</span>
                    <div className="min-w-0 text-end text-xs font-bold text-slate-700">{column.render ? column.render(row) : String(row[column.key] ?? "—")}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <button onClick={() => openEdit(row)} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-50 text-[10px] font-black text-blue-600"><Edit3 size={14} />{text("Modifier", "تعديل")}</button>
                <button onClick={() => remove(row)} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-red-50 text-[10px] font-black text-red-500"><Trash2 size={14} />{text("Supprimer", "حذف")}</button>
              </div>
            </article>
          )) : (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-400">{text("Aucun résultat.", "لا توجد نتائج.")}</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-600">{editing ? text("Modification", "تعديل") : text("Création", "إنشاء")}</p>
                  <h2 className="mt-1 text-xl font-black">{title}</h2>
                </div>
                <button onClick={() => setModal(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><X size={17} /></button>
              </div>

              {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.name} className={field.colSpan ? "sm:col-span-2" : ""}>
                    <span className="mb-2 block text-[11px] font-black text-slate-600">{field.label}{field.required && <b className="text-red-500"> *</b>}</span>
                    {field.type === "textarea" ? (
                      <textarea rows={4} value={form[field.name] ?? ""} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-300" />
                    ) : field.type === "select" ? (
                      <select value={form[field.name] ?? ""} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none">
                        <option value="">{text("Choisir...", "اختر...")}</option>
                        {[...(field.options || []), ...(opts[field.name] || [])].map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
                      </select>
                    ) : field.type === "multiselect" ? (
                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {[...(field.options || []), ...(opts[field.name] || [])].map((option) => {
                          const selected = Array.isArray(form[field.name]) && form[field.name].map(String).includes(String(option.value));
                          return <label key={String(option.value)} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selected} onChange={() => { const cur = Array.isArray(form[field.name]) ? form[field.name] : []; setForm({ ...form, [field.name]: selected ? cur.filter((x: any) => String(x) !== String(option.value)) : [...cur, option.value] }); }} /><span>{option.label}</span></label>;
                        })}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <button type="button" onClick={() => setForm({ ...form, [field.name]: !form[field.name] })} className={`flex h-12 w-full items-center rounded-xl border px-3 text-sm font-bold ${form[field.name] ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                        {form[field.name] ? text("Oui / Actif", "نعم / نشط") : text("Non / Inactif", "لا / غير نشط")}
                      </button>
                    ) : field.type === "image" ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
                        {form[field.name] ? (
                          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white p-2">
                            <img src={backendUrl(form[field.name])} alt="Aperçu" className="h-20 w-20 rounded-xl object-contain" />
                            <div className="min-w-0 flex-1 text-[10px] font-bold text-slate-500">{text("Image enregistrée", "تم حفظ الصورة")}</div>
                            <button type="button" onClick={() => setForm({ ...form, [field.name]: "" })} className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-black text-red-500">{text("Retirer", "إزالة")}</button>
                          </div>
                        ) : null}
                        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-xs font-black text-blue-600 shadow-sm">
                          <ImagePlus size={16} /> {uploadingField === field.name ? text("Envoi...", "جارٍ الرفع...") : text("Choisir une image", "اختر صورة")}
                          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingField === field.name} onChange={(e) => void handleImage(field.name, e.target.files?.[0])} />
                        </label>
                      </div>
                    ) : (
                      <input type={field.type || "text"} required={field.required} placeholder={field.placeholder} value={form[field.name] ?? ""} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-300" />
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                <button onClick={() => setModal(false)} className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-black">{text("Annuler", "إلغاء")}</button>
                <button disabled={saving || Boolean(uploadingField)} onClick={save} className="h-11 rounded-xl bg-blue-600 px-5 text-xs font-black text-white disabled:opacity-60">{saving ? text("Enregistrement...", "جارٍ الحفظ...") : text("Enregistrer", "حفظ")}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
