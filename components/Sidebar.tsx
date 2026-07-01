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
      <button onClick={() => (window.location.href = rota)} style={botao}>
        {texto}
      </button>
    );
  };

  return (
    <aside style={sidebar}>
      <h2 style={logo}>JD CELL</h2>

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

const sidebar = {
  width: "210px",
  minWidth: "210px",
  minHeight: "100vh",
  background: "#0f172a",
  borderRight: "1px solid #22c55e",
  padding: "18px",
  boxSizing: "border-box" as const,
};

const logo = {
  color: "#22c55e",
  marginBottom: "28px",
  fontSize: "24px",
};

const botao = {
  width: "100%",
  background: "#111827",
  color: "#fff",
  border: "1px solid #334155",
  padding: "11px",
  borderRadius: "10px",
  cursor: "pointer",
  marginBottom: "10px",
  textAlign: "left" as const,
  fontWeight: "bold",
};