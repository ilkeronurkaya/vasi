import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vasi — Geleceğe Mesaj Bırak",
  description: "Vasi ile sevdiklerine zaman aşımına uğramayan mesajlar gönder. Tarihli, tetikleyici tabanlı veya miras mesajları yaz.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={font.variable}>{children}</body>
    </html>
  );
}
