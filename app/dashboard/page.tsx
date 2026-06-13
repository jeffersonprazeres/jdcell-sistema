"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Ordem = {
  status: string;
  valor_final: number;
  custo_pecas: number;
};

type Caixa = {
  tipo: string;
  valor: number;
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
  const [statusResumo, setStatusResumo] = useState<Record<string, number>>({});

  async function carregarDados() {
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
      .select("quantidade");

    const ordensLista = (listaOrdens as Ordem[]) || [];
    const caixaLista = (listaCaixa as Caixa[]) || [];

    const baixo =
      listaEstoque?.filter((produto) => Number(produto.quantidade || 0) <= 2)
        .length || 0;

    setClientes(totalClientes || 0);
    setOrdens(ordensLista.length);
    setEstoqueBaixo(baixo);

    const abertas = ordensLista.filter(
      (os) => os.status !== "Entregue" && os.status !== "Finalizado"
    ).length;

    const entregues = ordensLista.filter(
      (os) => os.status === "Entregue" || os.status === "Finalizado"
    ).length;

    const faturamento = ordensLista.reduce((total, os) => {
      return total + Number(os.valor_final || 0);
    }, 0);

    const lucro = ordensLista.reduce((total, os) => {
      return total + (Number(os.valor_final || 0) - Number(os.custo_pecas || 0));
    }, 0);

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

    setOsAbertas(abertas);
    setOsEntregues(entregues);
    setFaturamentoTotal(faturamento);
    setLucroTotal(lucro);
    setSaldoCaixa(entradas - saidas);
    setStatusResumo(resumo);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const maiorValor = Math.max(faturamentoTotal, lucroTotal, saldoCaixa, 1);
  const maiorStatus = Math.max(...Object.values(statusResumo), 1);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>JD CELL</h1>
      <h2>Dashboard Financeiro</h2>

      <div style={gridCards}>
        <div style={card}>
          <h3>Clientes</h3>
          <strong style={numero}>{clientes}</strong>
        </div>

        <div style={card}>
          <h3>Total de OS</h3>
          <strong style={numero}>{ordens}</strong>
        </div>

        <div style={card}>
          <h3>OS Abertas</h3>
          <strong style={numero}>{osAbertas}</strong>
        </div>

        <div style={card}>
          <h3>OS Finalizadas</h3>
          <strong style={numero}>{osEntregues}</strong>
        </div>

        <div style={cardDestaque}>
          <h3>Faturamento Total</h3>
          <strong style={numero}>R$ {faturamentoTotal.toFixed(2)}</strong>
        </div>

        <div style={cardDestaque}>
          <h3>Lucro Total</h3>
          <strong style={numero}>R$ {lucroTotal.toFixed(2)}</strong>
        </div>

        <div style={cardDestaque}>
          <h3>Saldo do Caixa</h3>
          <strong style={numero}>R$ {saldoCaixa.toFixed(2)}</strong>
        </div>

        <div
          style={{
            background:
  estoqueBaixo > 0
    ? "rgba(127, 29, 29, 0.92)"
    : "rgba(30, 41, 59, 0.92)",
            padding: "20px",
            borderRadius: "12px",
            cursor: "pointer",
          }}
          onClick={() => (window.location.href = "/estoque")}
        >
          <h3>⚠️ Estoque Baixo</h3>
          <strong style={numero}>{estoqueBaixo} produtos</strong>
        </div>
      </div>

      <div style={gridGraficos}>
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
      </div>

      <div style={{ marginTop: "30px" }}>
        <button onClick={() => (window.location.href = "/clientes")} style={botao}>
          Clientes
        </button>

        <button
          onClick={() => (window.location.href = "/ordens-servico")}
          style={botao}
        >
          Ordens de Serviço
        </button>

        <button onClick={() => (window.location.href = "/estoque")} style={botao}>
          Estoque
        </button>

        <button onClick={() => (window.location.href = "/caixa")} style={botao}>
          Caixa
        </button>

        <button
          onClick={() => (window.location.href = "/relatorios")}
          style={botao}
        >
          Relatórios
        </button>
      </div>
    </main>
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

const gridCards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginTop: "30px",
};

const gridGraficos = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "30px",
};

const card = {
  background: "rgba(30, 41, 59, 0.92)",
  padding: "20px",
  borderRadius: "12px",
};

const cardDestaque = {
  background: "rgba(6, 78, 59, 0.85)",
  padding: "20px",
  borderRadius: "12px",
};

const cardGrafico = {
  background: "rgba(30, 41, 59, 0.92)",
  padding: "20px",
  borderRadius: "12px",
};

const numero = {
  fontSize: "32px",
  color: "#22c55e",
};

const botao = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  marginRight: "10px",
  marginBottom: "10px",
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