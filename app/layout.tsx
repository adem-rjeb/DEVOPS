import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSession } from "@/lib/auth";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bibliothèque",
  description: "Gestion simple d'une bibliothèque",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <SiteHeader session={session} />
        {children}
        <footer className="footer">
          Une bibliothèque plus simple, chaque jour.
        </footer>
      </body>
    </html>
  );
}
