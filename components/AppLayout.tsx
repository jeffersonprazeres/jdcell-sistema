import { ReactNode } from "react";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
  funcao: string;
  titulo: string;
  children: ReactNode;
};

export default function AppLayout({ funcao, titulo, children }: AppLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
      }}
    >
      <Sidebar funcao={funcao} />

      <main
        style={{
          padding: "30px",
          paddingLeft: "240px",
          boxSizing: "border-box",
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <h1
          style={{
            color: "#22c55e",
            marginBottom: "25px",
          }}
        >
          {titulo}
        </h1>

        <div
          style={{
            width: "100%",
            maxWidth: "1180px",
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}