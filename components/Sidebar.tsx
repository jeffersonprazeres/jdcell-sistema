"use client";

type SidebarProps = {
  funcao: string;
};

export default function Sidebar({ funcao }: SidebarProps) {
  const admin = funcao === "Administrador";
  const atendente = funcao === "Atendente";
  const tecnico = funcao === "Tecnico";

  const Item = ({
    texto,
    rota,
    mostrar = true,
  }: {
    texto: string;
    rota: string;
    mostrar?: boolean;
  }) => {
    if (!mostrar) return null;

    return (
      <button
        onClick={() => (window.location.href = rota)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "10px",
          background: "#182235",
          border: "1px solid #2b3a55",
          color: "#fff",
          borderRadius: "10px",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "15px",
        }}
      >
        {texto}
      </button>
    );
  };

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "220px",
        height: "100vh",
        background: "#0f172a",
        borderRight: "1px solid #22c55e",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          color: "#22c55e",
          marginBottom: "30px",
        }}
      >
        JD CELL
      </h2>

      <Item texto="Dashboard" rota="/dashboard" />
      <Item texto="Clientes" rota="/clientes" mostrar={admin || atendente} />
      <Item texto="Ordens de Serviço" rota="/ordens-servico" />
      <Item texto="Estoque" rota="/estoque" mostrar={admin || tecnico} />
      <Item texto="Caixa" rota="/caixa" mostrar={admin} />
      <Item texto="Relatórios" rota="/relatorios" mostrar={admin || atendente} />
      <Item texto="Orçamentos" rota="/orcamentos" mostrar={admin || atendente} />
      <Item texto="Garantias" rota="/garantias" />
      <Item texto="Usuários" rota="/usuarios" mostrar={admin} />
    </aside>
  );
}