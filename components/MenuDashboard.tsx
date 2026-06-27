type MenuDashboardProps = {
  funcao: string;
  sair: () => void;
};

type ItemMenu = {
  texto: string;
  icone: string;
  rota: string;
  permitido: boolean;
};

export default function MenuDashboard({ funcao, sair }: MenuDashboardProps) {
  const podeClientes = funcao === "Administrador" || funcao === "Atendente";
  const podeOS =
    funcao === "Administrador" || funcao === "Atendente" || funcao === "Tecnico";
  const podeTecnico = funcao === "Administrador" || funcao === "Tecnico";
  const admin = funcao === "Administrador";

  const itens: ItemMenu[] = [
    { texto: "Clientes", icone: "👥", rota: "/clientes", permitido: podeClientes },
    { texto: "Ordens de Serviço", icone: "📱", rota: "/ordens-servico", permitido: podeOS },
    { texto: "Estoque", icone: "📦", rota: "/estoque", permitido: podeTecnico },
    { texto: "Caixa", icone: "💰", rota: "/caixa", permitido: admin },
    { texto: "Relatórios", icone: "📊", rota: "/relatorios", permitido: podeClientes },
    { texto: "Contas a Pagar", icone: "🧾", rota: "/contas-pagar", permitido: admin },
    { texto: "Orçamentos", icone: "📝", rota: "/orcamentos", permitido: podeClientes },
    { texto: "Garantias", icone: "🛡️", rota: "/garantias", permitido: podeTecnico },
    { texto: "Entrada Estoque", icone: "📥", rota: "/entrada-estoque", permitido: podeTecnico },
    { texto: "Movimentações", icone: "🔄", rota: "/movimentacoes-estoque", permitido: podeTecnico },
    { texto: "Backup Excel", icone: "💾", rota: "/backup", permitido: admin },
    { texto: "Usuários", icone: "👨‍🔧", rota: "/usuarios", permitido: admin },
  ];

  return (
    <div style={gridMenu}>
      {itens
        .filter((item) => item.permitido)
        .map((item) => (
          <button
            key={item.rota}
            onClick={() => (window.location.href = item.rota)}
            style={botaoMenu}
          >
            <span style={{ fontSize: "26px" }}>{item.icone}</span>
            <span>{item.texto}</span>
          </button>
        ))}

      <button onClick={sair} style={{ ...botaoMenu, background: "linear-gradient(135deg,#991b1b,#7f1d1d)" }}>
        <span style={{ fontSize: "26px" }}>🚪</span>
        <span>Sair</span>
      </button>
    </div>
  );
}

const gridMenu = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "15px",
  marginTop: "22px",
};

const botaoMenu = {
  background: "linear-gradient(135deg, rgba(30,41,59,.98), rgba(15,23,42,.98))",
  color: "#fff",
  border: "1px solid rgba(148,163,184,.25)",
  padding: "18px",
  borderRadius: "18px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "16px",
  fontWeight: "bold",
  boxShadow: "0 10px 25px rgba(0,0,0,.24)",
};
