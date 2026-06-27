"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";

type Orcamento = {
  id: string;
  cliente: string;
  telefone: string;
  aparelho: string;
  defeito: string;
  peca: string;
  total: number;
  status: string;
};

export default function Orcamentos() {
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [aparelho, setAparelho] = useState("");
  const [defeito, setDefeito] = useState("");
  const [peca, setPeca] = useState("");
  const [total, setTotal] = useState("");
  const [status, setStatus] = useState("Aguardando aprovação");
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [mensagem, setMensagem] = useState("");

  async function carregarOrcamentos() {
    const { data, error } = await supabase
      .from("orcamentos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar orçamentos: " + error.message);
      return;
    }

    setOrcamentos((data as Orcamento[]) || []);
  }

  async function salvarOrcamento() {
    setMensagem("");

    if (!cliente || !aparelho || !defeito || !total) {
      setMensagem("Preencha cliente, aparelho, defeito e total.");
      return;
    }

    const { error } = await supabase.from("orcamentos").insert([
      {
        cliente,
        telefone,
        aparelho,
        defeito,
        peca,
        total: Number(total || 0),
        status,
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar orçamento: " + error.message);
      return;
    }

    setMensagem("Orçamento salvo com sucesso!");
    setCliente("");
    setTelefone("");
    setAparelho("");
    setDefeito("");
    setPeca("");
    setTotal("");
    setStatus("Aguardando aprovação");
    carregarOrcamentos();
  }

  async function atualizarStatus(id: string, novoStatus: string) {
    const { error } = await supabase
      .from("orcamentos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar status: " + error.message);
      return;
    }

    carregarOrcamentos();
  }

  async function converterParaOS(orcamento: Orcamento) {
    const confirmar = confirm(
      `Deseja converter o orçamento de ${orcamento.cliente} em Ordem de Serviço?`
    );

    if (!confirmar) return;

    const { error: erroOS } = await supabase.from("ordens_servico").insert([
      {
        marca: "",
        modelo: orcamento.aparelho,
        imei: "",
        defeito_relatado: orcamento.defeito,
        senha_aparelho: "",
        acessorios: "",
        servico_executado: "",
        status: "Recebido",
        produto_nome: orcamento.peca || null,
        custo_pecas: 0,
        valor_mao_obra: 0,
        valor_final: Number(orcamento.total || 0),
        garantia_dias: 90,
      },
    ]);

    if (erroOS) {
      alert("Erro ao converter para OS: " + erroOS.message);
      return;
    }

    const { error: erroOrcamento } = await supabase
      .from("orcamentos")
      .update({ status: "Aprovado" })
      .eq("id", orcamento.id);

    if (erroOrcamento) {
      alert(
        "OS criada, mas erro ao atualizar orçamento: " +
          erroOrcamento.message
      );
      return;
    }

    alert("Orçamento convertido em OS com sucesso!");
    carregarOrcamentos();
  }

  function enviarWhatsApp(orcamento: Orcamento) {
    if (!orcamento.telefone) {
      alert("Este orçamento não possui telefone cadastrado.");
      return;
    }

    let telefoneLimpo = orcamento.telefone.replace(/\D/g, "");

    if (!telefoneLimpo.startsWith("55")) {
      telefoneLimpo = "55" + telefoneLimpo;
    }

    const texto = `Olá ${orcamento.cliente}!

Seu orçamento na JD CELL:

📱 Aparelho: ${orcamento.aparelho}
🔧 Defeito: ${orcamento.defeito}
📦 Peça: ${orcamento.peca || "Não informada"}
💰 Valor: R$ ${Number(orcamento.total || 0).toFixed(2)}

Status: ${orcamento.status}

Aguardamos sua confirmação.
JD CELL`;

    window.open(
      `https://api.whatsapp.com/send?phone=${telefoneLimpo}&text=${encodeURIComponent(
        texto
      )}`,
      "_blank"
    );
  }

  function imprimirOrcamento(orcamento: Orcamento) {
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString("pt-BR");

    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94);
    doc.text("JD CELL", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Assistência Técnica Especializada", 105, 28, { align: "center" });
    doc.text("Arca Taquaralto - Box 25", 105, 35, { align: "center" });
    doc.text("(63) 99981-8305", 105, 42, { align: "center" });

    doc.setDrawColor(34, 197, 94);
    doc.line(20, 48, 190, 48);

    doc.setFontSize(18);
    doc.setTextColor(34, 197, 94);
    doc.text("ORÇAMENTO", 20, 62);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Data: ${dataAtual}`, 20, 72);

    doc.setFontSize(13);
    doc.text(`Cliente: ${orcamento.cliente}`, 20, 88);
    doc.text(`Telefone: ${orcamento.telefone || "Não informado"}`, 20, 100);
    doc.text(`Aparelho: ${orcamento.aparelho}`, 20, 112);
    doc.text(`Defeito: ${orcamento.defeito}`, 20, 124);
    doc.text(`Peça: ${orcamento.peca || "Não informada"}`, 20, 136);
    doc.text(`Status: ${orcamento.status}`, 20, 148);

    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94);
    doc.text(`Total: R$ ${Number(orcamento.total || 0).toFixed(2)}`, 20, 164);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(
      "Este orçamento está sujeito à aprovação do cliente e disponibilidade de peças.",
      20,
      182
    );

    doc.line(20, 220, 90, 220);
    doc.line(120, 220, 190, 220);

    doc.text("Assinatura do Cliente", 35, 228);
    doc.text("JD CELL", 145, 228);

    doc.save(`orcamento-${orcamento.cliente}.pdf`);
  }

  async function excluirOrcamento(id: string) {
    const confirmar = confirm("Deseja excluir este orçamento?");
    if (!confirmar) return;

    const { error } = await supabase.from("orcamentos").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir orçamento: " + error.message);
      return;
    }

    carregarOrcamentos();
  }

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>Orçamentos</h1>

      <input type="text" placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} style={input} />

      <input type="text" placeholder="Telefone / WhatsApp" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={input} />

      <input type="text" placeholder="Aparelho" value={aparelho} onChange={(e) => setAparelho(e.target.value)} style={input} />

      <input type="text" placeholder="Defeito" value={defeito} onChange={(e) => setDefeito(e.target.value)} style={input} />

      <input type="text" placeholder="Peça" value={peca} onChange={(e) => setPeca(e.target.value)} style={input} />

      <input type="number" placeholder="Total" value={total} onChange={(e) => setTotal(e.target.value)} style={input} />

      <select value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
        <option>Aguardando aprovação</option>
        <option>Aprovado</option>
        <option>Reprovado</option>
      </select>

      <button onClick={salvarOrcamento} style={botao}>
        Salvar Orçamento
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Orçamentos cadastrados</h2>

      {orcamentos.length === 0 && <p>Nenhum orçamento cadastrado.</p>}

      {orcamentos.map((orcamento) => (
        <div key={orcamento.id} style={card}>
          <strong>{orcamento.cliente}</strong>
          <p>Telefone: {orcamento.telefone || "Não informado"}</p>
          <p>Aparelho: {orcamento.aparelho}</p>
          <p>Defeito: {orcamento.defeito}</p>
          <p>Peça: {orcamento.peca || "Não informada"}</p>
          <p>Total: R$ {Number(orcamento.total || 0).toFixed(2)}</p>

          <label>Status:</label>
          <select
            value={orcamento.status}
            onChange={(e) => atualizarStatus(orcamento.id, e.target.value)}
            style={inputPequeno}
          >
            <option>Aguardando aprovação</option>
            <option>Aprovado</option>
            <option>Reprovado</option>
          </select>

          <button onClick={() => enviarWhatsApp(orcamento)} style={botaoWhatsApp}>
            Enviar WhatsApp
          </button>

          <button onClick={() => imprimirOrcamento(orcamento)} style={botaoPdf}>
            Imprimir Orçamento
          </button>

          {orcamento.status !== "Aprovado" && (
            <button
              onClick={() => converterParaOS(orcamento)}
              style={botaoConverter}
            >
              Converter em OS
            </button>
          )}

          <button
            onClick={() => excluirOrcamento(orcamento.id)}
            style={botaoExcluir}
          >
            Excluir
          </button>
        </div>
      ))}

      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={{ ...botao, marginTop: "20px" }}
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
  width: "250px",
  padding: "8px",
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

const botaoWhatsApp = {
  ...botao,
  background: "#25D366",
  marginRight: "10px",
};

const botaoPdf = {
  ...botao,
  background: "#a855f7",
  marginRight: "10px",
};

const botaoConverter = {
  ...botao,
  background: "#0ea5e9",
  marginRight: "10px",
};

const botaoExcluir = {
  ...botao,
  background: "#ef4444",
};

const card = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};