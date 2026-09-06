import { Suspense } from "react";
import ArticleAdminClient from "./ArticleAdminClient";

export default function AdminArticlePage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-[28px] bg-white" />}>
      <ArticleAdminClient />
    </Suspense>
  );
}
