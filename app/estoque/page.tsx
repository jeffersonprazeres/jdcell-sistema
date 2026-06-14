"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Produto = {
  id: string;
  nome: string;
  fornecedor: string;
  quantidade: number;
  valor_custo: number;
  valor_venda: number;
};

export default function Estoque() {
  const [nome, setNome] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valorCusto, setValorCusto] = useState("");
  const [valorVenda, setValorVenda] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("estoque")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      setMensagem("Erro ao carregar estoque: " + error.message);
      return;
    }

    setProdutos(data || []);
  }

  async function salvarProduto() {
    setMensagem("");

    if (!nome) {
      setMensagem("Digite o nome da peça.");
      return;
    }

    const { error } = await supabase.from("estoque").insert([
      {
        nome,
        fornecedor,
        quantidade: Number(quantidade || 0),
        valor_custo: Number(valorCusto || 0),
        valor_venda: Number(valorVenda || 0),
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar: " + error.message);
      return;
    }

    setMensagem("Produto salvo com sucesso!");
    setNome("");
    setFornecedor("");
    setQuantidade("");
    setValorCusto("");
    setValorVenda("");
    carregarProdutos();
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  const produtosBaixo = produtos.filter(
    (produto) => Number(produto.quantidade || 0) <= 2
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "rgba(15, 23, 42, 0.35)",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1>Estoque de Peças</h1>

      <input
        type="text"
        placeholder="Nome da peça"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={input}
      />

      <input
        type="text"
        placeholder="Fornecedor"
        value={fornecedor}
        onChange={(e) => setFornecedor(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="Quantidade"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="Valor de custo"
        value={valorCusto}
        onChange={(e) => setValorCusto(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="Valor de venda"
        value={valorVenda}
        onChange={(e) => setValorVenda(e.target.value)}
        style={input}
      />

      <button onClick={salvarProduto} style={botao}>
        Salvar peça
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2 style={{ color: "#facc15" }}>⚠️ Estoque baixo</h2>

      {produtosBaixo.length === 0 && <p>Nenhuma peça com estoque baixo.</p>}

      {produtosBaixo.map((produto) => (
        <div key={produto.id} style={cardAlerta}>
          <strong>{produto.nome}</strong>
          <p>Quantidade atual: {produto.quantidade}</p>
          <p>Fornecedor: {produto.fornecedor || "Não informado"}</p>
        </div>
      ))}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Peças cadastradas</h2>

      {produtos.length === 0 && <p>Nenhuma peça cadastrada ainda.</p>}

      {produtos.map((produto) => {
        const lucroUnidade =
          Number(produto.valor_venda || 0) - Number(produto.valor_custo || 0);

        return (
          <div key={produto.id} style={cardLista}>
            <strong>{produto.nome}</strong>
            <p>Fornecedor: {produto.fornecedor || "Não informado"}</p>
            <p>Quantidade: {produto.quantidade}</p>
            <p>Custo: R$ {Number(produto.valor_custo || 0).toFixed(2)}</p>
            <p>Venda: R$ {Number(produto.valor_venda || 0).toFixed(2)}</p>
            <p>Lucro por unidade: R$ {lucroUnidade.toFixed(2)}</p>
          </div>
        );
      })}
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

const botao = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};

const cardLista = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const cardAlerta = {
  background: "rgba(127, 29, 29, 0.92)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};