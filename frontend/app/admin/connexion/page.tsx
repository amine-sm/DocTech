"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LockKeyhole,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Activity,
} from "lucide-react";

import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@doctech.local");
  const [password, setPassword] = useState("");
  const [rememberMe, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(email, password, rememberMe);
      router.replace("/admin/dashboard");
    } catch (e: any) {
      setError(e.message || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fixed inset-0 z-[200] min-h-screen overflow-y-auto bg-[#f7f9fc]">
      <div className="flex min-h-screen">

        {/* =========================================================
            PANNEAU GAUCHE
        ========================================================= */}
        <section className="relative hidden min-h-screen w-1/2 overflow-hidden bg-[#061326] lg:flex">

          {/* Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,.38),transparent_35%)]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,rgba(14,165,233,.18),transparent_40%)]" />

          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Cercles décoratifs */}
          <div className="absolute -left-32 top-[18%] h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="absolute -right-32 bottom-[10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

          {/* Contenu */}
          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-12 xl:p-16">

            {/* =====================================================
                LOGO
            ===================================================== */}
            <div>
              <div className="inline-flex rounded-2xl bg-white px-5 py-3 shadow-xl">
                <Image
                  src="/images/logo-doctech.webp"
                  alt="DOCTECH"
                  width={240}
                  height={90}
                  priority
                  className="h-auto w-[190px] object-contain"
                />
              </div>

              <div className="mt-5 h-px w-20 bg-gradient-to-r from-blue-500 to-cyan-400" />
            </div>

            {/* =====================================================
                BRANDING
            ===================================================== */}
            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-md">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
                  <Sparkles
                    size={13}
                    className="text-blue-300"
                  />
                </span>

                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                  Espace administration
                </span>
              </div>

              <h2 className="text-5xl font-black leading-[1.05] tracking-[-0.045em] text-white xl:text-6xl">
                Gérez votre boutique
                <br />

                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  simplement.
                </span>
              </h2>

              <p className="mt-7 max-w-lg text-[15px] leading-7 text-slate-300/75">
                Une interface centralisée pour gérer vos articles,
                commandes, utilisateurs, stocks et statistiques depuis
                un seul espace.
              </p>

              {/* =================================================
                  FEATURES
              ================================================= */}
              <div className="mt-9 grid max-w-lg grid-cols-2 gap-3">

                {/* Gestion */}
                <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 backdrop-blur-sm">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                    <CheckCircle2
                      size={17}
                      className="text-blue-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white">
                      Gestion complète
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Produits & commandes
                    </p>
                  </div>

                </div>

                {/* Statistiques */}
                <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 backdrop-blur-sm">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                    <Activity
                      size={17}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white">
                      Suivi en temps réel
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Statistiques & activité
                    </p>
                  </div>

                </div>

              </div>

              {/* =================================================
                  SECURITE
              ================================================= */}
              <div className="mt-8 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                  <ShieldCheck
                    size={17}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Connexion sécurisée
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Vos données sont protégées
                  </p>
                </div>

              </div>

            </div>

            {/* =====================================================
                FOOTER GAUCHE
            ===================================================== */}
            <div className="flex items-center justify-between gap-5">

              <p className="text-[11px] font-medium text-slate-600">
                © {new Date().getFullYear()} DOCTECH
              </p>

              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Système opérationnel
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================
            PANNEAU DROIT - CONNEXION
        ========================================================= */}
        <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:w-1/2">

          {/* Background mobile */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,.10),transparent_45%)]" />

          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative z-10 w-full max-w-[430px]">

            {/* =====================================================
                LOGO MOBILE
            ===================================================== */}
            <div className="mb-9 flex justify-center lg:hidden">

              <div className="rounded-2xl bg-white px-5 py-3 shadow-lg">
                <Image
                  src="/images/logo-doctech.webp"
                  alt="DOCTECH"
                  width={220}
                  height={80}
                  priority
                  className="h-auto w-[175px] object-contain"
                />
              </div>

            </div>

            {/* =====================================================
                FORMULAIRE
            ===================================================== */}
            <form
              onSubmit={submit}
              className="w-full"
            >

              {/* Header */}
              <div className="mb-8">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/20">
                  <ShieldCheck size={24} />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  DOCTECH Administration
                </p>

                <h1 className="mt-2 text-[34px] font-black leading-tight tracking-[-0.04em] text-slate-950">
                  Bon retour 👋
                </h1>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Connectez-vous pour accéder à votre espace
                  d'administration.
                </p>

              </div>

              {/* =================================================
                  ERREUR
              ================================================= */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">

                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-[11px] font-black text-white">
                    !
                  </div>

                  <p className="text-xs font-semibold leading-5 text-red-700">
                    {error}
                  </p>

                </div>
              )}

              {/* =================================================
                  EMAIL
              ================================================= */}
              <label className="block">

                <span className="mb-2.5 block text-xs font-bold text-slate-700">
                  Adresse email
                </span>

                <div className="group relative">

                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  />

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    className="h-[54px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

              </label>

              {/* =================================================
                  MOT DE PASSE
              ================================================= */}
              <label className="mt-5 block">

                <div className="mb-2.5 flex items-center justify-between">

                  <span className="text-xs font-bold text-slate-700">
                    Mot de passe
                  </span>

                  <button
                    type="button"
                    className="text-[11px] font-bold text-blue-600 transition hover:text-blue-700"
                  >
                    Mot de passe oublié ?
                  </button>

                </div>

                <div className="group relative">

                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                  />

                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-[54px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  {/* Eye */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </label>

              {/* =================================================
                  REMEMBER ME
              ================================================= */}
              <label className="mt-5 flex cursor-pointer select-none items-center gap-2.5">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0"
                />

                <span className="text-xs font-semibold text-slate-600">
                  Se souvenir de moi sur cet appareil
                </span>

              </label>

              {/* =================================================
                  BOUTON CONNEXION
              ================================================= */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-6 flex h-[55px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    <span>
                      Connexion...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Se connecter
                    </span>

                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}

              </button>

              {/* =================================================
                  DIVIDER
              ================================================= */}
              <div className="my-7 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Accès restreint
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              {/* =================================================
                  SECURITE
              ================================================= */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <ShieldCheck
                      size={16}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-700">
                      Connexion protégée
                    </p>

                    <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                      Accès réservé aux administrateurs DOCTECH.
                    </p>
                  </div>

                </div>

              </div>

              {/* =================================================
                  FOOTER MOBILE
              ================================================= */}
              <p className="mt-7 text-center text-[10px] font-medium text-slate-400 lg:hidden">
                © {new Date().getFullYear()} DOCTECH — Administration
              </p>

            </form>

          </div>
        </section>

      </div>
    </main>
  );
}