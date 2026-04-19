import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Choisissez entre l’espace entretien et l’espace manager pour découvrir le prototype de transmission des savoirs.",
};

export default function Page() {
  return <HomePage />;
}
