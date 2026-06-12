import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JD CELL",
  description: "Sistema de Assistência Técnica JD CELL",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        style={{
          backgroundColor: "#0f172a",
          color: "#fff",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        {/* Marca d'água */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 999,
          }}
        >
          <img
            src="/jdcell-logo.png"
            alt="JD CELL"
            style={{
              width: "900px",
              maxWidth: "80vw",
              opacity: 0.5,
            }}
          />
        </div>

        {/* Cabeçalho */}
        <header
          style={{
            background: "#111827",
            borderBottom: "2px solid #22c55e",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            position: "relative",
            zIndex: 1000,
          }}
        >
          <img
            src="/jdcell-logo.png"
            alt="JD CELL"
            style={{
              height: "60px",
              width: "auto",
            }}
          />

          <div>
            <h2
              style={{
                margin: 0,
                color: "#22c55e",
                fontSize: "34px",
              }}
            >
              JD CELL
            </h2>

            <small
              style={{
                color: "#cbd5e1",
                fontSize: "15px",
              }}
            >
              Assistência Técnica Especializada
            </small>
          </div>
        </header>

        {/* Conteúdo */}
        <main
          style={{
            position: "relative",
            zIndex: 1000,
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}