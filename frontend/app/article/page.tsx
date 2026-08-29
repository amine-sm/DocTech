import { Suspense } from "react";
import ArticleClient from "./ArticleClient";

export default function ArticlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ArticleClient />
    </Suspense>
  );
}
