"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type OS = {
  id: string;
  status: string;
  custo_pecas: number;
  valor_final: number;
  created_at: string;
};

type MovimentoCaixa = {
  id: string;
  tipo: string;
  valor: number;
  created_at: string;
};

export default function Relatorios() {
  const [ordens, setOrdens] = useState<OS[]>([]);
  const [caixa, setCaixa] = useState<MovimentoCaixa[]>([]);
  const [clientes, setClientes] = useState(0);
  const [mensagem, setMensagem] = useState("");

  async function carregarRelatorios() {
    const { data: osData, error: osError } = await supabase
      .from("ordens_servico")
      .select("id, status, custo_pecas, valor_final, created_at");

    if (osError) {
      setMensagem("Erro ao carregar OS: " + osError.message);
      return;
    }

    const { data: caixaData, error: caixaError } = await supabase
      .from("caixa")
      .select("id, tipo, valor, created_at");

    if (caixaError) {
      setMensagem("Erro ao carregar caixa: " + caixaError.message);
      return;
    }

    const { count } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true });

    setOrdens(osData || []);
    setCaixa(caixaData || []);
    setClientes(count || 0);
  }

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const totalOS = ordens.length;

  const osAbertas = ordens.filter(
    (os) => os.status !== "Entregue" && os.status !== "Finalizado"
  ).length;

  const osFinalizadas = ordens.filter(
    (os) => os.status === "Entregue" || os.status === "Finalizado"
  ).length;

  const faturamentoOS = ordens.reduce(
    (total, os) => total + Number(os.valor_final || 0),
    0
  );

  const custoPecas = ordens.reduce(
    (total, os) => total + Number(os.custo_pecas || 0),
    0
  );

  const lucroOS = faturamentoOS - custoPecas;

  const entradasCaixa = caixa
    .filter((mov) => mov.tipo === "Entrada")
    .reduce((total, mov) => total + Number(mov.valor || 0), 0);

  const saidasCaixa = caixa
    .filter((mov) => mov.tipo === "Saída")
    .reduce((total, mov) => total + Number(mov.valor || 0), 0);

  const saldoCaixa = entradasCaixa - saidasCaixa;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>Relatórios JD CELL</h1>

      {mensagem && <p>{mensagem}</p>}

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
          <strong style={numero}>{totalOS}</strong>
        </div>

        <div style={card}>
          <h3>OS Abertas</h3>
          <strong style={numero}>{osAbertas}</strong>
        </div>

        <div style={card}>
          <h3>OS Finalizadas</h3>
          <strong style={numero}>{osFinalizadas}</strong>
        </div>

        <div style={card}>
          <h3>Faturamento OS</h3>
          <strong style={numero}>R$ {faturamentoOS.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Custo Peças</h3>
          <strong style={numero}>R$ {custoPecas.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Lucro OS</h3>
          <strong style={numero}>R$ {lucroOS.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Saldo Caixa</h3>
          <strong style={numero}>R$ {saldoCaixa.toFixed(2)}</strong>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <button onClick={() => window.print()} style={botao}>
          Imprimir Relatório
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
  fontSize: "28px",
  color: "#22c55e",
};

const botao = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};