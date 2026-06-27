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
  senha_aparelho: string;
  acessorios: string;
  servico_executado: string;
  tecnico: string | null;
  data_previsao: string | null;
  foto_aparelho: string | null;
  foto_url: string | null;
  status: string;
  custo_pecas: number;
  valor_mao_obra: number;
  desconto: number;
  valor_final: number;
  produto_nome: string | null;
  created_at: string;
  data_entrega: string | null;
  garantia_dias: number | null;
  clientes: {
    nome: string;
    telefone: string;
  } | null;
};

export default function OrdemImpressao() {
  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [mensagem, setMensagem] = useState("Carregando OS...");

  async function carregarOS() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      setMensagem("ID da OS não informado.");
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
        senha_aparelho,
        acessorios,
        servico_executado,
        tecnico,
        data_previsao,
        foto_aparelho,
        foto_url,
        status,
        custo_pecas,
        valor_mao_obra,
        desconto,
        valor_final,
        produto_nome,
        created_at,
        data_entrega,
        garantia_dias,
        clientes (
          nome,
          telefone
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      setMensagem("Erro ao carregar OS: " + error.message);
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
        <p>{mensagem}</p>
      </main>
    );
  }

  const foto = ordem.foto_aparelho || ordem.foto_url;
  const lucro =
    Number(ordem.valor_final || 0) -
    Number(ordem.custo_pecas || 0) -
    Number(ordem.desconto || 0);

  return (
    <main style={pagina}>
      <div style={acoes}>
        <button onClick={() => window.print()} style={botaoImprimir}>
          Imprimir
        </button>

        <button
          onClick={() => (window.location.href = "/ordens-servico")}
          style={botaoVoltar}
        >
          Voltar
        </button>
      </div>

      <div style={folha}>
        <div style={marcaDagua}>JD CELL</div>

        <div style={cabecalho}>
          <img src="/jdcell-logo.png" alt="JD CELL" style={logo} />

          <div>
            <h1 style={{ margin: 0, color: "#22c55e" }}>JD CELL</h1>
            <p style={{ margin: 0 }}>Assistência Técnica Especializada</p>
            <p style={{ margin: 0 }}>Arca Taquaralto - Box 25</p>
            <p style={{ margin: 0 }}>(63) 99981-8305</p>
          </div>
        </div>

        <div style={barraTitulo}>
          ORDEM DE SERVIÇO Nº {ordem.numero_os}
        </div>

        <section style={box}>
          <h3 style={subtitulo}>Dados do Cliente</h3>
          <div style={grade2}>
            <p><strong>Cliente:</strong> {ordem.clientes?.nome || ""}</p>
            <p><strong>Telefone:</strong> {ordem.clientes?.telefone || ""}</p>
          </div>
        </section>

        <section style={box}>
          <h3 style={subtitulo}>Dados do Aparelho</h3>

          <div style={grade2}>
            <p><strong>Marca:</strong> {ordem.marca || ""}</p>
            <p><strong>Modelo:</strong> {ordem.modelo || ""}</p>
            <p><strong>Cor:</strong> {ordem.cor || ""}</p>
            <p><strong>IMEI 1:</strong> {ordem.imei1 || ordem.imei || ""}</p>
            <p><strong>IMEI 2:</strong> {ordem.imei2 || ""}</p>
            <p><strong>Nº Série:</strong> {ordem.numero_serie || ""}</p>
            <p><strong>Bateria:</strong> {ordem.bateria || ""}%</p>
            <p><strong>Estado:</strong> {ordem.estado_aparelho || ""}</p>
            <p><strong>Senha:</strong> {ordem.senha_aparelho || ""}</p>
            <p><strong>Acessórios:</strong> {ordem.acessorios || ""}</p>
          </div>
        </section>

        <section style={box}>
          <h3 style={subtitulo}>Defeito Relatado</h3>
          <p>{ordem.defeito_relatado || "Não informado"}</p>
        </section>

        <section style={box}>
          <h3 style={subtitulo}>Serviço Executado</h3>
          <p>{ordem.servico_executado || "Não informado"}</p>
        </section>

        <section style={box}>
          <h3 style={subtitulo}>Controle</h3>
          <div style={grade2}>
            <p><strong>Status:</strong> {ordem.status}</p>
            <p><strong>Técnico:</strong> {ordem.tecnico || "Não informado"}</p>
            <p><strong>Data entrada:</strong> {new Date(ordem.created_at).toLocaleDateString("pt-BR")}</p>
            <p><strong>Data prevista:</strong> {ordem.data_previsao || "Não informada"}</p>
            <p><strong>Peça usada:</strong> {ordem.produto_nome || "Não informada"}</p>
            <p><strong>Garantia:</strong> {ordem.garantia_dias || 90} dias</p>
          </div>
        </section>

        {foto && (
          <section style={box}>
            <h3 style={subtitulo}>Foto do Aparelho</h3>
            <img src={foto} alt="Foto do aparelho" style={fotoStyle} />
          </section>
        )}

        <section style={box}>
          <h3 style={subtitulo}>Valores</h3>

          <table style={tabela}>
            <tbody>
              <tr>
                <td>Valor da peça</td>
                <td style={valor}>R$ {Number(ordem.custo_pecas || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Mão de obra</td>
                <td style={valor}>R$ {Number(ordem.valor_mao_obra || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Desconto</td>
                <td style={valor}>R$ {Number(ordem.desconto || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Valor final</strong></td>
                <td style={valor}><strong>R$ {Number(ordem.valor_final || 0).toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td>Lucro estimado</td>
                <td style={valor}>R$ {lucro.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={garantia}>
          <strong>Garantia:</strong> A JD CELL concede garantia de{" "}
          {ordem.garantia_dias || 90} dias referente ao serviço executado.
          A garantia não cobre quedas, oxidação, mau uso, quebra de tela ou danos causados pelo cliente.
        </section>

        <div style={assinaturas}>
          <div style={linha}>Assinatura do Cliente</div>
          <div style={linha}>Responsável Técnico</div>
        </div>
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
  background: "#e5e7eb",
  color: "#000",
  padding: "30px",
  fontFamily: "Arial, sans-serif",
};

const acoes = {
  maxWidth: "800px",
  margin: "0 auto 20px auto",
};

const folha = {
  maxWidth: "800px",
  margin: "0 auto",
  background: "#fff",
  border: "1px solid #d1d5db",
  padding: "30px",
  position: "relative" as const,
  overflow: "hidden",
};

const marcaDagua = {
  position: "absolute" as const,
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%) rotate(-25deg)",
  fontSize: "95px",
  color: "rgba(34,197,94,0.06)",
  fontWeight: "bold",
  zIndex: 0,
};

const cabecalho = {
  position: "relative" as const,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  gap: "20px",
  borderBottom: "3px solid #22c55e",
  paddingBottom: "15px",
};

const logo = {
  width: "120px",
};

const barraTitulo = {
  position: "relative" as const,
  zIndex: 1,
  background: "#22c55e",
  color: "#fff",
  padding: "12px",
  borderRadius: "8px",
  textAlign: "center" as const,
  fontSize: "22px",
  fontWeight: "bold",
  marginTop: "20px",
  marginBottom: "20px",
};

const box = {
  position: "relative" as const,
  zIndex: 1,
  border: "1px solid #d1d5db",
  padding: "14px",
  marginTop: "12px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.92)",
};

const subtitulo = {
  color: "#22c55e",
  marginTop: 0,
};

const grade2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "6px 20px",
};

const fotoStyle = {
  width: "220px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const tabela = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const valor = {
  textAlign: "right" as const,
};

const garantia = {
  position: "relative" as const,
  zIndex: 1,
  marginTop: "20px",
  padding: "15px",
  background: "#f3f4f6",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
};

const assinaturas = {
  position: "relative" as const,
  zIndex: 1,
  display: "flex",
  justifyContent: "space-between",
  marginTop: "80px",
};

const linha = {
  width: "280px",
  borderTop: "1px solid #000",
  textAlign: "center" as const,
  paddingTop: "8px",
};

const botaoImprimir = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  marginRight: "10px",
};

const botaoVoltar = {
  ...botaoImprimir,
  background: "#334155",
};