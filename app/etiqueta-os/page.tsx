"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../lib/supabase";

type OrdemServico = {
  id: string;
  numero_os: number;
  marca: string;
  modelo: string;
  created_at: string;
  clientes: {
    nome: string;
    telefone: string;
  } | null;
};

export default function EtiquetaOS() {
  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [mensagem, setMensagem] = useState("Carregando etiqueta...");

  async function carregarOS() {
    const params = new URLSearchParams(window.location.search);
    const os = params.get("os");

    if (!os) {
      setMensagem("Número da OS não informado.");
      return;
    }

    const { data, error } = await supabase
      .from("ordens_servico")
      .select(`
        id,
        numero_os,
        marca,
        modelo,
        created_at,
        clientes (
          nome,
          telefone
        )
      `)
      .eq("numero_os", Number(os))
      .single();

    if (error) {
      setMensagem("OS não encontrada.");
      return;
    }

    setOrdem(data as unknown as OrdemServico);
    setMensagem("");
  }

  useEffect(() => {
    carregarOS();
  }, []);

  if (!ordem) {
    return (
      <main style={pagina}>
        <div style={etiqueta}>
          <strong>{mensagem}</strong>
        </div>
      </main>
    );
  }

  const linkConsulta = `${window.location.origin}/consulta-os?os=${ordem.numero_os}`;
  const dataEntrada = new Date(ordem.created_at).toLocaleDateString("pt-BR");

  return (
    <main style={pagina}>
      <button onClick={() => window.print()} style={botao}>
        Imprimir Etiqueta
      </button>

      <button
        onClick={() => (window.location.href = "/ordens-servico")}
        style={{ ...botao, background: "#334155", marginLeft: "10px" }}
      >
        Voltar
      </button>

      <div style={etiqueta}>
        <img src="/jdcell-logo.png" alt="JD CELL" style={logo} />

        <h2 style={{ margin: "4px 0" }}>JD CELL</h2>

        <div style={linhaGrande}>OS Nº {ordem.numero_os}</div>

        <p style={texto}>
          <strong>Cliente:</strong> {ordem.clientes?.nome || "Não informado"}
        </p>

        <p style={texto}>
          <strong>Aparelho:</strong> {ordem.marca} {ordem.modelo}
        </p>

        <p style={texto}>
          <strong>Entrada:</strong> {dataEntrada}
        </p>

        <div style={qrBox}>
          <QRCodeSVG value={linkConsulta} size={110} />
        </div>

        <small>Escaneie para consultar a OS</small>
      </div>

      <style jsx global>{`
        @media print {
          button {
            display: none !important;
          }

          body {
            background: white !important;
          }

          main {
            padding: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}

const pagina = {
  minHeight: "100vh",
  background: "#0f172a",
  color: "#000",
  padding: "30px",
};

const etiqueta = {
  width: "300px",
  minHeight: "420px",
  background: "#fff",
  padding: "16px",
  border: "1px solid #000",
  textAlign: "center" as const,
  fontFamily: "Arial, sans-serif",
};

const logo = {
  width: "65px",
};

const linhaGrande = {
  background: "#000",
  color: "#fff",
  padding: "6px",
  borderRadius: "4px",
  fontWeight: "bold",
  margin: "8px 0",
};

const texto = {
  fontSize: "13px",
  margin: "6px 0",
};

const qrBox = {
  margin: "12px auto",
  display: "flex",
  justifyContent: "center",
};

const botao = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "20px",
};