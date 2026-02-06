import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AIVO - Fichas Técnicas",
  description: "Generador de fichas técnicas con IA para catálogos de producto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${sora.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <div className="flex h-screen bg-white overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
              <div className="max-w-6xl mx-auto px-6 py-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
