"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type OS = {
  id: string;
  status: string;
  custo_pecas: number;
  valor_final: number;
  created_at: string;
};

type MovimentoCaixa = {
  id: string;
  tipo: string;
  valor: number;
  created_at: string;
};

type Produto = {
  id: string;
  nome: string;
  quantidade: number;
  valor_custo: number;
};

export default function Relatorios() {
  const [ordens, setOrdens] = useState<OS[]>([]);
  const [caixa, setCaixa] = useState<MovimentoCaixa[]>([]);
  const [clientes, setClientes] = useState(0);
  const [produtosBaixo, setProdutosBaixo] = useState<Produto[]>([]);
  const [totalPecas, setTotalPecas] = useState(0);
  const [valorEstoque, setValorEstoque] = useState(0);
  const [mensagem, setMensagem] = useState("");

  async function carregarRelatorios() {
    const { data: osData, error: osError } = await supabase
      .from("ordens_servico")
      .select("id, status, custo_pecas, valor_final, created_at");

    if (osError) {
      setMensagem("Erro ao carregar OS: " + osError.message);
      return;
    }

    const { data: caixaData, error: caixaError } = await supabase
      .from("caixa")
      .select("id, tipo, valor, created_at");

    if (caixaError) {
      setMensagem("Erro ao carregar caixa: " + caixaError.message);
      return;
    }

    const { count } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true });

    const { data: estoqueBaixo } = await supabase
      .from("estoque")
      .select("id, nome, quantidade, valor_custo")
      .lte("quantidade", 2)
      .order("quantidade", { ascending: true });

    const { data: estoqueGeral } = await supabase
      .from("estoque")
      .select("id, nome, quantidade, valor_custo");

    const estoqueLista = (estoqueGeral as Produto[]) || [];

    const quantidadeTotal = estoqueLista.reduce(
      (total, produto) => total + Number(produto.quantidade || 0),
      0
    );

    const valorTotalEstoque = estoqueLista.reduce(
      (total, produto) =>
        total +
        Number(produto.quantidade || 0) * Number(produto.valor_custo || 0),
      0
    );

    setOrdens(osData || []);
    setCaixa(caixaData || []);
    setClientes(count || 0);
    setProdutosBaixo((estoqueBaixo as Produto[]) || []);
    setTotalPecas(quantidadeTotal);
    setValorEstoque(valorTotalEstoque);
  }

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const totalOS = ordens.length;

  const osAbertas = ordens.filter(
    (os) => os.status !== "Entregue" && os.status !== "Finalizado"
  ).length;

  const osFinalizadas = ordens.filter(
    (os) => os.status === "Entregue" || os.status === "Finalizado"
  ).length;

  const faturamentoOS = ordens.reduce(
    (total, os) => total + Number(os.valor_final || 0),
    0
  );

  const custoPecas = ordens.reduce(
    (total, os) => total + Number(os.custo_pecas || 0),
    0
  );

  const lucroOS = faturamentoOS - custoPecas;

  const entradasCaixa = caixa
    .filter((mov) => mov.tipo === "Entrada")
    .reduce((total, mov) => total + Number(mov.valor || 0), 0);

  const saidasCaixa = caixa
    .filter((mov) => mov.tipo === "Saída")
    .reduce((total, mov) => total + Number(mov.valor || 0), 0);

  const saldoCaixa = entradasCaixa - saidasCaixa;

  function gerarPDF() {
    const dataAtual = new Date().toLocaleString("pt-BR");
    const janela = window.open("", "_blank");

    if (!janela) return;

    janela.document.write(`
      <html>
        <head>
          <title>Relatório JD CELL</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #111;
              background-image: url('/jdcell-logo.png');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: 450px;
            }

            .header {
              text-align: center;
              border-bottom: 2px solid #111;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }

            .logo {
              width: 130px;
              margin-bottom: 10px;
            }

            h1 {
              margin: 0;
              color: #16a34a;
            }

            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin-bottom: 25px;
            }

            .card {
              border: 1px solid #ddd;
              border-radius: 10px;
              padding: 14px;
              background: rgba(248, 250, 252, 0.92);
            }

            .card h3 {
              margin: 0 0 8px 0;
              font-size: 15px;
              color: #334155;
            }

            .valor {
              font-size: 24px;
              font-weight: bold;
              color: #16a34a;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              background: rgba(255,255,255,0.92);
            }

            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #e2e8f0;
            }

            .footer {
              margin-top: 35px;
              font-size: 12px;
              text-align: center;
              color: #555;
            }

            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>

        <body>
          <div class="header">
            <img src="/jdcell-logo.png" class="logo" />
            <h1>JD CELL</h1>
            <h2>Relatório Geral</h2>
            <p>Gerado em: ${dataAtual}</p>
          </div>

          <div class="grid">
            <div class="card">
              <h3>Total de Clientes</h3>
              <div class="valor">${clientes}</div>
            </div>

            <div class="card">
              <h3>Total de OS</h3>
              <div class="valor">${totalOS}</div>
            </div>

            <div class="card">
              <h3>OS Abertas</h3>
              <div class="valor">${osAbertas}</div>
            </div>

            <div class="card">
              <h3>OS Finalizadas</h3>
              <div class="valor">${osFinalizadas}</div>
            </div>

            <div class="card">
              <h3>Total de Peças</h3>
              <div class="valor">${totalPecas}</div>
            </div>

            <div class="card">
              <h3>Valor em Estoque</h3>
              <div class="valor">R$ ${valorEstoque.toFixed(2)}</div>
            </div>

            <div class="card">
              <h3>Faturamento OS</h3>
              <div class="valor">R$ ${faturamentoOS.toFixed(2)}</div>
            </div>

            <div class="card">
              <h3>Custo de Peças</h3>
              <div class="valor">R$ ${custoPecas.toFixed(2)}</div>
            </div>

            <div class="card">
              <h3>Lucro OS</h3>
              <div class="valor">R$ ${lucroOS.toFixed(2)}</div>
            </div>

            <div class="card">
              <h3>Saldo do Caixa</h3>
              <div class="valor">R$ ${saldoCaixa.toFixed(2)}</div>
            </div>
          </div>

          <h2>Produtos com Estoque Baixo</h2>

          ${
            produtosBaixo.length === 0
              ? "<p>Nenhum produto com estoque baixo.</p>"
              : `
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Custo Unitário</th>
                      <th>Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${produtosBaixo
                      .map(
                        (produto) => `
                          <tr>
                            <td>${produto.nome}</td>
                            <td>${produto.quantidade}</td>
                            <td>R$ ${Number(produto.valor_custo || 0).toFixed(2)}</td>
                            <td>R$ ${(
                              Number(produto.quantidade || 0) *
                              Number(produto.valor_custo || 0)
                            ).toFixed(2)}</td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
          }

          <div class="footer">
            <p>Relatório gerado pelo sistema JD CELL</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    janela.document.close();
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
      <h1 style={{ color: "#22c55e" }}>Relatórios JD CELL</h1>

      {mensagem && <p>{mensagem}</p>}

      <div style={gridCards}>
        <div style={card}>
          <h3>Clientes</h3>
          <strong style={numero}>{clientes}</strong>
        </div>

        <div style={card}>
          <h3>Total de OS</h3>
          <strong style={numero}>{totalOS}</strong>
        </div>

        <div style={card}>
          <h3>OS Abertas</h3>
          <strong style={numero}>{osAbertas}</strong>
        </div>

        <div style={card}>
          <h3>OS Finalizadas</h3>
          <strong style={numero}>{osFinalizadas}</strong>
        </div>

        <div style={card}>
          <h3>Total de Peças</h3>
          <strong style={numero}>{totalPecas}</strong>
        </div>

        <div style={card}>
          <h3>Valor em Estoque</h3>
          <strong style={numero}>R$ {valorEstoque.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Faturamento OS</h3>
          <strong style={numero}>R$ {faturamentoOS.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Custo Peças</h3>
          <strong style={numero}>R$ {custoPecas.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Lucro OS</h3>
          <strong style={numero}>R$ {lucroOS.toFixed(2)}</strong>
        </div>

        <div style={card}>
          <h3>Saldo Caixa</h3>
          <strong style={numero}>R$ {saldoCaixa.toFixed(2)}</strong>
        </div>

        <div style={cardAlerta}>
          <h3>⚠️ Estoque Baixo</h3>
          <strong style={numero}>{produtosBaixo.length} produtos</strong>
        </div>
      </div>

      <h2 style={{ marginTop: "40px" }}>Produtos com Estoque Baixo</h2>

      {produtosBaixo.length === 0 ? (
        <p>Nenhum produto com estoque baixo.</p>
      ) : (
        <table style={tabela}>
          <thead>
            <tr>
              <th style={celula}>Produto</th>
              <th style={celula}>Quantidade</th>
              <th style={celula}>Custo Unitário</th>
              <th style={celula}>Valor Total</th>
            </tr>
          </thead>

          <tbody>
            {produtosBaixo.map((produto) => (
              <tr key={produto.id}>
                <td style={celula}>{produto.nome}</td>
                <td style={celula}>{produto.quantidade}</td>
                <td style={celula}>
                  R$ {Number(produto.valor_custo || 0).toFixed(2)}
                </td>
                <td style={celula}>
                  R${" "}
                  {(
                    Number(produto.quantidade || 0) *
                    Number(produto.valor_custo || 0)
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "30px" }}>
        <button onClick={gerarPDF} style={botao}>
          Gerar Relatório PDF
        </button>

        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={{ ...botao, marginLeft: "10px" }}
        >
          Voltar Dashboard
        </button>
      </div>
    </main>
  );
}

const gridCards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginTop: "30px",
};

const card = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "20px",
  borderRadius: "12px",
};

const cardAlerta = {
  background: "rgba(127, 29, 29, 0.92)",
  padding: "20px",
  borderRadius: "12px",
};

const numero = {
  fontSize: "28px",
  color: "#22c55e",
};

const botao = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};

const tabela = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "15px",
  background: "rgba(30, 41, 59, 0.90)",
} as const;

const celula = {
  border: "1px solid #334155",
  padding: "10px",
  color: "#fff",
} as const;