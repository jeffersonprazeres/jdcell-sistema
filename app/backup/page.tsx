"use client";

import { supabase } from "../lib/supabase";
import * as XLSX from "xlsx";

export default function Backup() {
  async function exportarBackup() {
    const tabelas = [
      "clientes",
      "ordens_servico",
      "orcamentos",
      "estoque",
      "caixa",
      "contas_pagar",
      "garantias",
      "movimentacoes_estoque",
    ];

    const workbook = XLSX.utils.book_new();

    for (const tabela of tabelas) {
      const { data, error } = await supabase.from(tabela).select("*");

      if (error) {
        alert(`Erro ao exportar ${tabela}: ${error.message}`);
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data || []);
      XLSX.utils.book_append_sheet(workbook, worksheet, tabela.substring(0, 31));
    }

    const dataHoje = new Date().toISOString().split("T")[0];

    XLSX.writeFile(workbook, `backup-jd-cell-${dataHoje}.xlsx`);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#22c55e" }}>Backup JD CELL</h1>

      <p>Exporta os dados principais do sistema para Excel.</p>

      <button onClick={exportarBackup} style={botao}>
        Baixar Backup Excel
      </button>

      <br />

      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={{ ...botao, marginTop: "20px" }}
      >
        Voltar Dashboard
      </button>
    </main>
  );
}

const botao = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "10px",
};