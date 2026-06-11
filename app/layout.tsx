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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          background: "#0f172a",
          color: "#fff",
        }}
      >
        <header
          style={{
            background: "#111827",
            borderBottom: "2px solid #22c55e",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <img
            src="/jdcell-logo.png"
            alt="JD CELL"
            style={{
              height: "55px",
              width: "auto",
            }}
          />

          <div>
            <h2
              style={{
                margin: 0,
                color: "#22c55e",
              }}
            >
              JD CELL
            </h2>

            <small style={{ color: "#cbd5e1" }}>
              Assistência Técnica Especializada
            </small>
          </div>
        </header>

        <main style={{ flex: 1 }}>{children}</main>
      </body>
    </html>
  );
}