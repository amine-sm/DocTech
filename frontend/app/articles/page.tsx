import { Suspense } from "react";
import ArticlesClient from "./ArticlesClient";

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ArticlesClient />
    </Suspense>
  );
}
