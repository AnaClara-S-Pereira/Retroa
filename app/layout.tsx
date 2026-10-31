// LAYOUT RAIZ: METADADOS DO SITE E FONTE PLAYFAIR USADA NOS TITULOS (CLASSE font-vintage).
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Retrôa",
  description: "Loja de Antiguidades",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`scroll-smooth ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
