"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Conta = {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  vencimento: string;
  status: string;
};

export default function ContasPagar() {
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Aluguel");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todas");
  const [contas, setContas] = useState<Conta[]>([]);
  const [mensagem, setMensagem] = useState("");

  async function carregarContas() {
    const { data, error } = await supabase
      .from("contas_pagar")
      .select("*")
      .order("vencimento", { ascending: true });

    if (error) {
      setMensagem("Erro ao carregar contas: " + error.message);
      return;
    }

    setContas((data as Conta[]) || []);
  }

  async function salvarConta() {
    setMensagem("");

    if (!descricao || !valor || !vencimento) {
      setMensagem("Preencha descrição, valor e vencimento.");
      return;
    }

    const { error } = await supabase.from("contas_pagar").insert([
      {
        descricao,
        categoria,
        valor: Number(valor || 0),
        vencimento,
        status: "Pendente",
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar conta: " + error.message);
      return;
    }

    setMensagem("Conta cadastrada com sucesso!");
    setDescricao("");
    setCategoria("Aluguel");
    setValor("");
    setVencimento("");
    carregarContas();
  }

  async function marcarComoPaga(id: string) {
    const { error } = await supabase
      .from("contas_pagar")
      .update({ status: "Paga" })
      .eq("id", id);

    if (error) {
      alert("Erro ao marcar como paga: " + error.message);
      return;
    }

    carregarContas();
  }

  async function excluirConta(id: string) {
    const confirmar = confirm("Deseja excluir esta conta?");

    if (!confirmar) return;

    const { error } = await supabase.from("contas_pagar").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir conta: " + error.message);
      return;
    }

    carregarContas();
  }

  useEffect(() => {
    carregarContas();
  }, []);

  const hoje = new Date().toISOString().split("T")[0];

  const contasFiltradas = contas.filter((conta) => {
    if (statusFiltro === "Todas") return true;
    return conta.status === statusFiltro;
  });

  const contasPendentes = contas.filter((conta) => conta.status === "Pendente");

  const totalPendente = contasPendentes.reduce(
    (total, conta) => total + Number(conta.valor || 0),
    0
  );

  const contasVencidas = contasPendentes.filter(
    (conta) => conta.vencimento < hoje
  );

  const contasHoje = contasPendentes.filter(
    (conta) => conta.vencimento === hoje
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>Contas a Pagar</h1>

      <div style={gridCards}>
        <div style={card}>
          <h3>Total Pendente</h3>
          <strong style={numero}>R$ {totalPendente.toFixed(2)}</strong>
        </div>

        <div style={cardAlerta}>
          <h3>⚠️ Atrasadas</h3>
          <strong style={numero}>{contasVencidas.length}</strong>
        </div>

        <div style={card}>
          <h3>Vencendo Hoje</h3>
          <strong style={numero}>{contasHoje.length}</strong>
        </div>
      </div>

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Cadastrar Conta</h2>

      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        style={input}
      />

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        style={input}
      >
        <option>Aluguel</option>
        <option>Energia</option>
        <option>Internet</option>
        <option>Água</option>
        <option>Fornecedor</option>
        <option>Impostos</option>
        <option>Funcionário</option>
        <option>Outros</option>
      </select>

      <input
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={input}
      />

      <input
        type="date"
        value={vencimento}
        onChange={(e) => setVencimento(e.target.value)}
        style={input}
      />

      <button onClick={salvarConta} style={botao}>
        Salvar Conta
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Lista de Contas</h2>

      <select
        value={statusFiltro}
        onChange={(e) => setStatusFiltro(e.target.value)}
        style={input}
      >
        <option>Todas</option>
        <option>Pendente</option>
        <option>Paga</option>
      </select>

      {contasFiltradas.length === 0 && <p>Nenhuma conta encontrada.</p>}

      {contasFiltradas.map((conta) => {
        const atrasada = conta.status === "Pendente" && conta.vencimento < hoje;

        return (
          <div
            key={conta.id}
            style={atrasada ? cardAlertaLista : cardLista}
          >
            <strong>{conta.descricao}</strong>
            <p>Categoria: {conta.categoria}</p>
            <p>Valor: R$ {Number(conta.valor || 0).toFixed(2)}</p>
            <p>
              Vencimento:{" "}
              {new Date(conta.vencimento + "T00:00:00").toLocaleDateString(
                "pt-BR"
              )}
            </p>
            <p>Status: {conta.status}</p>

            {conta.status === "Pendente" && (
              <button onClick={() => marcarComoPaga(conta.id)} style={botao}>
                Marcar como paga
              </button>
            )}

            <button
              onClick={() => excluirConta(conta.id)}
              style={botaoExcluir}
            >
              Excluir
            </button>
          </div>
        );
      })}

      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={{ ...botao, marginTop: "20px" }}
      >
        Voltar Dashboard
      </button>
    </main>
  );
}

const input = {
  width: "350px",
  padding: "10px",
  display: "block",
  marginBottom: "10px",
  color: "#000",
};

const gridCards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginTop: "20px",
};

const card = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "20px",
  borderRadius: "12px",
};

const cardAlerta = {
  background: "rgba(127, 29, 29, 0.92)",
  padding: "20px",
  borderRadius: "12px",
};

const cardLista = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const cardAlertaLista = {
  background: "rgba(127, 29, 29, 0.92)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const numero = {
  fontSize: "28px",
  color: "#22c55e",
};

const botao = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "10px",
};

const botaoExcluir = {
  ...botao,
  background: "#ef4444",
  marginLeft: "10px",
};