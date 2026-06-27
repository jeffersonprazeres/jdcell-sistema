type SidebarProps = {
  funcao: string;
};

export default function Sidebar({ funcao }: SidebarProps) {
  const admin = funcao === "Administrador";
  const atendente = funcao === "Atendente";
  const tecnico = funcao === "Tecnico";

  const podeClientes = admin || atendente;
  const podeOS = admin || atendente || tecnico;
  const podeTecnico = admin || tecnico;

  function item(texto: string, rota: string, mostrar: boolean) {
    if (!mostrar) return null;

    return (
      <button
        onClick={() => (window.location.href = rota)}
        style={botao}
      >
        {texto}
      </button>
    );
  }

  return (
    <aside style={sidebar}>
      <h2 style={{ color: "#22c55e" }}>JD CELL</h2>

      {item("Dashboard", "/dashboard", true)}
      {item("Clientes", "/clientes", podeClientes)}
      {item("Ordens de Serviço", "/ordens-servico", podeOS)}
      {item("Estoque", "/estoque", podeTecnico)}
      {item("Caixa", "/caixa", admin)}
      {item("Relatórios", "/relatorios", admin || atendente)}
      {item("Orçamentos", "/orcamentos", admin || atendente)}
      {item("Garantias", "/garantias", podeTecnico)}
      {item("Usuários", "/usuarios", admin)}
    </aside>
  );
}

const sidebar = {
  width: "240px",
  minHeight: "100vh",
  background: "rgba(15,23,42,.96)",
  borderRight: "2px solid #22c55e",
  padding: "20px",
  position: "fixed" as const,
  left: 0,
  top: 0,
};

const botao = {
  width: "100%",
  display: "block",
  background: "transparent",
  color: "#fff",
  border: "1px solid rgba(148,163,184,.25)",
  padding: "12px",
  borderRadius: "10px",
  cursor: "pointer",
  marginBottom: "10px",
  textAlign: "left" as const,
};