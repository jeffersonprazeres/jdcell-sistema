"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [clientes, setClientes] = useState(0);
  const [ordens, setOrdens] = useState(0);
  const [osAbertas, setOsAbertas] = useState(0);
  const [osEntregues, setOsEntregues] = useState(0);
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [lucroTotal, setLucroTotal] = useState(0);
  const [saldoCaixa, setSaldoCaixa] = useState(0);

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

    setClientes(totalClientes || 0);
    setOrdens(listaOrdens?.length || 0);

    const abertas =
      listaOrdens?.filter(
        (os) => os.status !== "Entregue" && os.status !== "Finalizado"
      ).length || 0;

    const entregues =
      listaOrdens?.filter(
        (os) => os.status === "Entregue" || os.status === "Finalizado"
      ).length || 0;

    const faturamento =
      listaOrdens?.reduce((total, os) => {
        return total + Number(os.valor_final || 0);
      }, 0) || 0;

    const lucro =
      listaOrdens?.reduce((total, os) => {
        return (
          total +
          (Number(os.valor_final || 0) - Number(os.custo_pecas || 0))
        );
      }, 0) || 0;

    const entradas =
      listaCaixa
        ?.filter((mov) => mov.tipo === "Entrada")
        .reduce((total, mov) => total + Number(mov.valor || 0), 0) || 0;

    const saidas =
      listaCaixa
        ?.filter((mov) => mov.tipo === "Saída")
        .reduce((total, mov) => total + Number(mov.valor || 0), 0) || 0;

    setOsAbertas(abertas);
    setOsEntregues(entregues);
    setFaturamentoTotal(faturamento);
    setLucroTotal(lucro);
    setSaldoCaixa(entradas - saidas);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>JD CELL</h1>
      <h2>Dashboard Financeiro</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginTop: "30px",
        }}
      >
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

        <div style={card}>
          <h3>Faturamento Total</h3>
          <strong style={numero}>R$ {faturamentoTotal.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Lucro Total</h3>
          <strong style={numero}>R$ {lucroTotal.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Saldo do Caixa</h3>
          <strong style={numero}>R$ {saldoCaixa.toFixed(2)}</strong>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <button onClick={() => (window.location.href = "/clientes")} style={botao}>
          Clientes
        </button>

        <button onClick={() => (window.location.href = "/ordens-servico")} style={botao}>
          Ordens de Serviço
        </button>

        <button onClick={() => (window.location.href = "/estoque")} style={botao}>
          Estoque
        </button>

        <button onClick={() => (window.location.href = "/caixa")} style={botao}>
          Caixa
        </button>

        <button onClick={() => (window.location.href = "/relatorios")} style={botao}>
          Relatórios
        </button>
      </div>
    </main>
  );
}

const card = {
  background: "#1e293b",
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