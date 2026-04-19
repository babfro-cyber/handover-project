import type { Metadata } from "next";
import { I18nProvider } from "@/components/shared/I18nProvider";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Transmission des savoirs",
    template: "%s | Transmission des savoirs",
  },
  description:
    "Prototype léger pour interroger une personne-clé, conserver son savoir-faire métier et relire les dossiers côté manager.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${newsreader.variable} ${sourceSans.variable} h-full`}>
      <body className="min-h-full">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
