"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Garantia = {
  id: string;
  cliente: string;
  aparelho: string;
  servico: string;
  data_entrega: string;
  garantia_dias: number;
  data_vencimento: string;
  status: string;
};

export default function Garantias() {
  const [cliente, setCliente] = useState("");
  const [aparelho, setAparelho] = useState("");
  const [servico, setServico] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [garantiaDias, setGarantiaDias] = useState("90");
  const [garantias, setGarantias] = useState<Garantia[]>([]);

  async function carregarGarantias() {
    const { data } = await supabase
      .from("garantias")
      .select("*")
      .order("created_at", { ascending: false });

    setGarantias((data as Garantia[]) || []);
  }

  async function salvarGarantia() {
    const entrega = new Date(dataEntrega);

    const vencimento = new Date(entrega);
    vencimento.setDate(
      vencimento.getDate() + Number(garantiaDias)
    );

    const { error } = await supabase.from("garantias").insert([
      {
        cliente,
        aparelho,
        servico,
        data_entrega: dataEntrega,
        garantia_dias: Number(garantiaDias),
        data_vencimento: vencimento.toISOString().split("T")[0],
        status: "Ativa",
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setCliente("");
    setAparelho("");
    setServico("");
    setDataEntrega("");
    setGarantiaDias("90");

    carregarGarantias();
  }

  async function excluirGarantia(id: string) {
    if (!confirm("Excluir garantia?")) return;

    await supabase
      .from("garantias")
      .delete()
      .eq("id", id);

    carregarGarantias();
  }

  useEffect(() => {
    carregarGarantias();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "30px",
        color: "#fff",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>
        Garantias
      </h1>

      <input
        placeholder="Cliente"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        style={input}
      />

      <input
        placeholder="Aparelho"
        value={aparelho}
        onChange={(e) => setAparelho(e.target.value)}
        style={input}
      />

      <input
        placeholder="Serviço"
        value={servico}
        onChange={(e) => setServico(e.target.value)}
        style={input}
      />

      <input
        type="date"
        value={dataEntrega}
        onChange={(e) => setDataEntrega(e.target.value)}
        style={input}
      />

      <input
        type="number"
        value={garantiaDias}
        onChange={(e) =>
          setGarantiaDias(e.target.value)
        }
        style={input}
      />

      <button
        onClick={salvarGarantia}
        style={botao}
      >
        Salvar Garantia
      </button>

      <hr
        style={{
          margin: "30px 0",
          borderColor: "#334155",
        }}
      />

      {garantias.map((garantia) => {
        const vencida =
          new Date(garantia.data_vencimento) <
          new Date();

        return (
          <div
            key={garantia.id}
            style={{
              ...card,
              border:
                vencida
                  ? "2px solid #ef4444"
                  : "2px solid #22c55e",
            }}
          >
            <strong>
              {garantia.cliente}
            </strong>

            <p>
              Aparelho: {garantia.aparelho}
            </p>

            <p>
              Serviço: {garantia.servico}
            </p>

            <p>
              Entrega: {garantia.data_entrega}
            </p>

            <p>
              Vencimento:{" "}
              {garantia.data_vencimento}
            </p>

            <p>
              Status:{" "}
              {vencida
                ? "Vencida"
                : "Ativa"}
            </p>

            <button
              onClick={() =>
                excluirGarantia(
                  garantia.id
                )
              }
              style={botaoExcluir}
            >
              Excluir
            </button>
          </div>
        );
      })}

      <button
        onClick={() =>
          (window.location.href =
            "/dashboard")
        }
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
  ...botao,
  background: "#ef4444",
};

const card = {
  background: "rgba(30,41,59,0.90)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};