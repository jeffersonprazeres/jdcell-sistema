"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Movimentacao = {
  id: string;
  produto_id: string;
  produto_nome: string;
  tipo: string;
  quantidade: number;
  origem: string;
  referencia: string;
  created_at: string;
};

export default function MovimentacoesEstoque() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [mensagem, setMensagem] = useState("");

  async function carregarMovimentacoes() {
    const { data, error } = await supabase
      .from("movimentacoes_estoque")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar movimentações: " + error.message);
      return;
    }

    setMovimentacoes((data as Movimentacao[]) || []);
  }

  useEffect(() => {
    carregarMovimentacoes();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>Movimentações de Estoque</h1>

      {mensagem && <p>{mensagem}</p>}

      {movimentacoes.length === 0 && (
        <p>Nenhuma movimentação registrada ainda.</p>
      )}

      {movimentacoes.map((mov) => (
        <div
          key={mov.id}
          style={{
            ...card,
            borderLeft:
              mov.tipo === "Entrada"
                ? "6px solid #22c55e"
                : "6px solid #ef4444",
          }}
        >
          <strong>{mov.produto_nome}</strong>
          <p>Tipo: {mov.tipo}</p>
          <p>Quantidade: {mov.tipo === "Entrada" ? "+" : "-"}{mov.quantidade}</p>
          <p>Origem: {mov.origem}</p>
          <p>Referência: {mov.referencia || "Não informada"}</p>
          <p>Data: {new Date(mov.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
      ))}

      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={botao}
      >
        Voltar Dashboard
      </button>
    </main>
  );
}

const card = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const botao = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "20px",
};