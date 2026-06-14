"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  created_at: string;
};

export default function Clientes() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");

  async function carregarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar clientes: " + error.message);
      return;
    }

    setClientes(data || []);
  }

  async function salvarCliente() {
    setMensagem("");

    if (!nome) {
      setMensagem("Digite o nome do cliente.");
      return;
    }

    const { error } = await supabase.from("clientes").insert([
      {
        nome,
        telefone,
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar: " + error.message);
      return;
    }

    setMensagem("Cliente salvo com sucesso!");
    setNome("");
    setTelefone("");
    carregarClientes();
  }

  async function atualizarCliente(
    id: string,
    campo: "nome" | "telefone",
    valor: string
  ) {
    const { error } = await supabase
      .from("clientes")
      .update({ [campo]: valor })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar cliente: " + error.message);
      return;
    }

    carregarClientes();
  }

  async function excluirCliente(id: string, nomeCliente: string) {
    const confirmar = confirm(`Deseja excluir o cliente "${nomeCliente}"?`);

    if (!confirmar) return;

    const { error } = await supabase.from("clientes").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir cliente: " + error.message);
      return;
    }

    alert("Cliente excluído com sucesso!");
    carregarClientes();
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busca.toLowerCase();

    return (
      cliente.nome?.toLowerCase().includes(texto) ||
      cliente.telefone?.includes(texto)
    );
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1>Cadastro de Clientes</h1>

      <br />

      <input
        type="text"
        placeholder="Nome do Cliente"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={input}
      />

      <input
        type="text"
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={input}
      />

      <button onClick={salvarCliente} style={botao}>
        Salvar Cliente
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Clientes cadastrados</h2>

      <input
        type="text"
        placeholder="Pesquisar por nome ou telefone"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={input}
      />

      <div style={{ marginTop: "15px" }}>
        {clientesFiltrados.length === 0 && <p>Nenhum cliente encontrado.</p>}

        {clientesFiltrados.map((cliente) => (
          <div key={cliente.id} style={cardCliente}>
            <label>Nome:</label>
            <input
              type="text"
              defaultValue={cliente.nome}
              onBlur={(e) =>
                atualizarCliente(cliente.id, "nome", e.target.value)
              }
              style={inputPequeno}
            />

            <label>Telefone:</label>
            <input
              type="text"
              defaultValue={cliente.telefone}
              onBlur={(e) =>
                atualizarCliente(cliente.id, "telefone", e.target.value)
              }
              style={inputPequeno}
            />

            <button
              onClick={() => excluirCliente(cliente.id, cliente.nome)}
              style={botaoExcluir}
            >
              Excluir cliente
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

const input = {
  width: "300px",
  padding: "10px",
  marginBottom: "10px",
  display: "block",
  color: "#000",
};

const inputPequeno = {
  width: "260px",
  padding: "8px",
  marginBottom: "10px",
  display: "block",
  color: "#000",
};

const botao = {
  padding: "10px 20px",
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const botaoExcluir = {
  padding: "10px 15px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "10px",
};

const cardCliente = {
  background: "rgba(30, 41, 59, 0.92)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};