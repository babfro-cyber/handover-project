import { Suspense } from "react";
import type { Metadata } from "next";
import { OutputReviewExperience } from "@/components/output/OutputReviewExperience";

export const metadata: Metadata = {
  title: "Espace manager",
  description:
    "Retrouvez les personnes interrogées, suivez leur avancement et ouvrez leur dossier de savoir-faire.",
};

export default function OutputPage() {
  return (
    <Suspense fallback={null}>
      <OutputReviewExperience />
    </Suspense>
  );
}
