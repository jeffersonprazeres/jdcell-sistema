import { ReactNode } from "react";

type Props = {
  titulo: string;
  children: ReactNode;
};

export default function PageContainer({ titulo, children }: Props) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#22c55e",
            marginBottom: "25px",
            fontSize: "34px",
          }}
        >
          {titulo}
        </h1>

        <div
          style={{
            background: "rgba(30,41,59,0.92)",
            borderRadius: "16px",
            padding: "25px",
            boxShadow: "0 10px 30px rgba(0,0,0,.30)",
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}