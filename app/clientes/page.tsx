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
        nome: nome,
        telefone: telefone,
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

  useEffect(() => {
    carregarClientes();
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
      <h1>Cadastro de Clientes</h1>

      <br />

      <input
        type="text"
        placeholder="Nome do Cliente"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
          marginBottom: "10px",
          display: "block",
          color: "#000",
        }}
      />

      <input
        type="text"
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
          marginBottom: "10px",
          display: "block",
          color: "#000",
        }}
      />

      <button
        onClick={salvarCliente}
        style={{
          padding: "10px 20px",
          background: "#22c55e",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Salvar Cliente
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Clientes cadastrados</h2>

      <div style={{ marginTop: "15px" }}>
        {clientes.length === 0 && <p>Nenhum cliente cadastrado ainda.</p>}

        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            style={{
              background: "#1e293b",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "10px",
            }}
          >
            <strong>{cliente.nome}</strong>
            <p>{cliente.telefone || "Sem telefone"}</p>
          </div>
        ))}
      </div>
    </main>
  );
}