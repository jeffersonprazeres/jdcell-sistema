"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Movimento = {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  created_at: string;
};

export default function Caixa() {
  const [tipo, setTipo] = useState("Entrada");
  const [categoria, setCategoria] = useState("Serviço");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);

  async function carregarMovimentos() {
    const { data, error } = await supabase
      .from("caixa")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar caixa: " + error.message);
      return;
    }

    setMovimentos(data || []);
  }

  async function salvarMovimento() {
    setMensagem("");

    if (!descricao || !valor) {
      setMensagem("Preencha descrição e valor.");
      return;
    }

    const { error } = await supabase.from("caixa").insert([
      {
        tipo,
        categoria,
        descricao,
        valor: Number(valor),
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar: " + error.message);
      return;
    }

    setMensagem("Movimentação salva com sucesso!");
    setDescricao("");
    setValor("");
    carregarMovimentos();
  }

  useEffect(() => {
    carregarMovimentos();
  }, []);

  const totalEntradas = movimentos
    .filter((m) => m.tipo === "Entrada")
    .reduce((total, m) => total + Number(m.valor || 0), 0);

  const totalSaidas = movimentos
    .filter((m) => m.tipo === "Saída")
    .reduce((total, m) => total + Number(m.valor || 0), 0);

  const saldo = totalEntradas - totalSaidas;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1>Caixa Financeiro</h1>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginTop: "20px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        <div style={card}>
          <h3>Entradas</h3>
          <strong style={numero}>R$ {totalEntradas.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Saídas</h3>
          <strong style={numero}>R$ {totalSaidas.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Saldo</h3>
          <strong style={numero}>R$ {saldo.toFixed(2)}</strong>
        </div>
      </div>

      <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={input}>
        <option>Entrada</option>
        <option>Saída</option>
      </select>

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        style={input}
      >
        <option>Serviço</option>
        <option>Venda</option>
        <option>Compra</option>
        <option>Despesa</option>
        <option>Peça</option>
      </select>

      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={input}
      />

      <button onClick={salvarMovimento} style={botao}>
        Salvar movimentação
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Histórico do Caixa</h2>

      {movimentos.map((mov) => (
        <div key={mov.id} style={cardLista}>
          <strong>
            {mov.tipo} - {mov.categoria}
          </strong>
          <p>{mov.descricao}</p>
          <p>Valor: R$ {Number(mov.valor || 0).toFixed(2)}</p>
        </div>
      ))}
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

const card = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "20px",
  borderRadius: "12px",
  minWidth: "200px",
};

const numero = {
  fontSize: "26px",
  color: "#22c55e",
};

const cardLista = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};