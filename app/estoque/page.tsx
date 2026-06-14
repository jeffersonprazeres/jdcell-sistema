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

  async function atualizarProduto(
    id: string,
    campo: keyof Produto,
    valor: string
  ) {
    const valorAtualizado =
      campo === "quantidade" || campo === "valor_custo" || campo === "valor_venda"
        ? Number(valor || 0)
        : valor;

    const { error } = await supabase
      .from("estoque")
      .update({ [campo]: valorAtualizado })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar peça: " + error.message);
      return;
    }

    carregarProdutos();
  }

  async function excluirProduto(id: string, nomeProduto: string) {
    const confirmar = confirm(`Deseja excluir a peça "${nomeProduto}"?`);

    if (!confirmar) return;

    const { error } = await supabase.from("estoque").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir peça: " + error.message);
      return;
    }

    alert("Peça excluída com sucesso!");
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
            <label>Nome da peça:</label>
            <input
              type="text"
              defaultValue={produto.nome}
              onBlur={(e) =>
                atualizarProduto(produto.id, "nome", e.target.value)
              }
              style={inputPequeno}
            />

            <label>Fornecedor:</label>
            <input
              type="text"
              defaultValue={produto.fornecedor}
              onBlur={(e) =>
                atualizarProduto(produto.id, "fornecedor", e.target.value)
              }
              style={inputPequeno}
            />

            <label>Quantidade:</label>
            <input
              type="number"
              defaultValue={produto.quantidade}
              onBlur={(e) =>
                atualizarProduto(produto.id, "quantidade", e.target.value)
              }
              style={inputPequeno}
            />

            <label>Valor de custo:</label>
            <input
              type="number"
              defaultValue={produto.valor_custo}
              onBlur={(e) =>
                atualizarProduto(produto.id, "valor_custo", e.target.value)
              }
              style={inputPequeno}
            />

            <label>Valor de venda:</label>
            <input
              type="number"
              defaultValue={produto.valor_venda}
              onBlur={(e) =>
                atualizarProduto(produto.id, "valor_venda", e.target.value)
              }
              style={inputPequeno}
            />

            <p>Lucro por unidade: R$ {lucroUnidade.toFixed(2)}</p>

            <button
              onClick={() => excluirProduto(produto.id, produto.nome)}
              style={botaoExcluir}
            >
              Excluir peça
            </button>
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

const inputPequeno = {
  width: "260px",
  padding: "8px",
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

const botaoExcluir = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "10px",
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