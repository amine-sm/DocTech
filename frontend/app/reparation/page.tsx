"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  User,
  Phone,
  Laptop,
  Hash,
  AlertTriangle,
  FileText,
  Send,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Clock3,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Search,
  PackageSearch,
  CircleDot,
  ClipboardCheck,
  X,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocale } from "@/components/LocaleProvider";

const REPAIR_CREATE_API = "/api/reparations";
const REPAIR_TRACKING_API = "/api/reparations/tracking";

type RepairForm = {
  firstName: string;
  lastName: string;
  device: string;
  phone: string;
  serialNumber: string;
  problem: string;
  description: string;
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
    setForm((prev) => ({ ...prev, [field]: value }));
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
      setError(
        text(
          "Le numéro de téléphone est obligatoire.",
          "رقم الهاتف مطلوب."
        )
      );
      return;
    }

    if (!form.problem.trim()) {
      setError(
        text(
          "Le type de panne est obligatoire.",
          "نوع العطل مطلوب."
        )
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(REPAIR_CREATE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("CREATE_ERROR");
      }

      const data = await response.json();

      const code =
        data?.code ||
        data?.trackingCode ||
        data?.reference ||
        data?.data?.code ||
        "";

      if (!code) {
        throw new Error("NO_CODE");
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "doctech_repair_code",
          code
        );
      }

      setSubmitted(true);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "NO_CODE"
          ? text(
              "La demande a été créée mais aucune référence n'a été retournée par le serveur.",
              "تم إنشاء الطلب لكن الخادم لم يرجع رقم التتبع."
            )
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
      setTrackingError(
        text("Veuillez saisir votre référence.", "يرجى إدخال رقم التتبع.")
      );
      return;
    }

    setTrackingLoading(true);
    setTrackingError("");
    setTrackingResult(null);

    try {
      const response = await fetch(
        `${REPAIR_TRACKING_API}/${encodeURIComponent(code)}`
      );

      if (!response.ok) {
        if (response.status === 404) throw new Error("NOT_FOUND");
        throw new Error("TRACKING_ERROR");
      }

      const data = await response.json();

      setTrackingResult({
        code: data?.code || data?.trackingCode || code,
        status: data?.status || data?.statut || "en_attente",
        device: data?.device || data?.article || data?.appareil || "",
        problem: data?.problem || data?.panne || data?.type_panne || "",
        diagnosis: data?.diagnosis || data?.diagnostic || "",
        estimatedCost: data?.estimatedCost || data?.prix || data?.cout || "",
        updatedAt: data?.updatedAt || data?.updated_at || data?.date_update || "",
      });
    } catch (e) {
      setTrackingError(
        e instanceof Error && e.message === "NOT_FOUND"
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
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <Header />

      <main className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute -right-40 top-80 h-[30rem] w-[30rem] rounded-full bg-blue-200/25 blur-3xl" />
          <div className="absolute left-1/2 top-[42rem] h-72 w-72 -translate-x-1/2 rounded-full bg-slate-200/50 blur-3xl" />
        </div>

        <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pb-24">
          {/* Breadcrumb / eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 text-[11px] font-bold text-slate-500"
          >
            <span>DOCTECH</span>
            <ArrowRight size={13} />
            <span className="text-[#0d2948]">
              {text("Réparation", "الإصلاح")}
            </span>
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8 overflow-hidden rounded-[32px] bg-[#06152b] shadow-[0_25px_70px_rgba(6,21,43,0.18)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_15%_90%,rgba(59,130,246,0.18),transparent_30%)]" />

            <div className="relative grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14 lg:py-12">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200">
                  <Sparkles size={13} />
                  {text("Assistance technique", "الدعم التقني")}
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {text(
                    "Votre appareil mérite un diagnostic professionnel.",
                    "جهازك يستحق تشخيصاً احترافياً."
                  )}
                </h1>

                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-[15px]">
                  {text(
                    "Décrivez votre panne en quelques étapes. Notre équipe vous contacte sur contact pour comprendre le problème et vous proposer la meilleure solution.",
                    "صف العطل في بضع خطوات. سيتواصل معك فريقنا عبر واتساب لفهم المشكلة واقتراح الحل المناسب."
                  )}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <HeroBadge
                    icon={<ShieldCheck size={15} />}
                    text={text("Diagnostic professionnel", "تشخيص احترافي")}
                  />
                  <HeroBadge
                    icon={<Clock3 size={15} />}
                    text={text("Réponse rapide", "رد سريع")}
                  />
                  <HeroBadge
                    icon={<MessageCircle size={15} />}
                    text={text("Contact contact", "تواصل عبر واتساب")}
                  />
                </div>
              </div>

              <div className="hidden h-28 w-28 items-center justify-center rounded-[30px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur sm:flex">
                <Wrench size={48} className="text-cyan-300" strokeWidth={1.7} />
              </div>
            </div>
          </motion.div>

          {/* ================= SUIVI ================= */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-8 rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-7"
          >
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                  <PackageSearch size={21} />
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600">
                  {text("Suivi réparation", "تتبع الإصلاح")}
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  {text("Où en est ma réparation ?", "أين وصلت عملية الإصلاح؟")}
                </h2>
                <p className="mt-2 text-xs font-medium leading-6 text-slate-500">
                  {text(
                    "Entrez la référence reçue après votre demande pour consulter l'état actuel de votre réparation.",
                    "أدخل رقم التتبع الذي استلمته بعد الطلب لمعرفة الحالة الحالية لإصلاح جهازك."
                  )}
                </p>
              </div>

              <form onSubmit={handleTracking} className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-h-[54px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
                  <Search size={18} className="text-slate-400" />
                  <input
                    value={trackingCode}
                    onChange={(e) => {
                      setTrackingCode(e.target.value.toUpperCase());
                      setTrackingError("");
                    }}
                    placeholder={text("Ex : REP-ABC1234", "مثال: REP-ABC1234")}
                    className="w-full bg-transparent text-sm font-bold uppercase tracking-wide text-slate-800 outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#06152b] px-6 text-xs font-black text-white transition hover:bg-[#0d2948] disabled:opacity-60"
                >
                  {trackingLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Search size={17} />
                  )}
                  {text("Voir le suivi", "عرض الحالة")}
                </button>
              </form>
            </div>

            {trackingError && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                <span>{trackingError}</span>
                <button type="button" onClick={() => setTrackingError("")}>
                  <X size={16} />
                </button>
              </div>
            )}

            {trackingResult && <TrackingCard result={trackingResult} text={text} />}
          </motion.section>

          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
            {/* Information panel */}
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600">
                  {text("Comment ça marche", "كيف يعمل")}
                </p>

                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                  {text(
                    "Une prise en charge simple",
                    "عملية بسيطة وسهلة"
                  )}
                </h2>

                <div className="mt-6 space-y-5">
                  <Step
                    number="01"
                    title={text("Décrivez l'appareil", "أدخل معلومات الجهاز")}
                    description={text(
                      "Indiquez le type d'appareil et, si disponible, son numéro de série.",
                      "أدخل نوع الجهاز ورقمه التسلسلي إن كان متوفراً."
                    )}
                  />
                  <Step
                    number="02"
                    title={text("Expliquez la panne", "اشرح العطل")}
                    description={text(
                      "Donnez-nous les informations utiles pour comprendre le problème.",
                      "قدم لنا المعلومات التي تساعدنا على فهم المشكلة."
                    )}
                  />
                  <Step
                    number="03"
                    title={text("Recevez notre réponse", "استلم الرد")}
                    description={text(
                      "Votre demande est préparée pour contact afin de faciliter le contact.",
                      "يتم تجهيز طلبك عبر واتساب لتسهيل التواصل."
                    )}
                  />
                </div>
              </div>

              <div className="rounded-[28px] bg-gradient-to-br from-cyan-50 to-blue-50 p-6 ring-1 ring-cyan-100 sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm">
                  <MessageCircle size={21} />
                </div>

                <h3 className="mt-4 text-base font-black text-slate-900">
                  {text(
                    "Contact rapide via contact",
                    "تواصل سريع عبر واتساب"
                  )}
                </h3>

                <p className="mt-2 text-xs font-medium leading-6 text-slate-600">
                  {text(
                    "Après l'envoi, contact s'ouvre avec votre demande déjà préparée.",
                    "بعد الإرسال، سيتم فتح واتساب مع تجهيز طلبك مسبقاً."
                  )}
                </p>
              </div>
            </motion.aside>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="rounded-[30px] border border-emerald-200 bg-white p-8 text-center shadow-[0_22px_65px_rgba(15,23,42,0.08)] sm:p-12"
                  >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle2
                        size={40}
                        className="text-emerald-500"
                        strokeWidth={2}
                      />
                    </div>

                    <h2 className="mt-6 text-2xl font-black text-slate-900">
                      {text("Demande préparée !", "تم تجهيز الطلب!")}
                    </h2>

                    {generatedCode && (
                      <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                          {text("Votre référence de suivi", "رقم التتبع الخاص بك")}
                        </p>
                        <p className="mt-1 text-lg font-black tracking-wider text-[#06152b]">
                          {generatedCode}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                          {text(
                            "Conservez cette référence pour vérifier l'état de la réparation.",
                            "احتفظ بهذا الرقم للتحقق من حالة الإصلاح."
                          )}
                        </p>
                      </div>
                    )}

                    <p className="mx-auto mt-3 max-w-lg text-sm font-medium leading-7 text-slate-500">
                      {text(
                        "Votre demande a été préparée pour contact. Il ne reste plus qu'à confirmer l'envoi et nous pourrons commencer le diagnostic.",
                        "تم تجهيز طلبك عبر واتساب. ما عليك سوى تأكيد الإرسال حتى نتمكن من بدء التشخيص."
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="mt-7 rounded-2xl bg-[#06152b] px-6 py-3.5 text-xs font-black text-white transition hover:bg-[#0d2948] active:scale-[0.98]"
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
                    className="rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] sm:p-8"
                  >
                    <div className="mb-7 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600">
                          {text("Demande de réparation", "طلب إصلاح")}
                        </p>
                        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                          {text(
                            "Parlez-nous de votre appareil",
                            "أخبرنا عن جهازك"
                          )}
                        </h2>
                      </div>

                      <div className="hidden rounded-2xl bg-slate-50 p-3 text-slate-500 sm:block">
                        <Wrench size={20} />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          icon={<User size={16} />}
                          label={text("Prénom", "الاسم")}
                          required
                        >
                          <input
                            type="text"
                            value={form.firstName}
                            onChange={(e) =>
                              handleChange("firstName", e.target.value)
                            }
                            placeholder={text("Ex : Ahmed", "مثال: أحمد")}
                            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                          />
                        </Field>

                        <Field
                          icon={<User size={16} />}
                          label={text("Nom", "اللقب")}
                          required
                        >
                          <input
                            type="text"
                            value={form.lastName}
                            onChange={(e) =>
                              handleChange("lastName", e.target.value)
                            }
                            placeholder={text("Ex : Benali", "مثال: بن علي")}
                            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                          />
                        </Field>
                      </div>

                      <Field
                        icon={<Phone size={16} />}
                        label={text("Numéro de téléphone", "رقم الهاتف")}
                        required
                      >
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            handleChange("phone", e.target.value)
                          }
                          placeholder={text(
                            "Ex : 0550 12 34 56",
                            "مثال: 0550 12 34 56"
                          )}
                          className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          icon={<Laptop size={16} />}
                          label={text("Article / Appareil", "المنتج / الجهاز")}
                          required
                        >
                          <input
                            type="text"
                            value={form.device}
                            onChange={(e) =>
                              handleChange("device", e.target.value)
                            }
                            placeholder={text(
                              "Ex : PC portable HP",
                              "مثال: حاسوب محمول HP"
                            )}
                            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                          />
                        </Field>

                        <Field
                          icon={<Hash size={16} />}
                          label={text("Numéro de série", "الرقم التسلسلي")}
                          hint={text("(optionnel)", "(اختياري)")}
                        >
                          <input
                            type="text"
                            value={form.serialNumber}
                            onChange={(e) =>
                              handleChange("serialNumber", e.target.value)
                            }
                            placeholder={text(
                              "Ex : SN-XXXX",
                              "مثال: SN-XXXX"
                            )}
                            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                          />
                        </Field>
                      </div>

                      <Field
                        icon={<AlertTriangle size={16} />}
                        label={text("Type de panne", "نوع العطل")}
                        required
                      >
                        <input
                          type="text"
                          value={form.problem}
                          onChange={(e) =>
                            handleChange("problem", e.target.value)
                          }
                          placeholder={text(
                            "Ex : Ne démarre pas, écran cassé...",
                            "مثال: لا يشتغل، الشاشة مكسورة..."
                          )}
                          className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </Field>

                      <div>
                        <label className="mb-2.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                          <FileText size={14} />
                          {text(
                            "Description du problème",
                            "وصف المشكلة"
                          )}
                        </label>

                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            handleChange("description", e.target.value)
                          }
                          rows={5}
                          placeholder={text(
                            "Décrivez les symptômes, les messages d'erreur ou ce qui s'est passé...",
                            "اشرح الأعراض أو رسائل الخطأ أو ما حدث..."
                          )}
                          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-400"
                        />
                      </div>

                      <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                        <div className="mt-0.5 text-cyan-600">
                          <ShieldCheck size={19} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            {text(
                              "Diagnostic avant devis",
                              "التشخيص قبل عرض السعر"
                            )}
                          </p>
                          <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
                            {text(
                              "Le prix final est communiqué après identification de la panne.",
                              "يتم تحديد السعر النهائي بعد تشخيص العطل."
                            )}
                          </p>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600"
                        >
                          {error}
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileTap={{ scale: 0.985 }}
                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#06152b] px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(6,21,43,0.18)] transition hover:bg-[#0d2948] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            {text("Préparation...", "جارٍ التحضير...")}
                          </>
                        ) : (
                          <>
                            <MessageCircle size={18} />
                            {text(
                              "Envoyer la demande",
                              "إرسال الطلب"
                            )}
                            <ArrowRight
                              size={16}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </motion.button>

                      <p className="text-center text-[10px] font-semibold text-slate-400">
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

type TrackingResult = {
  code: string;
  status: string;
  device?: string;
  problem?: string;
  diagnosis?: string;
  estimatedCost?: string;
  updatedAt?: string;
};

function TrackingCard({
  result,
  text,
}: {
  result: TrackingResult;
  text: (fr: string, ar: string) => string;
}) {
  const status = normalizeStatus(result.status);

  const statuses: Record<string, [string, string, string]> = {
    en_attente: ["En attente", "في الانتظار", "bg-amber-50 text-amber-700 ring-amber-200"],
    recu: ["Appareil reçu", "تم استلام الجهاز", "bg-blue-50 text-blue-700 ring-blue-200"],
    diagnostic: ["Diagnostic", "قيد التشخيص", "bg-violet-50 text-violet-700 ring-violet-200"],
    en_reparation: ["En réparation", "قيد الإصلاح", "bg-cyan-50 text-cyan-700 ring-cyan-200"],
    pret: ["Prêt", "جاهز", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
    termine: ["Terminé", "مكتمل", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
    annule: ["Annulé", "ملغى", "bg-red-50 text-red-700 ring-red-200"],
  };

  const current =
    statuses[status] || [result.status.replaceAll("_", " "), result.status, "bg-slate-100 text-slate-700 ring-slate-200"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            {text("Référence", "المرجعية")}
          </p>
          <p className="mt-1 text-lg font-black tracking-wider text-[#06152b]">
            {result.code}
          </p>
        </div>

        <span className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-2 text-[10px] font-black ring-1 ${current[2]}`}>
          <CircleDot size={13} />
          {text(current[0], current[1])}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          [text("Appareil", "الجهاز"), result.device || "—"],
          [text("Panne", "العطل"), result.problem || "—"],
          [text("Diagnostic", "التشخيص"), result.diagnosis || "—"],
          [text("Dernière mise à jour", "آخر تحديث"), result.updatedAt || "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-xs font-bold leading-5 text-slate-800">
              {value}
            </p>
          </div>
        ))}
      </div>

      {result.estimatedCost && (
        <div className="mt-3 rounded-2xl bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
            {text("Estimation", "التقدير")}
          </p>
          <p className="mt-1 text-sm font-black text-slate-900">
            {result.estimatedCost}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function normalizeStatus(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");
}

function HeroBadge({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-bold text-slate-200 backdrop-blur">
      {icon}
      {text}
    </span>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#06152b] text-[10px] font-black text-cyan-300">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
          {description}
        </p>
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
          {hint && (
            <span className="ml-1 font-semibold normal-case text-slate-400">
              {hint}
            </span>
          )}
        </span>
      </label>

      <div className="flex min-h-[50px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
        {children}
      </div>
    </div>
  );
}
