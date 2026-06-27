"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Produto = {
  id: string;
  nome: string;
  fornecedor: string;
  quantidade: number;
  valor_custo: number;
};

type Entrada = {
  id: string;
  produto_id: string;
  produto_nome: string;
  fornecedor: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  created_at: string;
};

export default function EntradaEstoque() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [entradas, setEntradas] = useState<Entrada[]>([]);

  const [produtoId, setProdutoId] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("estoque")
      .select("id, nome, fornecedor, quantidade, valor_custo")
      .order("nome", { ascending: true });

    if (error) {
      setMensagem("Erro ao carregar produtos: " + error.message);
      return;
    }

    setProdutos((data as Produto[]) || []);
  }

  async function carregarEntradas() {
    const { data, error } = await supabase
      .from("entradas_estoque")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar entradas: " + error.message);
      return;
    }

    setEntradas((data as Entrada[]) || []);
  }

  function selecionarProduto(id: string) {
    setProdutoId(id);

    const produto = produtos.find((item) => item.id === id);

    if (produto) {
      setFornecedor(produto.fornecedor || "");
      setValorUnitario(String(produto.valor_custo || 0));
    }
  }

  async function salvarEntrada() {
    setMensagem("");

    if (!produtoId || !quantidade || !valorUnitario) {
      setMensagem("Selecione o produto, quantidade e valor unitário.");
      return;
    }

    const produto = produtos.find((item) => item.id === produtoId);

    if (!produto) {
      setMensagem("Produto não encontrado.");
      return;
    }

    const quantidadeEntrada = Number(quantidade || 0);
    const valor = Number(valorUnitario || 0);
    const valorTotal = quantidadeEntrada * valor;
    const novaQuantidade = Number(produto.quantidade || 0) + quantidadeEntrada;

    const { error: erroEstoque } = await supabase
      .from("estoque")
      .update({
        quantidade: novaQuantidade,
        fornecedor,
        valor_custo: valor,
      })
      .eq("id", produtoId);

    if (erroEstoque) {
      setMensagem("Erro ao atualizar estoque: " + erroEstoque.message);
      return;
    }

    const { error: erroEntrada } = await supabase
      .from("entradas_estoque")
      .insert([
        {
          produto_id: produtoId,
          produto_nome: produto.nome,
          fornecedor,
          quantidade: quantidadeEntrada,
          valor_unitario: valor,
          valor_total: valorTotal,
        },
      ]);

    if (erroEntrada) {
      setMensagem("Erro ao salvar entrada: " + erroEntrada.message);
      return;
    }

    const { error: erroMovimentacao } = await supabase
      .from("movimentacoes_estoque")
      .insert([
        {
          produto_id: produtoId,
          produto_nome: produto.nome,
          tipo: "Entrada",
          quantidade: quantidadeEntrada,
          origem: "Compra",
          referencia: fornecedor,
        },
      ]);

    if (erroMovimentacao) {
      setMensagem("Entrada salva, mas erro ao registrar movimentação: " + erroMovimentacao.message);
      return;
    }

    setMensagem("Entrada registrada com sucesso!");
    setProdutoId("");
    setFornecedor("");
    setQuantidade("");
    setValorUnitario("");

    carregarProdutos();
    carregarEntradas();
  }

  useEffect(() => {
    carregarProdutos();
    carregarEntradas();
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
      <h1 style={{ color: "#22c55e" }}>Entrada de Estoque</h1>

      <select
        value={produtoId}
        onChange={(e) => selecionarProduto(e.target.value)}
        style={input}
      >
        <option value="">Selecione o produto</option>
        {produtos.map((produto) => (
          <option key={produto.id} value={produto.id}>
            {produto.nome} | Atual: {produto.quantidade}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Fornecedor"
        value={fornecedor}
        onChange={(e) => setFornecedor(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="Quantidade de entrada"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="Valor unitário"
        value={valorUnitario}
        onChange={(e) => setValorUnitario(e.target.value)}
        style={input}
      />

      <button onClick={salvarEntrada} style={botao}>
        Registrar Entrada
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Histórico de Entradas</h2>

      {entradas.length === 0 && <p>Nenhuma entrada registrada.</p>}

      {entradas.map((entrada) => (
        <div key={entrada.id} style={card}>
          <strong>{entrada.produto_nome}</strong>
          <p>Fornecedor: {entrada.fornecedor || "Não informado"}</p>
          <p>Quantidade: {entrada.quantidade}</p>
          <p>Valor unitário: R$ {Number(entrada.valor_unitario || 0).toFixed(2)}</p>
          <p>Valor total: R$ {Number(entrada.valor_total || 0).toFixed(2)}</p>
          <p>Data: {new Date(entrada.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
      ))}

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
  width: "380px",
  padding: "10px",
  display: "block",
  marginBottom: "10px",
  color: "#000",
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

const card = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};