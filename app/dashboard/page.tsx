"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import CardResumo from "../../components/CardResumo";
import MenuDashboard from "../../components/MenuDashboard";
import AppLayout from "../../components/AppLayout";

type Ordem = {
  status: string;
  valor_final: number;
  custo_pecas: number;
};

type Caixa = {
  tipo: string;
  valor: number;
};

type Produto = {
  quantidade: number;
  valor_custo: number;
};

type ContaPagar = {
  valor: number;
  vencimento: string;
  status: string;
};

export default function Dashboard() {
  const [clientes, setClientes] = useState(0);
  const [ordens, setOrdens] = useState(0);
  const [osAbertas, setOsAbertas] = useState(0);
  const [osEntregues, setOsEntregues] = useState(0);
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [lucroTotal, setLucroTotal] = useState(0);
  const [saldoCaixa, setSaldoCaixa] = useState(0);
  const [estoqueBaixo, setEstoqueBaixo] = useState(0);
  const [totalPecas, setTotalPecas] = useState(0);
  const [valorEstoque, setValorEstoque] = useState(0);
  const [contasPendentes, setContasPendentes] = useState(0);
  const [contasAtrasadas, setContasAtrasadas] = useState(0);
  const [contasHoje, setContasHoje] = useState(0);
  const [statusResumo, setStatusResumo] = useState<Record<string, number>>({});
  const [funcao, setFuncao] = useState("Tecnico");
  const [email, setEmail] = useState("");

  async function carregarDados() {
    const { data: sessionData } = await supabase.auth.getSession();
    const emailUsuario = sessionData.session?.user.email?.trim().toUpperCase();

    setEmail(emailUsuario || "");

    let funcaoUsuario = "Tecnico";

    if (emailUsuario) {
      const { data: usuario } = await supabase
        .from("usuarios")
        .select("funcao")
        .ilike("email", emailUsuario)
        .maybeSingle();

      if (usuario?.funcao) {
        funcaoUsuario = String(usuario.funcao).trim();
      }
    }

    setFuncao(funcaoUsuario);

    const { count: totalClientes } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true });

    const { data: listaOrdens } = await supabase
      .from("ordens_servico")
      .select("status, valor_final, custo_pecas");

    const { data: listaCaixa } = await supabase
      .from("caixa")
      .select("tipo, valor");

    const { data: listaEstoque } = await supabase
      .from("estoque")
      .select("quantidade, valor_custo");

    const { data: listaContas } = await supabase
      .from("contas_pagar")
      .select("valor, vencimento, status");

    const ordensLista = (listaOrdens as Ordem[]) || [];
    const caixaLista = (listaCaixa as Caixa[]) || [];
    const estoqueLista = (listaEstoque as Produto[]) || [];
    const contasLista = (listaContas as ContaPagar[]) || [];

    const hoje = new Date().toISOString().split("T")[0];

    const abertas = ordensLista.filter(
      (os) => os.status !== "Entregue" && os.status !== "Finalizado"
    ).length;

    const entregues = ordensLista.filter(
      (os) => os.status === "Entregue" || os.status === "Finalizado"
    ).length;

    const faturamento = ordensLista.reduce(
      (total, os) => total + Number(os.valor_final || 0),
      0
    );

    const lucro = ordensLista.reduce(
      (total, os) =>
        total + (Number(os.valor_final || 0) - Number(os.custo_pecas || 0)),
      0
    );

    const entradas = caixaLista
      .filter((mov) => mov.tipo === "Entrada")
      .reduce((total, mov) => total + Number(mov.valor || 0), 0);

    const saidas = caixaLista
      .filter((mov) => mov.tipo === "Saída")
      .reduce((total, mov) => total + Number(mov.valor || 0), 0);

    const resumo: Record<string, number> = {};

    ordensLista.forEach((os) => {
      const status = os.status || "Sem status";
      resumo[status] = (resumo[status] || 0) + 1;
    });

    setClientes(totalClientes || 0);
    setOrdens(ordensLista.length);
    setOsAbertas(abertas);
    setOsEntregues(entregues);
    setEstoqueBaixo(
      estoqueLista.filter((produto) => Number(produto.quantidade || 0) <= 2)
        .length
    );
    setTotalPecas(
      estoqueLista.reduce(
        (total, produto) => total + Number(produto.quantidade || 0),
        0
      )
    );
    setValorEstoque(
      estoqueLista.reduce(
        (total, produto) =>
          total +
          Number(produto.quantidade || 0) * Number(produto.valor_custo || 0),
        0
      )
    );
    setFaturamentoTotal(faturamento);
    setLucroTotal(lucro);
    setSaldoCaixa(entradas - saidas);
    setContasPendentes(
      contasLista
        .filter((conta) => conta.status === "Pendente")
        .reduce((total, conta) => total + Number(conta.valor || 0), 0)
    );
    setContasAtrasadas(
      contasLista.filter(
        (conta) => conta.status === "Pendente" && conta.vencimento < hoje
      ).length
    );
    setContasHoje(
      contasLista.filter(
        (conta) => conta.status === "Pendente" && conta.vencimento === hoje
      ).length
    );
    setStatusResumo(resumo);
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    async function verificarLogin() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      carregarDados();
    }

    verificarLogin();
  }, []);

  const maiorValor = Math.max(faturamentoTotal, lucroTotal, saldoCaixa, 1);
  const maiorStatus = Math.max(...Object.values(statusResumo), 1);

  return (
    <AppLayout funcao={funcao} titulo="Dashboard JD CELL PRO">
      <section style={hero}>
        <div>
          <p style={tag}>JD CELL PRO 2.0</p>
          <h1 style={titulo}>Painel de Controle</h1>
          <p style={subtitulo}>
            Usuário: {email || "Logado"} • Função: <strong>{funcao}</strong>
          </p>
        </div>

        <div style={resumoHero}>
          <strong>{ordens}</strong>
          <span>OS cadastradas</span>
        </div>
      </section>

      <section style={gridCards}>
        <CardResumo titulo="Clientes" valor={clientes} icone="👥" />
        <CardResumo titulo="Total de OS" valor={ordens} icone="📱" />
        <CardResumo titulo="OS Abertas" valor={osAbertas} icone="🔧" />
        <CardResumo titulo="OS Finalizadas" valor={osEntregues} icone="✅" />

        <CardResumo
          titulo="Contas Pendentes"
          valor={`R$ ${contasPendentes.toFixed(2)}`}
          icone="💰"
          destaque
        />

        <CardResumo
          titulo="Contas Atrasadas"
          valor={contasAtrasadas}
          icone="⚠️"
          alerta={contasAtrasadas > 0}
        />

        <CardResumo titulo="Vencendo Hoje" valor={contasHoje} icone="📅" />

        <CardResumo
          titulo="Estoque Baixo"
          valor={`${estoqueBaixo} produtos`}
          icone="📦"
          alerta={estoqueBaixo > 0}
        />

        <CardResumo titulo="Total de Peças" valor={totalPecas} icone="🧩" />

        <CardResumo
          titulo="Valor em Estoque"
          valor={`R$ ${valorEstoque.toFixed(2)}`}
          icone="🏷️"
          destaque
        />

        <CardResumo
          titulo="Faturamento Total"
          valor={`R$ ${faturamentoTotal.toFixed(2)}`}
          icone="📈"
          destaque
        />

        <CardResumo
          titulo="Lucro Total"
          valor={`R$ ${lucroTotal.toFixed(2)}`}
          icone="💵"
          destaque
        />

        <CardResumo
          titulo="Saldo do Caixa"
          valor={`R$ ${saldoCaixa.toFixed(2)}`}
          icone="🏦"
          destaque
        />
      </section>

      <section style={blocoMenu}>
        <h2 style={secaoTitulo}>Menu Rápido</h2>
        <MenuDashboard funcao={funcao} sair={sair} />
      </section>

      <section style={gridGraficos}>
        <div style={cardGrafico}>
          <h3>Gráfico Financeiro</h3>
          <Barra
            titulo="Faturamento"
            valor={faturamentoTotal}
            maiorValor={maiorValor}
          />
          <Barra titulo="Lucro" valor={lucroTotal} maiorValor={maiorValor} />
          <Barra titulo="Caixa" valor={saldoCaixa} maiorValor={maiorValor} />
        </div>

        <div style={cardGrafico}>
          <h3>OS por Status</h3>

          {Object.keys(statusResumo).length === 0 && (
            <p>Nenhuma OS cadastrada ainda.</p>
          )}

          {Object.entries(statusResumo).map(([status, total]) => (
            <div key={status} style={{ marginBottom: "15px" }}>
              <div style={linhaGrafico}>
                <span>{status}</span>
                <strong>{total}</strong>
              </div>

              <div style={barraFundo}>
                <div
                  style={{
                    ...barraPreenchida,
                    width: `${(total / maiorStatus) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

function Barra({
  titulo,
  valor,
  maiorValor,
}: {
  titulo: string;
  valor: number;
  maiorValor: number;
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={linhaGrafico}>
        <span>{titulo}</span>
        <strong>R$ {valor.toFixed(2)}</strong>
      </div>

      <div style={barraFundo}>
        <div
          style={{
            ...barraPreenchida,
            width: `${(valor / maiorValor) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

const hero = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  background: "linear-gradient(135deg, rgba(15,23,42,.98), rgba(30,41,59,.96))",
  padding: "28px",
  borderRadius: "24px",
  border: "1px solid rgba(148,163,184,.22)",
  boxShadow: "0 14px 32px rgba(0,0,0,.28)",
};

const tag = {
  margin: 0,
  color: "#22c55e",
  fontWeight: "bold",
  letterSpacing: "1px",
};

const titulo = {
  margin: "8px 0 6px 0",
  fontSize: "38px",
  color: "#fff",
};

const subtitulo = {
  margin: 0,
  color: "#cbd5e1",
};

const resumoHero = {
  minWidth: "150px",
  textAlign: "center" as const,
  background: "rgba(34,197,94,.12)",
  border: "1px solid rgba(34,197,94,.35)",
  borderRadius: "20px",
  padding: "18px",
  color: "#22c55e",
  display: "flex",
  flexDirection: "column" as const,
  gap: "4px",
  fontSize: "14px",
};

const gridCards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginTop: "26px",
};

const blocoMenu = {
  marginTop: "30px",
  background: "rgba(15,23,42,.72)",
  border: "1px solid rgba(148,163,184,.18)",
  borderRadius: "22px",
  padding: "22px",
};

const secaoTitulo = {
  margin: 0,
  color: "#22c55e",
};

const gridGraficos = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "30px",
};

const cardGrafico = {
  background: "rgba(30, 41, 59, 0.92)",
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid rgba(148,163,184,.18)",
};

const linhaGrafico = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "6px",
};

const barraFundo = {
  width: "100%",
  height: "14px",
  background: "#334155",
  borderRadius: "999px",
  overflow: "hidden",
};

const barraPreenchida = {
  height: "100%",
  background: "#22c55e",
  borderRadius: "999px",
};