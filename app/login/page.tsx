"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("JEFFERSONPRAZER@HOTMAIL.COM");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function entrar() {
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: senha,
    });

    if (error) {
      setErro("Email ou senha inválidos.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "380px",
          background: "rgba(30,41,59,0.95)",
          padding: "30px",
          borderRadius: "15px",
        }}
      >
        <h1 style={{ color: "#22c55e", textAlign: "center" }}>JD CELL</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={input}
        />

        {erro && <p style={{ color: "#f87171" }}>{erro}</p>}

        <button onClick={entrar} style={botao}>
          Entrar
        </button>
      </div>
    </main>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "8px",
  color: "#000",
};

const botao = {
  width: "100%",
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  cursor: "pointer",
};