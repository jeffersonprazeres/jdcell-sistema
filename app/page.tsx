"use client";

import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("JEFFERSONPRAZER@HOTMAIL.COM");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function entrar() {
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
  setErro(error.message);
  console.log(error);
  return;
}

window.location.href = "/dashboard";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#1e293b",
          padding: "30px",
          borderRadius: "15px",
        }}
      >
        <h1
          style={{
            color: "#22c55e",
            textAlign: "center",
            fontSize: "42px",
            marginBottom: "20px",
          }}
        >
          JD CELL
        </h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            color: "#000",
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            color: "#000",
          }}
        />

        {erro && (
          <p
            style={{
              color: "#f87171",
              marginBottom: "10px",
            }}
          >
            {erro}
          </p>
        )}

        <button
          onClick={entrar}
          style={{
            width: "100%",
            background: "#22c55e",
            color: "#fff",
            border: "none",
            padding: "12px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Entrar
        </button>
      </div>
    </main>
  );
}