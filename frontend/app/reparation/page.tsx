"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Clock3,
  FileText,
  Hash,
  Laptop,
  Loader2,
  MessageCircle,
  PackageSearch,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  X,Send
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocale } from "@/components/LocaleProvider";
import { createRepair, getRepairTracking } from "@/lib/repair";

type RepairForm = {
  firstName: string;
  lastName: string;
  device: string;
  phone: string;
  serialNumber: string;
  problem: string;
  description: string;
};

type TrackingEvent = {
  status?: string;
  title?: string;
  label?: string;
  description?: string;
  message?: string;
  date?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
};

type TrackingResult = {
  code: string;
  status: string;
  device?: string;
  problem?: string;
  diagnosis?: string;
  estimatedCost?: string | number;
  updatedAt?: string;
  createdAt?: string;
  serialNumber?: string;
  history: TrackingEvent[];
};

const INITIAL_FORM: RepairForm = {
  firstName: "",
  lastName: "",
  device: "",
  phone: "",
  serialNumber: "",
  problem: "",
  description: "",
};

const REPAIR_STEPS = [
  {
    key: "recu",
    fr: "Appareil reçu",
    ar: "تم استلام الجهاز",
    descriptionFr: "Votre appareil a été réceptionné par notre équipe.",
    descriptionAr: "تم استلام جهازك من طرف فريقنا.",
    icon: PackageSearch,
  },
  {
    key: "diagnostic",
    fr: "Diagnostic",
    ar: "التشخيص",
    descriptionFr: "Nos techniciens identifient l'origine de la panne.",
    descriptionAr: "يقوم الفنيون بتحديد سبب العطل.",
    icon: Search,
  },
  {
    key: "en_reparation",
    fr: "En réparation",
    ar: "قيد الإصلاح",
    descriptionFr: "L'intervention technique est en cours.",
    descriptionAr: "عملية الإصلاح جارية.",
    icon: Wrench,
  },
  {
    key: "controle",
    fr: "Contrôle qualité",
    ar: "مراقبة الجودة",
    descriptionFr: "Nous vérifions le bon fonctionnement de l'appareil.",
    descriptionAr: "نتحقق من عمل الجهاز بشكل سليم.",
    icon: ClipboardCheck,
  },
  {
    key: "pret",
    fr: "Prêt à récupérer",
    ar: "جاهز للاستلام",
    descriptionFr: "Votre appareil est prêt à être récupéré.",
    descriptionAr: "جهازك جاهز للاستلام.",
    icon: CheckCircle2,
  },
] as const;

function normalizeStatus(value: string): string {
  const normalized = String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

  const aliases: Record<string, string> = {
    nouveau: "en_attente",
    ticket_cree: "en_attente",
    demande_creee: "en_attente",
    en_attente: "en_attente",
    recu: "recu",
    appareil_recu: "recu",
    receptionne: "recu",
    recu_en_atelier: "recu",
    diagnostic: "diagnostic",
    en_diagnostic: "diagnostic",
    devis_envoye: "diagnostic",
    devis_en_attente: "diagnostic",
    devis_accepte: "en_reparation",
    en_cours: "en_reparation",
    en_reparation: "en_reparation",
    reparation_en_cours: "en_reparation",
    controle: "controle",
    controle_qualite: "controle",
    test: "controle",
    pret: "pret",
    pret_a_recuperer: "pret",
    termine: "termine",
    reparation_terminee: "termine",
    termine_et_teste: "termine",
    recupere: "termine",
    livre: "termine",
    annule: "annule",
    annulee: "annule",
    irreparable: "annule",
  };

  return aliases[normalized] || normalized || "en_attente";
}

function getStepIndex(status: string): number {
  const normalized = normalizeStatus(status);
  if (normalized === "annule") return -1;
  if (normalized === "en_attente") return 0;
  if (normalized === "recu") return 0;
  if (normalized === "diagnostic") return 1;
  if (normalized === "en_reparation") return 2;
  if (normalized === "controle") return 3;
  if (normalized === "pret" || normalized === "termine") return 4;
  return 0;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

export default function ReparationPage() {
  const { text } = useLocale();
  const [form, setForm] = useState<RepairForm>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);

  const generatedCode = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem("doctech_repair_code") || "";
  }, [submitted]);

  const handleChange = (field: keyof RepairForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.firstName.trim()) {
      setError(text("Le prénom est obligatoire.", "الاسم مطلوب."));
      return;
    }
    if (!form.lastName.trim()) {
      setError(text("Le nom est obligatoire.", "اللقب مطلوب."));
      return;
    }
    if (!form.device.trim()) {
      setError(text("L'article est obligatoire.", "المنتج مطلوب."));
      return;
    }
    if (!form.phone.trim()) {
      setError(text("Le numéro de téléphone est obligatoire.", "رقم الهاتف مطلوب."));
      return;
    }
    if (!form.problem.trim()) {
      setError(text("Le type de panne est obligatoire.", "نوع العطل مطلوب."));
      return;
    }

    setLoading(true);
    try {
      const response = await createRepair({
        customer_name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        customer_phone: form.phone.trim(),
        device: form.device.trim(),
        serial_number: form.serialNumber.trim() || undefined,
        problem: form.problem.trim(),
        description: form.description.trim() || undefined,
      });

      const code = String(
        response?.data?.ticket_number ??
          response?.ticket_number ??
          response?.data?.code ??
          response?.code ??
          response?.trackingCode ??
          response?.reference ??
          ""
      ).trim();

      if (!code) {
        throw new Error("NO_CODE");
      }

      window.sessionStorage.setItem("doctech_repair_code", code);
      setTrackingCode(code);
      setSubmitted(true);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(
        message === "NO_CODE"
          ? text(
              "La demande a été créée mais le serveur n'a retourné aucune référence.",
              "تم إنشاء الطلب لكن الخادم لم يرجع رقم التتبع."
            )
          : message && message !== "CREATE_ERROR"
            ? message
            : text(
                "Impossible d'envoyer la demande. Vérifiez votre connexion et réessayez.",
                "تعذر إرسال الطلب. تحقق من الاتصال وحاول مرة أخرى."
              )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTracking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = trackingCode.trim();
    if (!code) {
      setTrackingError(text("Veuillez saisir votre référence.", "يرجى إدخال رقم التتبع."));
      return;
    }

    setTrackingLoading(true);
    setTrackingError("");
    setTrackingResult(null);

    try {
      const payload = await getRepairTracking(code);
      if (payload?.success === false) {
        throw new Error(payload?.message || "TRACKING_ERROR");
      }

      const repair =
        payload?.repair ??
        payload?.data?.repair ??
        payload?.data?.data?.repair ??
        payload?.data ??
        payload;

      const rawStatus = asText(repair?.status ?? repair?.statut ?? repair?.repair_status ?? "TICKET_CREE");
      const rawHistory =
        payload?.history ??
        payload?.data?.history ??
        payload?.data?.data?.history ??
        repair?.history ??
        repair?.events ??
        [];

      const history: TrackingEvent[] = Array.isArray(rawHistory)
        ? rawHistory.map((event: any) => ({
            status: asText(event?.status ?? event?.statut),
            title: asText(event?.title ?? event?.label ?? event?.name),
            description: asText(event?.description ?? event?.message ?? event?.comment),
            date: asText(event?.created_at ?? event?.createdAt ?? event?.date ?? event?.updated_at),
          }))
        : [];

      const cost =
        repair?.estimated_price ??
        repair?.estimated_cost ??
        repair?.estimatedCost ??
        repair?.prix ??
        repair?.cout ??
        "";

      setTrackingResult({
        code: asText(repair?.ticket_number ?? repair?.code ?? repair?.trackingCode ?? code),
        status: normalizeStatus(rawStatus),
        device: asText(repair?.device ?? repair?.article ?? repair?.appareil),
        problem: asText(repair?.problem ?? repair?.panne ?? repair?.type_panne),
        diagnosis: asText(repair?.diagnosis ?? repair?.diagnostic),
        estimatedCost: typeof cost === "number" ? cost : asText(cost),
        updatedAt: asText(repair?.updated_at ?? repair?.updatedAt ?? repair?.modified_at),
        createdAt: asText(repair?.created_at ?? repair?.createdAt ?? repair?.date_creation),
        serialNumber: asText(repair?.serial_number ?? repair?.serialNumber ?? repair?.numero_serie),
        history,
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setTrackingError(
        message === "NOT_FOUND"
          ? text(
              "Aucune réparation trouvée avec cette référence.",
              "لم يتم العثور على طلب إصلاح بهذه المرجعية."
            )
          : text(
              "Impossible de récupérer le suivi. Vérifiez votre référence.",
              "تعذر الحصول على حالة الإصلاح. تحقق من رقم التتبع."
            )
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setSubmitted(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900">
      <Header />
      <main className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute -right-40 top-80 h-[30rem] w-[30rem] rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute left-1/2 top-[48rem] h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-100/50 blur-3xl" />
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 sm:pt-10 lg:px-8 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative mb-8 overflow-hidden rounded-[30px] bg-[#06152b] shadow-[0_25px_70px_rgba(6,21,43,0.18)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(0,153,255,0.3),transparent_32%),radial-gradient(circle_at_12%_100%,rgba(34,211,238,0.12),transparent_35%)]" />
            <div className="absolute right-[-2rem] top-[-4rem] hidden h-80 w-80 rounded-full border border-cyan-300/15 lg:block" />
            <div className="absolute right-8 top-10 hidden h-64 w-64 rounded-full border border-cyan-300/10 lg:block" />
            <div className="relative grid gap-8 px-6 py-9 sm:px-10 sm:py-11 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
                  <Sparkles size={14} />
                  {text("Espace client · Suivi en temps réel", "فضاء العميل · متابعة مباشرة")}
                </div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-[46px]">
                  {text("Votre réparation, en toute ", "إصلاح جهازك بكل ")}
                  <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    {text("transparence.", "شفافية.")}
                  </span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                  {text(
                    "Suivez chaque étape de la prise en charge de votre appareil, du diagnostic jusqu'à sa récupération.",
                    "تابع كل مراحل معالجة جهازك، من التشخيص إلى الاستلام."
                  )}
                </p>
                <div className="mt-7 flex flex-wrap gap-2.5">
                  <HeroBadge icon={<ShieldCheck size={15} />} text={text("Suivi transparent", "متابعة شفافة")} />
                  <HeroBadge icon={<Wrench size={15} />} text={text("Techniciens experts", "فنيون خبراء")} />
                  <HeroBadge icon={<Clock3 size={15} />} text={text("Étapes actualisées", "مراحل محدثة")} />
                </div>
              </div>
              <div className="hidden h-36 w-36 items-center justify-center rounded-[34px] border border-white/10 bg-white/[0.07] text-cyan-300 shadow-2xl backdrop-blur sm:flex">
                <Laptop size={76} strokeWidth={1.2} />
              </div>
            </div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-8 rounded-[30px] border border-white bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)] sm:p-7 lg:p-8"
          >
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <PackageSearch size={22} />
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
                  {text("Suivre mon appareil", "تتبع جهازي")}
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  {text("Où en est ma réparation ?", "أين وصلت عملية الإصلاح؟")}
                </h2>
                <p className="mt-2 max-w-lg text-xs font-medium leading-6 text-slate-500">
                  {text(
                    "Entrez la référence reçue après votre demande pour consulter l'état actuel de votre réparation.",
                    "أدخل رقم التتبع الذي استلمته بعد الطلب لمعرفة الحالة الحالية لإصلاح جهازك."
                  )}
                </p>
              </div>

              <form onSubmit={handleTracking} className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-h-[54px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-sky-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-500/10">
                  <Search size={18} className="shrink-0 text-slate-400" />
                  <input
                    value={trackingCode}
                    onChange={(event) => {
                      setTrackingCode(event.target.value.toUpperCase());
                      setTrackingError("");
                    }}
                    placeholder={text("Ex. REP-2026-000001", "مثال: REP-2026-000001")}
                    aria-label={text("Référence de réparation", "رقم الإصلاح")}
                    className="w-full min-w-0 bg-transparent text-sm font-bold uppercase tracking-wide text-slate-800 outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#06152b] px-6 text-xs font-black text-white transition hover:bg-[#10345a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {trackingLoading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
                  {text("Voir le suivi", "عرض المتابعة")}
                  {!trackingLoading && <ArrowRight size={15} />}
                </button>
              </form>
            </div>

            <AnimatePresence>
              {trackingError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600"
                >
                  <span>{trackingError}</span>
                  <button type="button" onClick={() => setTrackingError("")} aria-label="Fermer">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {trackingResult && <TrackingCard result={trackingResult} text={text} />}
          </motion.section>

          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <motion.aside
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-5"
            >
              <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
                  {text("Comment ça marche", "كيف يعمل")}
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                  {text("Une prise en charge simple", "خدمة بسيطة وسهلة")}
                </h2>
                <div className="mt-6 space-y-5">
                  <Step number="01" title={text("Décrivez l'appareil", "أدخل معلومات الجهاز")} description={text("Indiquez le type d'appareil et son numéro de série si disponible.", "أدخل نوع الجهاز ورقمه التسلسلي إن توفر.")} />
                  <Step number="02" title={text("Expliquez la panne", "اشرح العطل")} description={text("Précisez les symptômes pour aider notre équipe à comprendre le problème.", "اشرح الأعراض لمساعدة فريقنا على فهم المشكلة.")} />
                  <Step number="03" title={text("Suivez les étapes", "تابع المراحل")} description={text("Utilisez votre référence pour consulter l'avancement de la réparation.", "استخدم رقم التتبع لمعرفة تقدم الإصلاح.")} />
                </div>
              </div>

              <div className="rounded-[28px] bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 ring-1 ring-sky-100 sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                  <MessageCircle size={21} />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900">
                  {text("Besoin d'aide ?", "هل تحتاج إلى مساعدة؟")}
                </h3>
                <p className="mt-2 text-xs font-medium leading-6 text-slate-600">
                  {text(
                    "Notre équipe peut vous renseigner sur votre demande et les prochaines étapes.",
                    "يمكن لفريقنا تقديم معلومات حول طلبك والمراحل القادمة."
                  )}
                </p>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#06152b] px-4 text-xs font-black text-white transition hover:bg-[#10345a]"
                >
                  <MessageCircle size={16} />
                  {text("Nous contacter", "اتصل بنا")}
                  <ArrowRight size={14} />
                </a>
              </div>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="rounded-[30px] border border-emerald-200 bg-white p-8 text-center shadow-[0_22px_65px_rgba(15,23,42,0.07)] sm:p-12"
                  >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                      <CheckCircle2 size={42} />
                    </div>
                    <h2 className="mt-6 text-2xl font-black text-slate-900">
                      {text("Demande enregistrée !", "تم تسجيل الطلب!")}
                    </h2>
                    {generatedCode && (
                      <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-slate-100 bg-slate-50 p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                          {text("Votre référence de suivi", "رقم التتبع الخاص بك")}
                        </p>
                        <p className="mt-2 break-all text-xl font-black tracking-wider text-[#06152b]">
                          {generatedCode}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setTrackingCode(generatedCode);
                            document.getElementById("repair-tracking")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="mt-3 text-xs font-bold text-sky-700 hover:text-sky-900"
                        >
                          {text("Utiliser cette référence", "استخدم رقم التتبع")}
                        </button>
                      </div>
                    )}
                    <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-7 text-slate-500">
                      {text(
                        "Conservez votre référence pour suivre l'avancement de la réparation.",
                        "احتفظ برقم التتبع لمعرفة تقدم عملية الإصلاح."
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="mt-7 rounded-2xl bg-[#06152b] px-6 py-3.5 text-xs font-black text-white transition hover:bg-[#10345a]"
                    >
                      {text("Nouvelle demande", "طلب جديد")}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_22px_65px_rgba(15,23,42,0.07)] sm:p-8"
                  >
                    <div className="mb-7 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
                          {text("Demande de réparation", "طلب إصلاح")}
                        </p>
                        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                          {text("Parlez-nous de votre appareil", "أخبرنا عن جهازك")}
                        </h2>
                        <p className="mt-2 text-xs leading-6 text-slate-500">
                          {text("Les champs marqués d'un astérisque sont obligatoires.", "الحقول المميزة بنجمة إلزامية.")}
                        </p>
                      </div>
                      <div className="hidden rounded-2xl bg-slate-50 p-3 text-slate-500 sm:block">
                        <Wrench size={21} />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field icon={<User size={16} />} label={text("Prénom", "الاسم")} required>
                          <input type="text" autoComplete="given-name" value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder={text("Ex. Ahmed", "مثال: أحمد")} className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" />
                        </Field>
                        <Field icon={<User size={16} />} label={text("Nom", "اللقب")} required>
                          <input type="text" autoComplete="family-name" value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder={text("Ex. Benali", "مثال: بن علي")} className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" />
                        </Field>
                      </div>

                      <Field icon={<Phone size={16} />} label={text("Numéro de téléphone", "رقم الهاتف")} required>
                        <input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="Ex. 0550 12 34 56" className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" />
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field icon={<Laptop size={16} />} label={text("Article / Appareil", "المنتج / الجهاز")} required>
                          <input type="text" value={form.device} onChange={(e) => handleChange("device", e.target.value)} placeholder={text("Ex. PC portable HP", "مثال: حاسوب HP")} className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" />
                        </Field>
                        <Field icon={<Hash size={16} />} label={text("Numéro de série", "الرقم التسلسلي")} hint={text("(optionnel)", "(اختياري)")}>
                          <input type="text" value={form.serialNumber} onChange={(e) => handleChange("serialNumber", e.target.value)} placeholder="Ex. SN-XXXX" className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" />
                        </Field>
                      </div>

                      <Field icon={<AlertTriangle size={16} />} label={text("Type de panne", "نوع العطل")} required>
                        <input type="text" value={form.problem} onChange={(e) => handleChange("problem", e.target.value)} placeholder={text("Ex. Ne démarre pas, écran cassé...", "مثال: لا يشتغل، الشاشة مكسورة...")} className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" />
                      </Field>

                      <div>
                        <label className="mb-2.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                          <FileText size={14} />
                          {text("Description du problème", "وصف المشكلة")}
                          <span className="font-semibold normal-case tracking-normal text-slate-400">({text("optionnel", "اختياري")})</span>
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) => handleChange("description", e.target.value)}
                          rows={4}
                          placeholder={text("Décrivez les symptômes, les messages d'erreur ou ce qui s'est passé...", "اشرح الأعراض أو رسائل الخطأ أو ما حدث...")}
                          className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400"
                        />
                      </div>

                      <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-sky-600" />
                        <div>
                          <p className="text-xs font-black text-slate-800">{text("Diagnostic avant devis", "التشخيص قبل عرض السعر")}</p>
                          <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
                            {text("Le prix final est communiqué après identification de la panne.", "يتم تحديد السعر النهائي بعد تشخيص العطل.")}
                          </p>
                        </div>
                      </div>

                      {error && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                          {error}
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileTap={{ scale: 0.985 }}
                        className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#06152b] px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(6,21,43,0.18)] transition hover:bg-[#10345a] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            {text("Envoi en cours...", "جارٍ الإرسال...")}
                          </>
                        ) : (
                          <>
                            <Send size={17} />
                            {text("Envoyer la demande", "إرسال الطلب")}
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </motion.button>
                      <p className="text-center text-[10px] font-semibold leading-5 text-slate-400">
                        {text(
                          "En envoyant ce formulaire, vous acceptez d'être contacté au sujet de votre demande.",
                          "بإرسال هذا النموذج، فإنك توافق على التواصل معك بخصوص طلبك."
                        )}
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function TrackingCard({
  result,
  text,
}: {
  result: TrackingResult;
  text: (fr: string, ar: string) => string;
}) {
  const status = normalizeStatus(result.status);
  const currentIndex = getStepIndex(status);
  const isCancelled = status === "annule";
  const isComplete = status === "termine" || status === "pret";
  const statusLabels: Record<string, [string, string, string]> = {
    en_attente: ["Demande enregistrée", "تم تسجيل الطلب", "bg-amber-50 text-amber-700 ring-amber-200"],
    recu: ["Appareil reçu", "تم استلام الجهاز", "bg-sky-50 text-sky-700 ring-sky-200"],
    diagnostic: ["En diagnostic", "قيد التشخيص", "bg-blue-50 text-blue-700 ring-blue-200"],
    en_reparation: ["En réparation", "قيد الإصلاح", "bg-indigo-50 text-indigo-700 ring-indigo-200"],
    controle: ["Contrôle qualité", "مراقبة الجودة", "bg-violet-50 text-violet-700 ring-violet-200"],
    pret: ["Prêt à récupérer", "جاهز للاستلام", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
    termine: ["Réparation terminée", "اكتمل الإصلاح", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
    annule: ["Demande annulée", "تم إلغاء الطلب", "bg-red-50 text-red-700 ring-red-200"],
  };
  const current = statusLabels[status] || [status.replaceAll("_", " "), status.replaceAll("_", " "), "bg-slate-100 text-slate-700 ring-slate-200"];
  const displaySteps = REPAIR_STEPS.map((step, index) => ({
    ...step,
    completed: !isCancelled && (isComplete || index < currentIndex),
    active: !isCancelled && !isComplete && index === currentIndex,
  }));

  const history = result.history.length
    ? [...result.history].sort((a, b) => {
        const dateA = new Date(a.date || "").getTime();
        const dateB = new Date(b.date || "").getTime();
        if (Number.isNaN(dateA) || Number.isNaN(dateB)) return 0;
        return dateA - dateB;
      })
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-7 overflow-hidden rounded-[26px] border border-slate-200 bg-[#fbfdff] p-4 sm:p-6"
    >
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{text("Référence", "رقم التتبع")}</p>
          <p className="mt-1 break-all text-lg font-black tracking-wide text-[#06152b] sm:text-xl">{result.code}</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-black ring-1 ${current[2]}`}>
          <CircleDot size={13} />
          {text(current[0], current[1])}
        </span>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MiniInfo label={text("Appareil", "الجهاز")} value={result.device || "—"} icon={<Laptop size={17} />} />
          <MiniInfo label={text("Panne", "العطل")} value={result.problem || "—"} icon={<Wrench size={17} />} />
          <MiniInfo label={text("Dernière mise à jour", "آخر تحديث")} value={formatDate(result.updatedAt || result.createdAt)} icon={<Clock3 size={17} />} />
        </div>
      </div>

      {isCancelled ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
          <AlertTriangle size={22} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-black">{text("Cette demande a été annulée.", "تم إلغاء هذا الطلب.")}</p>
            <p className="mt-1 text-xs leading-5">{text("Veuillez contacter notre équipe si vous souhaitez plus d'informations.", "يرجى التواصل مع فريقنا للمزيد من المعلومات.")}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-7 hidden md:block">
            <div className="relative">
              <div className="absolute left-[10%] right-[10%] top-5 h-1 rounded-full bg-slate-200" />
              <div
                className="absolute left-[10%] top-5 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-500"
                style={{ width: `${(Math.max(0, currentIndex) / (REPAIR_STEPS.length - 1)) * 80}%` }}
              />
              <div className="relative grid grid-cols-5 gap-2">
                {displaySteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                      <div className={`z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white shadow-sm transition ${
                        step.completed ? "bg-emerald-500 text-white" :
                        step.active ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                        "bg-slate-200 text-white"
                      }`}>
                        {step.completed ? <CheckCircle2 size={20} /> : step.active ? <Icon size={18} /> : <span className="text-sm font-black">{index + 1}</span>}
                      </div>
                      <p className={`mt-3 text-xs font-black ${step.active ? "text-blue-700" : step.completed ? "text-emerald-700" : "text-slate-500"}`}>
                        {text(step.fr, step.ar)}
                      </p>
                      {step.active && <span className="mt-1 rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">{text("Étape actuelle", "المرحلة الحالية")}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 md:hidden">
            {displaySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className={`flex items-start gap-3 rounded-2xl border p-3 ${
                  step.active ? "border-blue-200 bg-blue-50/70" : step.completed ? "border-emerald-100 bg-emerald-50/50" : "border-slate-100 bg-white"
                }`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    step.completed ? "bg-emerald-500 text-white" : step.active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {step.completed ? <CheckCircle2 size={18} /> : <Icon size={17} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900">{index + 1}. {text(step.fr, step.ar)}</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">{text(step.descriptionFr, step.descriptionAr)}</p>
                  </div>
                  {step.active && <span className="rounded-full bg-blue-100 px-2 py-1 text-[9px] font-black text-blue-700">{text("En cours", "جارية")}</span>}
                </div>
              );
            })}
          </div>

          <div className="mt-7 grid gap-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                {isComplete ? <CheckCircle2 size={24} /> : <Wrench size={24} />}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  {isComplete
                    ? text("Votre réparation est terminée", "اكتمل إصلاح جهازك")
                    : text(`Étape actuelle : ${REPAIR_STEPS[Math.max(0, currentIndex)]?.fr || "En cours"}`, `المرحلة الحالية: ${REPAIR_STEPS[Math.max(0, currentIndex)]?.ar || "قيد المعالجة"}`)}
                </p>
                <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-600">
                  {isComplete
                    ? text("Votre appareil est prêt. Contactez notre équipe pour organiser la récupération.", "جهازك جاهز. تواصل مع فريقنا لترتيب الاستلام.")
                    : text(REPAIR_STEPS[Math.max(0, currentIndex)]?.descriptionFr || "Notre équipe traite votre demande.", REPAIR_STEPS[Math.max(0, currentIndex)]?.descriptionAr || "يقوم فريقنا بمعالجة طلبك.")}
                </p>
              </div>
            </div>
            {result.estimatedCost !== "" && result.estimatedCost !== undefined && result.estimatedCost !== null && (
              <div className="rounded-xl border border-white bg-white/80 px-4 py-3 sm:min-w-36">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{text("Estimation", "التكلفة التقديرية")}</p>
                <p className="mt-1 text-sm font-black text-[#06152b]">{String(result.estimatedCost)} DA</p>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Laptop size={17} className="text-blue-600" />
                {text("Détails de votre appareil", "تفاصيل الجهاز")}
              </h3>
              <div className="mt-4 space-y-3">
                <DetailRow label={text("Appareil", "الجهاز")} value={result.device || "—"} />
                <DetailRow label={text("Panne", "العطل")} value={result.problem || "—"} />
                <DetailRow label={text("Numéro de série", "الرقم التسلسلي")} value={result.serialNumber || "—"} />
                <DetailRow label={text("Diagnostic", "التشخيص")} value={result.diagnosis || "—"} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Clock3 size={17} className="text-blue-600" />
                {text("Historique de suivi", "سجل المتابعة")}
              </h3>
              {history.length > 0 ? (
                <div className="mt-4 space-y-0">
                  {history.map((event, index) => (
                    <div key={`${event.date || event.status || "event"}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                      {index !== history.length - 1 && <span className="absolute left-[13px] top-7 h-full w-px bg-slate-200" />}
                      <div className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${index === history.length - 1 ? "bg-blue-600 text-white" : "bg-emerald-500 text-white"}`}>
                        {index === history.length - 1 ? <CircleDot size={14} /> : <CheckCircle2 size={15} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row">
                          <p className="text-xs font-black text-slate-900">{event.title || statusTitle(event.status || "", text)}</p>
                          {event.date && <time className="text-[10px] font-semibold text-slate-400">{formatDate(event.date)}</time>}
                        </div>
                        {event.description && <p className="mt-1 text-[11px] leading-5 text-slate-500">{event.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-600">{text("L'historique détaillé sera affiché lorsque votre serveur retournera les événements de suivi.", "سيظهر سجل المتابعة المفصل عندما يعيد الخادم أحداث التتبع.")}</p>
                  <p className="mt-2 text-[10px] leading-5 text-slate-400">{text("Statut actuel", "الحالة الحالية")}: {text(current[0], current[1])}</p>
                  {result.updatedAt && <p className="mt-1 text-[10px] text-slate-400">{formatDate(result.updatedAt)}</p>}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </motion.div>
  );
}

function statusTitle(status: string, text: (fr: string, ar: string) => string) {
  const key = normalizeStatus(status);
  const labels: Record<string, [string, string]> = {
    en_attente: ["Demande enregistrée", "تم تسجيل الطلب"],
    recu: ["Appareil reçu", "تم استلام الجهاز"],
    diagnostic: ["Diagnostic commencé", "بدأ التشخيص"],
    en_reparation: ["Réparation commencée", "بدأ الإصلاح"],
    controle: ["Contrôle qualité", "مراقبة الجودة"],
    pret: ["Prêt à récupérer", "جاهز للاستلام"],
    termine: ["Réparation terminée", "اكتمل الإصلاح"],
    annule: ["Demande annulée", "تم إلغاء الطلب"],
  };
  const label = labels[key] || [status.replaceAll("_", " "), status.replaceAll("_", " ")];
  return text(label[0], label[1]);
}

function MiniInfo({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 break-words text-xs font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <span className="break-words text-right text-[11px] font-black text-slate-800">{value}</span>
    </div>
  );
}

function HeroBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-bold text-slate-200 backdrop-blur">
      <span className="text-cyan-300">{icon}</span>
      {text}
    </span>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#06152b] text-[10px] font-black text-cyan-300">{number}</div>
      <div>
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  required = false,
  hint,
  children,
}: {
  icon: ReactNode;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {icon}
        <span>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
          {hint && <span className="ml-1 font-semibold normal-case tracking-normal text-slate-400">{hint}</span>}
        </span>
      </label>
      <div className="flex min-h-[50px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-sky-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-500/10">
        {children}
      </div>
    </div>
  );
}
