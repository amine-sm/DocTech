"use client";

import {
  Suspense,
  type FormEvent,
  useState,
} from "react";

import {
  CheckCircle2,
  PackageSearch,
  Phone,
  Search,
  Truck,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatPrice } from "@/lib/catalog";

function TrackingPageContent() {
  const [tracking, setTracking] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiFetch<any>(
        `/public/suivi-commande?trackingNumber=${encodeURIComponent(
          tracking.trim(),
        )}&phone=${encodeURIComponent(
          phone.trim(),
        )}`,
      );

      setResult(response?.data ?? response);
    } catch (e: any) {
      setError(
        e?.message || "Commande introuvable.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-20">
        <div className="rounded-[32px] bg-[#07111f] p-6 text-white shadow-2xl sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500">
            <PackageSearch size={22} />
          </div>

          <p className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">
            Elogistia
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Suivre ma commande
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Entrez votre numéro de suivi et le téléphone utilisé lors de
            la commande.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 grid gap-3 sm:grid-cols-[1fr_220px_auto]"
          >
            <label className="rounded-2xl bg-white/5 p-3 ring-1 ring-inset ring-white/10">
              <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-slate-500">
                <Truck size={12} />
                Tracking
              </span>

              <input
                required
                value={tracking}
                onChange={(e) =>
                  setTracking(e.target.value)
                }
                placeholder="ELO-... / SEG-..."
                className="mt-2 w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600"
              />
            </label>

            <label className="rounded-2xl bg-white/5 p-3 ring-1 ring-inset ring-white/10">
              <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-slate-500">
                <Phone size={12} />
                Téléphone
              </span>

              <input
                required
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="05 / 06 / 07..."
                className="mt-2 w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-600"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-60"
            >
              <Search size={15} />

              {loading
                ? "Recherche…"
                : "Suivre"}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-500">
                  Commande
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {result.delivery_tracking ||
                    result.tracking_number ||
                    "—"}
                </h2>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[9px] font-black text-emerald-600">
                <CheckCircle2 size={13} />
                {result.status || "—"}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info
                label="Client"
                value={result.customer_name}
              />

              <Info
                label="Livraison"
                value={`${result.wilaya || ""}${
                  result.commune
                    ? ` • ${result.commune}`
                    : ""
                }`}
              />

              <Info
                label="Type"
                value={result.delivery_type}
              />

              <Info
                label="Total"
                value={formatPrice(
                  Number(result.total || 0),
                )}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-20">
              <div className="h-[420px] animate-pulse rounded-[32px] bg-[#07111f]" />
            </div>
          </div>
        }
      >
        <TrackingPageContent />
      </Suspense>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <p className="mt-1 text-sm font-black text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}