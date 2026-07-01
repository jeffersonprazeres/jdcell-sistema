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
        display: "flex",
        width: "100%",
      }}
    >
      <Sidebar funcao={funcao} />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "30px",
          boxSizing: "border-box",
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

        {children}
      </main>
    </div>
  );
}