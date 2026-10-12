"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import {

  Activity,

  AlertCircle,

  ArrowUpRight,

  CheckCircle2,

  ChevronLeft,

  ChevronRight,

  Clock3,

  FileText,

  Laptop,

  Loader2,

  RefreshCw,

  Search,

  Smartphone,

  UserRound,

  Wrench,

  X,

} from "lucide-react";



import AdminPageHeader from "@/components/admin/AdminPageHeader";

import { useLocale } from "@/components/LocaleProvider";

import {

  addRepairDiagnosis,

  cancelRepair,

  createRepairQuote,

  getRepair,

  getRepairDashboardStats,

  getRepairs,

  updateRepair,

  updateRepairStatus,

  type Repair,

  type RepairStatus,

  type RepairQuoteItem,

} from "@/lib/repair";



const REPAIR_STATUSES: RepairStatus[] = [

  "EN_ATTENTE",

  "TICKET_CREE",

  "APPAREIL_RECU",

  "DIAGNOSTIC",

  "DEVIS_ENVOYE",

  "DEVIS_ACCEPTE",

  "DEVIS_REFUSE",

  "EN_REPARATION",

  "REPARATION_TERMINEE",

  "PRET_A_RECUPERER",

  "RECUPERE",

  "ANNULE",

  "IRREPARABLE",

];



const STATUS_LABELS: Record<string, string> = {

  EN_ATTENTE: "En attente",

  TICKET_CREE: "Ticket créé",

  APPAREIL_RECU: "Appareil reçu",

  DIAGNOSTIC: "Diagnostic",

  DEVIS_ENVOYE: "Devis envoyé",

  DEVIS_ACCEPTE: "Devis accepté",

  DEVIS_REFUSE: "Devis refusé",

  EN_REPARATION: "En réparation",

  REPARATION_TERMINEE: "Réparation terminée",

  PRET_A_RECUPERER: "Prêt à récupérer",

  RECUPERE: "Récupéré",

  ANNULE: "Annulé",

  IRREPARABLE: "Irréparable",

};



const STATUS_STYLES: Record<string, string> = {

  EN_ATTENTE: "bg-amber-50 text-amber-700 ring-amber-200",

  TICKET_CREE: "bg-sky-50 text-sky-700 ring-sky-200",

  APPAREIL_RECU: "bg-cyan-50 text-cyan-700 ring-cyan-200",

  DIAGNOSTIC: "bg-violet-50 text-violet-700 ring-violet-200",

  DEVIS_ENVOYE: "bg-orange-50 text-orange-700 ring-orange-200",

  DEVIS_ACCEPTE: "bg-emerald-50 text-emerald-700 ring-emerald-200",

  DEVIS_REFUSE: "bg-rose-50 text-rose-700 ring-rose-200",

  EN_REPARATION: "bg-indigo-50 text-indigo-700 ring-indigo-200",

  REPARATION_TERMINEE: "bg-teal-50 text-teal-700 ring-teal-200",

  PRET_A_RECUPERER: "bg-green-50 text-green-700 ring-green-200",

  RECUPERE: "bg-slate-100 text-slate-700 ring-slate-200",

  ANNULE: "bg-red-50 text-red-700 ring-red-200",

  IRREPARABLE: "bg-gray-100 text-gray-700 ring-gray-200",

};



type Stats = {

  total?: number;

  en_attente?: number;

  en_reparation?: number;

  pret_a_recuperer?: number;

  terminees?: number;

  [key: string]: unknown;

};



function getMessage(error: unknown, fallback: string) {

  return error instanceof Error ? error.message : fallback;

}



function money(value: unknown) {

  const amount = Number(value ?? 0);

  return `${amount.toLocaleString("fr-DZ", {

    minimumFractionDigits: 2,

    maximumFractionDigits: 2,

  })} DA`;

}



function dateLabel(value?: string | null) {

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("fr-DZ", {

    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

  });

}



function statusLabel(status?: string) {

  return status ? STATUS_LABELS[status] || status.replaceAll("_", " ") : "Inconnu";

}



function statusClass(status?: string) {

  return STATUS_STYLES[status || ""] || "bg-slate-100 text-slate-700 ring-slate-200";

}



function normalizeList(response: any): Repair[] {

  const data = response?.data ?? response?.repairs ?? response;

  return Array.isArray(data) ? data : [];

}



function normalizeStats(response: any): Stats {

  return response?.data ?? response?.stats ?? response ?? {};

}



export default function ReparationsAdminPage() {

  const { text, isArabic } = useLocale();

  const [repairs, setRepairs] = useState<Repair[]>([]);

  const [stats, setStats] = useState<Stats>({});

  const [selected, setSelected] = useState<Repair | null>(null);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const [saving, setSaving] = useState(false);

  const [diagnosis, setDiagnosis] = useState("");

  const [estimatedPrice, setEstimatedPrice] = useState("");

  const [adminNote, setAdminNote] = useState("");

  const [newStatus, setNewStatus] = useState<RepairStatus | "">("");

  const [statusComment, setStatusComment] = useState("");

  const [quoteLabor, setQuoteLabor] = useState("0");

  const [quoteDiscount, setQuoteDiscount] = useState("0");

  const [quoteDescription, setQuoteDescription] = useState("");

  const [quoteUnitPrice, setQuoteUnitPrice] = useState("");

  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const [activeAction, setActiveAction] = useState<"status" | "diagnosis" | "note" | "quote" | null>(null);



  const load = useCallback(async () => {

    setLoading(true);

    setError("");

    try {

      const [listResponse, statsResponse] = await Promise.all([

        getRepairs({

          search: query.trim() || undefined,

          status: statusFilter || undefined,

          page,

          limit: 12,

        }),

        getRepairDashboardStats().catch(() => ({})),

      ]);



      setRepairs(normalizeList(listResponse));

      const pagination = listResponse?.pagination;

      setTotalPages(Math.max(1, Number(pagination?.totalPages || 1)));

      setStats(normalizeStats(statsResponse));

    } catch (e) {

      setError(getMessage(e, "Impossible de charger les réparations."));

      setRepairs([]);

    } finally {

      setLoading(false);

    }

  }, [query, statusFilter, page]);



  useEffect(() => {

    const timer = setTimeout(() => void load(), 250);

    return () => clearTimeout(timer);

  }, [load]);



  const openDetail = async (repair: Repair) => {

    setSelected(repair);

    setDetailLoading(true);

    setActiveAction(null);

    setShowQuoteForm(false);

    try {

      const response: any = await getRepair(repair.id);

      const detail = response?.data ?? response?.repair ?? response;

      if (detail && typeof detail === "object") {

        setSelected(detail as Repair);

        setDiagnosis(String(detail.diagnosis ?? ""));

        setEstimatedPrice(

          detail.estimated_price == null ? "" : String(detail.estimated_price),

        );

        setAdminNote(String(detail.admin_note ?? ""));

        setNewStatus((detail.status as RepairStatus) || "");

      }

    } catch (e) {

      setError(getMessage(e, "Impossible de charger le détail."));

    } finally {

      setDetailLoading(false);

    }

  };



  const closeDetail = () => {

    if (saving) return;

    setSelected(null);

    setActiveAction(null);

    setShowQuoteForm(false);

  };



  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {

    if (!selected) return;

    setSaving(true);

    setError("");

    try {

      await action();

      await load();

      const refreshed: any = await getRepair(selected.id);

      const detail = refreshed?.data ?? refreshed?.repair ?? refreshed;

      if (detail && typeof detail === "object") {

        setSelected(detail as Repair);

        setDiagnosis(String(detail.diagnosis ?? ""));

        setEstimatedPrice(detail.estimated_price == null ? "" : String(detail.estimated_price));

        setAdminNote(String(detail.admin_note ?? ""));

        setNewStatus((detail.status as RepairStatus) || "");

      }

      setActiveAction(null);

      setShowQuoteForm(false);

      setToast({ title: "Mise à jour réussie", message: successMessage });
      window.setTimeout(() => setToast(null), 4500);

    } catch (e) {

      setError(getMessage(e, "L'opération a échoué."));

    } finally {

      setSaving(false);

    }

  };



  const saveStatus = () => {

    if (!selected || !newStatus) return;

    void runAction(

      () => updateRepairStatus(selected.id, newStatus, statusComment.trim() || undefined),

      "Statut de la réparation mis à jour.",

    );

  };



  const saveDiagnosis = () => {

    if (!selected || !diagnosis.trim()) {

      setError("Veuillez saisir le diagnostic.");

      return;

    }

    void runAction(

      () =>

        addRepairDiagnosis(selected.id, {

          diagnosis: diagnosis.trim(),

          ...(estimatedPrice.trim() ? { estimated_price: Number(estimatedPrice) } : {}),

        }),

      "Diagnostic enregistré.",

    );

  };



  const saveNote = () => {

    if (!selected) return;

    void runAction(

      () => updateRepair(selected.id, { admin_note: adminNote.trim() || null }),

      "Note administrateur enregistrée.",

    );

  };



  const saveQuote = () => {

    if (!selected) return;

    if (!quoteDescription.trim() || !quoteUnitPrice.trim()) {

      setError("Saisissez la désignation et le prix de la prestation.");

      return;

    }

    const items: RepairQuoteItem[] = [

      {

        description: quoteDescription.trim(),

        quantity: 1,

        unit_price: Number(quoteUnitPrice),

      },

    ];

    void runAction(

      () =>

        createRepairQuote(selected.id, {

          items,

          labor_cost: Number(quoteLabor || 0),

          discount: Number(quoteDiscount || 0),

        }),

      "Devis créé avec succès.",

    );

  };



  const filteredRepairs = useMemo(() => repairs, [repairs]);



  const statCards = [

    {

      title: "Total réparations",

      value: stats.total ?? stats.total_repairs ?? repairs.length,

      icon: Wrench,

      accent: "bg-teal-50 text-teal-700",

      hint: "Toutes les demandes",

    },

    {

      title: "En attente",

      value: stats.en_attente ?? stats.pending ?? 0,

      icon: Clock3,

      accent: "bg-amber-50 text-amber-700",

      hint: "À prendre en charge",

    },

    {

      title: "En réparation",

      value: stats.en_reparation ?? stats.in_repair ?? 0,

      icon: Activity,

      accent: "bg-indigo-50 text-indigo-700",

      hint: "Interventions en cours",

    },

    {

      title: "Prêtes à récupérer",

      value: stats.pret_a_recuperer ?? stats.ready_for_pickup ?? 0,

      icon: CheckCircle2,

      accent: "bg-emerald-50 text-emerald-700",

      hint: "Clients à prévenir",

    },

  ];



  return (

    <main className={`min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 ${isArabic ? "text-right" : ""}`} dir={isArabic ? "rtl" : "ltr"}>

      <div className="mx-auto max-w-[1600px] space-y-6">

        <AdminPageHeader

          title={text("Gestion des réparations", "إدارة الإصلاحات")}

          subtitle={text(

            "Suivez les tickets, les diagnostics, les devis et les appareils à restituer.",

            "تابع تذاكر الإصلاح والتشخيص وعروض الأسعار والأجهزة الجاهزة للاستلام.",

          )}

        />



        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {statCards.map((item) => {

            const Icon = item.icon;

            return (

              <article key={item.title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="text-sm font-medium text-slate-500">{item.title}</p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{Number(item.value || 0).toLocaleString("fr-DZ")}</p>

                    <p className="mt-1 text-xs text-slate-400">{item.hint}</p>

                  </div>

                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${item.accent}`}><Icon size={21} /></span>

                </div>

              </article>

            );

          })}

        </section>



        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">

          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">Tickets de réparation</h2>

              <p className="mt-1 text-sm text-slate-500">Recherche, suivi des statuts et accès rapide aux dossiers.</p>

            </div>

            <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60">

              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />

              Actualiser

            </button>

          </div>



          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 md:grid-cols-[minmax(240px,1fr)_260px]">

            <label className="relative block">

              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isArabic ? "right-3" : "left-3"}`} />

              <input

                value={query}

                onChange={(event) => { setQuery(event.target.value); setPage(1); }}

                placeholder="Rechercher ticket, client, téléphone, appareil..."

                className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 ${isArabic ? "pr-10 pl-4" : "pl-10 pr-4"}`}

              />

            </label>

            <select

              value={statusFilter}

              onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}

              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"

            >

              <option value="">Tous les statuts</option>

              {REPAIR_STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}

            </select>

          </div>



          {error && (

            <div className="m-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">

              <AlertCircle size={18} className="mt-0.5 shrink-0" />

              <span className="flex-1">{error}</span>

              <button onClick={() => setError("")} aria-label="Fermer"><X size={16} /></button>

            </div>

          )}



          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px] border-collapse text-left">

              <thead>

                <tr className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">

                  <th className="px-5 py-4 font-semibold">Ticket</th>

                  <th className="px-5 py-4 font-semibold">Client</th>

                  <th className="px-5 py-4 font-semibold">Appareil</th>

                  <th className="px-5 py-4 font-semibold">Type</th>

                  <th className="px-5 py-4 font-semibold">Statut</th>

                  <th className="px-5 py-4 font-semibold">Technicien</th>

                  <th className="px-5 py-4 font-semibold">Date</th>

                  <th className="px-5 py-4 text-right font-semibold">Action</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (

                  <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-500"><span className="inline-flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Chargement des réparations...</span></td></tr>

                ) : filteredRepairs.length === 0 ? (

                  <tr><td colSpan={8} className="px-5 py-16 text-center">

                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Wrench size={22} /></div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">Aucune réparation trouvée</p>

                    <p className="mt-1 text-sm text-slate-400">Modifiez les filtres ou actualisez la liste.</p>

                  </td></tr>

                ) : filteredRepairs.map((repair) => (

                  <tr key={repair.id} className="transition hover:bg-slate-50/80">

                    <td className="px-5 py-4">

                      <p className="font-bold text-slate-900">{repair.ticket_number || `#${repair.id}`}</p>

                      <p className="mt-1 text-xs text-slate-400">ID interne : {repair.id}</p>

                    </td>

                    <td className="px-5 py-4">

                      <p className="font-semibold text-slate-800">{repair.customer_name || "Client"}</p>

                      <p className="mt-1 text-xs text-slate-500">{repair.customer_phone || "Téléphone non renseigné"}</p>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><Smartphone size={17} /></span>

                        <div>

                          <p className="font-medium text-slate-800">{repair.device || "Appareil"}</p>

                          <p className="mt-1 text-xs text-slate-500">{[repair.brand, repair.model].filter(Boolean).join(" ") || "Marque / modèle non précisé"}</p>

                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">{repair.repair_type_name || "Non défini"}</td>

                    <td className="px-5 py-4"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(repair.status)}`}>{statusLabel(repair.status)}</span></td>

                    <td className="px-5 py-4 text-sm text-slate-600">{repair.technician_name || "Non affecté"}</td>

                    <td className="px-5 py-4 text-sm text-slate-500">{dateLabel(repair.created_at)}</td>

                    <td className="px-5 py-4 text-right">

                      <button onClick={() => void openDetail(repair)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800">

                        <FileText size={16} /> Détails <ArrowUpRight size={14} />

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>



          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-slate-500">Page <strong className="text-slate-800">{page}</strong> sur <strong className="text-slate-800">{totalPages}</strong></p>

            <div className="flex items-center gap-2">

              <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /> Précédent</button>

              <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages || loading} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Suivant <ChevronRight size={16} /></button>

            </div>

          </div>

        </section>

      </div>



      {selected && (

        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetail(); }}>

          <section className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

            <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:px-7">

              <div className="flex min-w-0 items-start gap-3">

                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Wrench size={23} /></span>

                <div className="min-w-0">

                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Dossier de réparation</p>

                  <h2 className="mt-1 truncate text-xl font-bold text-slate-900 sm:text-2xl">{selected.ticket_number || `#${selected.id}`}</h2>

                  <p className="mt-1 text-sm text-slate-500">{selected.customer_name} · {selected.device}</p>

                </div>

              </div>

              <button onClick={closeDetail} disabled={saving} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50" aria-label="Fermer"><X size={21} /></button>

            </header>



            <div className="max-h-[calc(94vh-90px)] overflow-y-auto p-5 sm:p-7">

              {detailLoading ? (

                <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="animate-spin" size={20} /> Chargement du dossier...</div>

              ) : (

                <div className="space-y-6">

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                    <InfoTile label="Client" value={selected.customer_name} icon={<UserRound size={17} />} />

                    <InfoTile label="Téléphone" value={selected.customer_phone || "—"} icon={<Smartphone size={17} />} />

                    <InfoTile label="Appareil" value={[selected.brand, selected.model, selected.device].filter(Boolean).join(" ")} icon={<Laptop size={17} />} />

                    <InfoTile label="Créé le" value={dateLabel(selected.created_at)} icon={<Clock3 size={17} />} />

                  </div>



                  <RepairRoadmap status={selected.status} />

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    <div className="rounded-2xl border border-slate-200 p-5">

                      <h3 className="font-bold text-slate-900">Description de la panne</h3>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selected.problem || "Aucune description."}</p>

                      {selected.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-500">{selected.description}</p>}

                      {selected.customer_note && <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><strong>Note client :</strong> {selected.customer_note}</div>}

                      <div className="mt-4 flex flex-wrap gap-2">

                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusClass(selected.status)}`}>{statusLabel(selected.status)}</span>

                        {selected.repair_type_name && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">{selected.repair_type_name}</span>}

                      </div>

                    </div>



                    <div className="rounded-2xl border border-slate-200 p-5">

                      <div className="flex items-center justify-between gap-3">

                        <h3 className="font-bold text-slate-900">Informations financières</h3>

                        <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><FileText size={17} /></span>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Prix estimé</p><p className="mt-1 font-bold text-slate-900">{selected.estimated_price == null ? "—" : money(selected.estimated_price)}</p></div>

                        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Prix final</p><p className="mt-1 font-bold text-slate-900">{selected.final_price == null ? "—" : money(selected.final_price)}</p></div>

                      </div>

                      <p className="mt-4 text-xs text-slate-500">Technicien : <strong className="text-slate-700">{selected.technician_name || "Non affecté"}</strong></p>

                      <p className="mt-2 text-xs text-slate-500">N° de série : <strong className="text-slate-700">{selected.serial_number || "Non renseigné"}</strong></p>

                    </div>

                  </div>



                  <div className="rounded-2xl border border-slate-200 p-5">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <div><h3 className="font-bold text-slate-900">Actions de gestion</h3><p className="mt-1 text-sm text-slate-500">Modifiez le statut, enregistrez le diagnostic ou préparez un devis.</p></div>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">

                      <ActionButton active={activeAction === "status"} onClick={() => setActiveAction(activeAction === "status" ? null : "status")}>Changer le statut</ActionButton>

                      <ActionButton active={activeAction === "diagnosis"} onClick={() => setActiveAction(activeAction === "diagnosis" ? null : "diagnosis")}>Diagnostic</ActionButton>

                      <ActionButton active={activeAction === "note"} onClick={() => setActiveAction(activeAction === "note" ? null : "note")}>Note interne</ActionButton>

                      <ActionButton active={showQuoteForm} onClick={() => { setShowQuoteForm(!showQuoteForm); setActiveAction(null); }}>Créer un devis</ActionButton>

                    </div>



                    {activeAction === "status" && (

                      <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]">

                        <label className="text-xs font-semibold text-slate-600">Nouveau statut

                          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as RepairStatus)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-teal-500">

                            {REPAIR_STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}

                          </select>

                        </label>

                        <label className="text-xs font-semibold text-slate-600">Commentaire (facultatif)

                          <input value={statusComment} onChange={(e) => setStatusComment(e.target.value)} placeholder="Ajouter un commentaire..." className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-teal-500" />

                        </label>

                        <div className="flex items-end"><button onClick={saveStatus} disabled={saving || !newStatus} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer"}</button></div>

                      </div>

                    )}



                    {activeAction === "diagnosis" && (

                      <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">

                        <label className="block text-xs font-semibold text-slate-600">Diagnostic technique

                          <textarea rows={3} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Décrivez la panne identifiée et l'intervention recommandée..." className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-teal-500" />

                        </label>

                        <label className="block max-w-xs text-xs font-semibold text-slate-600">Prix estimé (DA)

                          <input type="number" min="0" step="0.01" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value)} placeholder="0.00" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-teal-500" />

                        </label>

                        <button onClick={saveDiagnosis} disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer le diagnostic"}</button>

                      </div>

                    )}



                    {activeAction === "note" && (

                      <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">

                        <label className="block text-xs font-semibold text-slate-600">Note réservée à l'administration

                          <textarea rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Note interne non destinée au client..." className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-teal-500" />

                        </label>

                        <button onClick={saveNote} disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer la note"}</button>

                      </div>

                    )}



                    {showQuoteForm && (

                      <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">

                        <p className="text-sm font-bold text-slate-800">Nouveau devis</p>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                          <label className="text-xs font-semibold text-slate-600 md:col-span-2">Prestation / pièce

                            <input value={quoteDescription} onChange={(e) => setQuoteDescription(e.target.value)} placeholder="Ex. Remplacement écran" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-teal-500" />

                          </label>

                          <label className="text-xs font-semibold text-slate-600">Prix de la prestation (DA)

                            <input type="number" min="0" step="0.01" value={quoteUnitPrice} onChange={(e) => setQuoteUnitPrice(e.target.value)} placeholder="0.00" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-teal-500" />

                          </label>

                          <label className="text-xs font-semibold text-slate-600">Main-d'œuvre (DA)

                            <input type="number" min="0" step="0.01" value={quoteLabor} onChange={(e) => setQuoteLabor(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-teal-500" />

                          </label>

                          <label className="text-xs font-semibold text-slate-600">Remise (DA)

                            <input type="number" min="0" step="0.01" value={quoteDiscount} onChange={(e) => setQuoteDiscount(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-teal-500" />

                          </label>

                        </div>

                        <p className="text-xs text-slate-500">Le devis est créé via l'API de réparation. Vérifiez ensuite son envoi au client depuis votre workflow habituel.</p>

                        <button onClick={saveQuote} disabled={saving} className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">{saving ? "Création..." : "Créer le devis"}</button>

                      </div>

                    )}

                  </div>



                  {selected.diagnosis && activeAction !== "diagnosis" && (

                    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">

                      <h3 className="font-bold text-violet-950">Diagnostic enregistré</h3>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-violet-900/80">{selected.diagnosis}</p>

                    </div>

                  )}



                  {selected.admin_note && activeAction !== "note" && (

                    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">

                      <h3 className="font-bold text-amber-950">Note interne</h3>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-900/80">{selected.admin_note}</p>

                    </div>

                  )}



                  {["RECUPERE", "ANNULE", "IRREPARABLE"].includes(selected.status) === false && (

                    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">

                      <button onClick={() => {

                        if (window.confirm("Confirmer l'annulation de cette réparation ?")) {

                          void runAction(() => cancelRepair(selected.id, "Annulée depuis le tableau d'administration."), "Réparation annulée.");

                        }

                      }} disabled={saving} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Annuler la réparation</button>

                    </div>

                  )}

                </div>

              )}

            </div>

          </section>

        </div>

      )}


      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100%-2rem)] max-w-md sm:right-6 sm:top-6">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500" />
            <div className="flex items-start gap-3 p-4 pl-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={22} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900">{toast.title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{toast.message}</p>
              </div>
              <button type="button" onClick={() => setToast(null)} aria-label="Fermer la notification" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={17} /></button>
            </div>
            <div className="h-1 bg-emerald-100" />
          </div>
        </div>
      )}
    </main>

  );

}




function RepairRoadmap({ status }: { status?: string }) {
  const steps = [
    { title: "Ticket créé", description: "Demande enregistrée", statuses: ["EN_ATTENTE", "TICKET_CREE"], icon: FileText },
    { title: "Appareil reçu", description: "Réception en atelier", statuses: ["APPAREIL_RECU"], icon: Laptop },
    { title: "Diagnostic & devis", description: "Panne identifiée, devis préparé", statuses: ["DIAGNOSTIC", "DEVIS_ENVOYE", "DEVIS_ACCEPTE", "DEVIS_REFUSE"], icon: Search },
    { title: "Réparation", description: "Intervention technique", statuses: ["EN_REPARATION"], icon: Wrench },
    { title: "Contrôle final", description: "Tests et vérification", statuses: ["REPARATION_TERMINEE"], icon: CheckCircle2 },
    { title: "Prêt à récupérer", description: "Client invité à récupérer l'appareil", statuses: ["PRET_A_RECUPERER"], icon: Clock3 },
    { title: "Récupéré", description: "Dossier clôturé", statuses: ["RECUPERE"], icon: CheckCircle2 },
  ];
  const current = String(status || "TICKET_CREE").toUpperCase();
  const terminal = ["ANNULE", "IRREPARABLE", "DEVIS_REFUSE"].includes(current);
  const foundIndex = steps.findIndex((step) => step.statuses.includes(current));
  const activeIndex = Math.max(0, foundIndex);
  const isRecovered = current === "RECUPERE";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal-700">Parcours de réparation</p>
          <h3 className="mt-1 text-base font-extrabold text-slate-900">Roadmap du dossier</h3>
          <p className="mt-1 text-xs text-slate-500">Avancez étape par étape et gardez le client informé.</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${terminal ? "bg-rose-50 text-rose-700 ring-rose-200" : isRecovered ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-sky-50 text-sky-700 ring-sky-200"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${terminal ? "bg-rose-500" : isRecovered ? "bg-emerald-500" : "bg-sky-500"}`} />
          {terminal ? (current === "ANNULE" ? "Dossier annulé" : current === "IRREPARABLE" ? "Appareil irréparable" : "Devis refusé") : isRecovered ? "Parcours terminé" : `Étape ${activeIndex + 1} / ${steps.length}`}
        </span>
      </div>
      {terminal ? (
        <div className="flex items-start gap-3 bg-rose-50/70 p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-rose-600 shadow-sm"><AlertCircle size={20} /></span>
          <div>
            <p className="text-sm font-bold text-rose-900">{current === "ANNULE" ? "Cette réparation a été annulée." : current === "IRREPARABLE" ? "L'appareil est marqué comme irréparable." : "Le devis a été refusé."}</p>
            <p className="mt-1 text-xs leading-5 text-rose-800/80">Consultez l'historique du ticket avant toute nouvelle action.</p>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute left-[7%] right-[7%] top-5 h-1 rounded-full bg-slate-100" />
              <div className="absolute left-[7%] top-5 h-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500" style={{ width: `${(activeIndex / (steps.length - 1)) * 86}%` }} />
              <div className="relative grid grid-cols-7 gap-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const done = index < activeIndex || isRecovered;
                  const active = index === activeIndex && !isRecovered;
                  return (
                    <div key={step.title} className="flex min-w-0 flex-col items-center text-center">
                      <span className={`z-10 grid h-11 w-11 place-items-center rounded-full border-4 border-white shadow-sm ${done ? "bg-emerald-500 text-white" : active ? "bg-teal-700 text-white ring-4 ring-teal-100" : "bg-slate-100 text-slate-400"}`}>
                        {done ? <CheckCircle2 size={18} /> : <Icon size={17} />}
                      </span>
                      <p className={`mt-3 text-[11px] font-extrabold ${done ? "text-emerald-700" : active ? "text-teal-800" : "text-slate-500"}`}>{step.title}</p>
                      <p className="mt-1 max-w-[120px] text-[10px] leading-4 text-slate-400">{step.description}</p>
                      {active && <span className="mt-2 rounded-full bg-teal-50 px-2 py-1 text-[9px] font-bold text-teal-700">En cours</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-3 lg:hidden">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const done = index < activeIndex || isRecovered;
              const active = index === activeIndex && !isRecovered;
              return (
                <div key={step.title} className={`flex items-center gap-3 rounded-xl border p-3 ${active ? "border-teal-200 bg-teal-50/70" : done ? "border-emerald-100 bg-emerald-50/40" : "border-slate-100 bg-white"}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${done ? "bg-emerald-500 text-white" : active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-400"}`}>{done ? <CheckCircle2 size={17} /> : <Icon size={16} />}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800">{index + 1}. {step.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{step.description}</p>
                  </div>
                  {active && <span className="rounded-full bg-teal-100 px-2 py-1 text-[9px] font-bold text-teal-800">En cours</span>}
                  {done && <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />}
                </div>
              );
            })}
          </div>
          {current === "DEVIS_ENVOYE" && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <Clock3 size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div><p className="text-xs font-bold text-amber-900">En attente de la réponse du client</p><p className="mt-1 text-xs leading-5 text-amber-800">Ne démarrez pas la réparation avant l'acceptation du devis.</p></div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function InfoTile({ label, value, icon }: { label: string; value?: string | null; icon: React.ReactNode }) {

  return (

    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5">

      <span className="mt-0.5 text-slate-400">{icon}</span>

      <div className="min-w-0">

        <p className="text-xs font-medium text-slate-500">{label}</p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value || "—"}</p>

      </div>

    </div>

  );

}



function ActionButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {

  return (

    <button onClick={onClick} className={`rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${active ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"}`}>

      {children}

    </button>

  );

}
