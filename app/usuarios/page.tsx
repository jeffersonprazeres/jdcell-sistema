"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  funcao: string;
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [funcao, setFuncao] = useState("Tecnico");
  const [mensagem, setMensagem] = useState("");

  async function carregarUsuarios() {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      setMensagem("Erro ao carregar usuários: " + error.message);
      return;
    }

    setUsuarios((data as Usuario[]) || []);
  }

  async function salvarUsuario() {
    setMensagem("");

    if (!nome || !email) {
      setMensagem("Preencha nome e email.");
      return;
    }

    const { error } = await supabase.from("usuarios").insert([
      {
        nome,
        email: email.toUpperCase().trim(),
        funcao,
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar usuário: " + error.message);
      return;
    }

    setNome("");
    setEmail("");
    setFuncao("Tecnico");
    setMensagem("Usuário cadastrado com sucesso!");

    carregarUsuarios();
  }

  async function alterarFuncao(id: string, novaFuncao: string) {
    const { error } = await supabase
      .from("usuarios")
      .update({
        funcao: novaFuncao,
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao alterar função: " + error.message);
      return;
    }

    carregarUsuarios();
  }

  async function excluirUsuario(id: string, emailUsuario: string) {
    if (emailUsuario === "JEFFERSONPRAZER@HOTMAIL.COM") {
      alert("Usuário principal não pode ser excluído.");
      return;
    }

    if (!confirm("Excluir usuário?")) return;

    const { error } = await supabase.from("usuarios").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir usuário: " + error.message);
      return;
    }

    carregarUsuarios();
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "30px",
        color: "#fff",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>Usuários</h1>

      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={input}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={input}
      />

      <select
        value={funcao}
        onChange={(e) => setFuncao(e.target.value)}
        style={input}
      >
        <option>Administrador</option>
        <option>Tecnico</option>
        <option>Atendente</option>
      </select>

      <button onClick={salvarUsuario} style={botao}>
        Salvar Usuário
      </button>

      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: "25px 0", borderColor: "#334155" }} />

      <h2>Funcionários</h2>

      {usuarios.map((usuario) => (
        <div key={usuario.id} style={card}>
          <strong>{usuario.nome}</strong>

          <p>{usuario.email}</p>

          <select
            value={usuario.funcao}
            onChange={(e) => alterarFuncao(usuario.id, e.target.value)}
            style={inputPequeno}
          >
            <option>Administrador</option>
            <option>Tecnico</option>
            <option>Atendente</option>
          </select>

          <button
            onClick={() => excluirUsuario(usuario.id, usuario.email)}
            style={botaoExcluir}
          >
            Excluir
          </button>
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

const input = {
  width: "350px",
  padding: "10px",
  display: "block",
  marginBottom: "10px",
  color: "#000",
};

const inputPequeno = {
  width: "220px",
  padding: "8px",
  color: "#000",
  marginRight: "10px",
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
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};

const card = {
  background: "rgba(30,41,59,.92)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};