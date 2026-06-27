"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type OrdemServico = {
  id: string;
  numero_os: number;
  marca: string;
  modelo: string;
  cor: string | null;
  imei: string | null;
  imei1: string | null;
  imei2: string | null;
  numero_serie: string | null;
  bateria: number | null;
  estado_aparelho: string | null;
  defeito_relatado: string;
  servico_executado: string;
  tecnico: string | null;
  data_previsao: string | null;
  foto_aparelho: string | null;
  foto_url: string | null;
  status: string;
  created_at: string;
  data_entrega: string | null;
  garantia_dias: number | null;
  clientes: {
    nome: string;
    telefone: string;
  } | null;
};

const etapas = [
  "Recebido",
  "Em análise",
  "Aguardando aprovação",
  "Aguardando peça",
  "Em reparo",
  "Pronto",
  "Finalizado",
  "Entregue",
];

export default function ConsultaOS() {
  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [mensagem, setMensagem] = useState("Carregando OS...");

  async function carregarOS() {
    const params = new URLSearchParams(window.location.search);
    const numero = params.get("os");

    if (!numero) {
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
        cor,
        imei,
        imei1,
        imei2,
        numero_serie,
        bateria,
        estado_aparelho,
        defeito_relatado,
        servico_executado,
        tecnico,
        data_previsao,
        foto_aparelho,
        foto_url,
        status,
        created_at,
        data_entrega,
        garantia_dias,
        clientes (
          nome,
          telefone
        )
      `)
      .eq("numero_os", Number(numero))
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
        <div style={card}>
          <h1 style={titulo}>JD CELL</h1>
          <p>{mensagem}</p>
        </div>
      </main>
    );
  }

  const foto = ordem.foto_aparelho || ordem.foto_url;
  const statusIndex = etapas.indexOf(ordem.status);

  return (
    <main style={pagina}>
      <div style={card}>
        <div style={cabecalho}>
          <img src="/jdcell-logo.png" alt="JD CELL" style={logo} />
          <div>
            <h1 style={titulo}>JD CELL</h1>
            <p style={{ margin: 0 }}>Assistência Técnica Especializada</p>
            <p style={{ margin: 0 }}>Consulta da Ordem de Serviço</p>
          </div>
        </div>

        <div style={numeroBox}>OS Nº {ordem.numero_os}</div>

        <section style={box}>
          <h2>Cliente</h2>
          <p><strong>Nome:</strong> {ordem.clientes?.nome || "Não informado"}</p>
          <p><strong>Telefone:</strong> {ordem.clientes?.telefone || "Não informado"}</p>
        </section>

        <section style={box}>
          <h2>Aparelho</h2>
          <p><strong>Marca:</strong> {ordem.marca}</p>
          <p><strong>Modelo:</strong> {ordem.modelo}</p>
          <p><strong>Cor:</strong> {ordem.cor || "Não informada"}</p>
          <p><strong>IMEI:</strong> {ordem.imei1 || ordem.imei || "Não informado"}</p>
          <p><strong>Nº Série:</strong> {ordem.numero_serie || "Não informado"}</p>
        </section>

        <section style={box}>
          <h2>Status Atual</h2>
          <div style={statusAtual}>{ordem.status}</div>

          <div style={{ marginTop: "15px" }}>
            {etapas.map((etapa, index) => {
              const concluido = statusIndex >= index;

              return (
                <div key={etapa} style={linhaStatus}>
                  <span style={bolinha(concluido)}>
                    {concluido ? "✓" : ""}
                  </span>
                  <span>{etapa}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section style={box}>
          <h2>Defeito Relatado</h2>
          <p>{ordem.defeito_relatado || "Não informado"}</p>
        </section>

        <section style={box}>
          <h2>Serviço</h2>
          <p>{ordem.servico_executado || "Ainda não informado"}</p>
          <p><strong>Técnico:</strong> {ordem.tecnico || "Não informado"}</p>
          <p><strong>Data prevista:</strong> {ordem.data_previsao || "Não informada"}</p>
        </section>

        {foto && (
          <section style={box}>
            <h2>Foto do Aparelho</h2>
            <img src={foto} alt="Aparelho" style={fotoStyle} />
          </section>
        )}

        <section style={garantia}>
          <strong>Garantia:</strong>{" "}
          {ordem.status === "Entregue"
            ? `${ordem.garantia_dias || 90} dias após a entrega.`
            : "A garantia será válida após a entrega do aparelho."}
        </section>
      </div>
    </main>
  );
}

const pagina = {
  minHeight: "100vh",
  background: "#0f172a",
  color: "#fff",
  padding: "20px",
  fontFamily: "Arial, sans-serif",
};

const card = {
  maxWidth: "760px",
  margin: "0 auto",
  background: "rgba(30, 41, 59, 0.95)",
  borderRadius: "16px",
  padding: "25px",
};

const cabecalho = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  borderBottom: "2px solid #22c55e",
  paddingBottom: "15px",
};

const logo = {
  width: "95px",
};

const titulo = {
  margin: 0,
  color: "#22c55e",
};

const numeroBox = {
  marginTop: "20px",
  background: "#22c55e",
  color: "#fff",
  padding: "14px",
  borderRadius: "10px",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
};

const box = {
  marginTop: "18px",
  background: "#111827",
  padding: "15px",
  borderRadius: "12px",
};

const statusAtual = {
  background: "#14532d",
  color: "#fff",
  padding: "12px",
  borderRadius: "10px",
  fontSize: "22px",
  fontWeight: "bold",
};

const linhaStatus = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px",
};

const bolinha = (ativo: boolean) => ({
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  background: ativo ? "#22c55e" : "#334155",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
});

const fotoStyle = {
  width: "100%",
  maxWidth: "360px",
  borderRadius: "10px",
};

const garantia = {
  marginTop: "18px",
  background: "#064e3b",
  padding: "15px",
  borderRadius: "12px",
};