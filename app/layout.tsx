import type { Metadata } from "next";
import { IBM_Plex_Sans, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Agents — Command Deck",
  description: "Gerencie seus agentes de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${ibmPlex.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
