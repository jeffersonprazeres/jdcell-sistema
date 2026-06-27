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
  themeColor: "#22c55e",
  appleWebApp: {
    capable: true,
    title: "JD CELL",
    statusBarStyle: "black-translucent",
  },
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
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "transparent",
          color: "#fff",
        }}
      >
        <header
          style={{
            background: "rgba(17, 24, 39, 0.95)",
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

        <main>{children}</main>
      </body>
    </html>
  );
}