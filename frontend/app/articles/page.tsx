import { Suspense } from "react";
import ArticlesClient from "./ArticlesClient";

function ArticlesLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-slate-100" />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-[390px] animate-pulse rounded-[26px] bg-slate-100"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<ArticlesLoading />}>
      <ArticlesClient />
    </Suspense>
  );
}