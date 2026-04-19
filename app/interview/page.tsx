import { Suspense } from "react";
import type { Metadata } from "next";
import { InterviewExperience } from "@/components/interview/InterviewExperience";

export const metadata: Metadata = {
  title: "Espace entretien",
  description:
    "Conduisez un entretien guidé, par écrit ou à l’oral, pour capter le savoir-faire d’une personne-clé.",
};

export default function InterviewPage() {
  return (
    <Suspense fallback={null}>
      <InterviewExperience />
    </Suspense>
  );
}
