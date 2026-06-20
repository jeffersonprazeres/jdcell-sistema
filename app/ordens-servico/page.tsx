"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
};

type Produto = {
  id: string;
  nome: string;
  fornecedor: string;
  quantidade: number;
  valor_custo: number;
  valor_venda: number;
};

type OrdemServico = {
  id: string;
  numero_os: number;
  marca: string;
  modelo: string;
  imei: string;
  defeito_relatado: string;
  senha_aparelho: string;
  acessorios: string;
  servico_executado: string;
  status: string;
  custo_pecas: number;
  valor_final: number;
  produto_id: string | null;
  produto_nome: string | null;
  created_at: string;
  clientes: {
    nome: string;
    telefone: string;
  } | null;
};

export default function OrdensServico() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [imei, setImei] = useState("");
  const [defeito, setDefeito] = useState("");
  const [senha, setSenha] = useState("");
  const [acessorios, setAcessorios] = useState("");
  const [servicoExecutado, setServicoExecutado] = useState("");
  const [status, setStatus] = useState("Recebido");
  const [produtoId, setProdutoId] = useState("");
  const [custoPecas, setCustoPecas] = useState("");
  const [valorFinal, setValorFinal] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");

  const lucro = Number(valorFinal || 0) - Number(custoPecas || 0);

  async function carregarClientes() {
    const { data } = await supabase
      .from("clientes")
      .select("id, nome, telefone")
      .order("nome", { ascending: true });

    setClientes(data || []);
  }

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("estoque")
      .select("id, nome, fornecedor, quantidade, valor_custo, valor_venda")
      .order("nome", { ascending: true });

    if (error) {
      setMensagem("Erro ao carregar estoque: " + error.message);
      return;
    }

    setProdutos((data as Produto[]) || []);
  }

  async function carregarOrdens() {
    const { data, error } = await supabase
      .from("ordens_servico")
      .select(`
        id,
        numero_os,
        marca,
        modelo,
        imei,
        defeito_relatado,
        senha_aparelho,
        acessorios,
        servico_executado,
        status,
        custo_pecas,
        valor_final,
        produto_id,
        produto_nome,
        created_at,
        clientes (
          nome,
          telefone
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar OS: " + error.message);
      return;
    }

    setOrdens((data as unknown as OrdemServico[]) || []);
  }

  function selecionarProduto(id: string) {
    setProdutoId(id);

    const produto = produtos.find((item) => String(item.id) === String(id));

    if (produto) {
      setCustoPecas(String(produto.valor_custo || 0));
    }
  }

  async function salvarOS() {
    setMensagem("");

    if (!clienteId) {
      setMensagem("Selecione um cliente.");
      return;
    }

    const produtoSelecionado = produtos.find(
      (produto) => String(produto.id) === String(produtoId)
    );

    const { error } = await supabase.from("ordens_servico").insert([
      {
        cliente_id: clienteId,
        marca,
        modelo,
        imei,
        defeito_relatado: defeito,
        senha_aparelho: senha,
        acessorios,
        servico_executado: servicoExecutado,
        status,
        produto_id: produtoSelecionado ? String(produtoSelecionado.id) : null,
        produto_nome: produtoSelecionado ? produtoSelecionado.nome : null,
        custo_pecas: Number(custoPecas || 0),
        valor_mao_obra: 0,
        valor_final: Number(valorFinal || 0),
        garantia_dias: 90,
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar OS: " + error.message);
      return;
    }

    setMensagem("Ordem de Serviço salva com sucesso!");

    setClienteId("");
    setMarca("");
    setModelo("");
    setImei("");
    setDefeito("");
    setSenha("");
    setAcessorios("");
    setServicoExecutado("");
    setStatus("Recebido");
    setProdutoId("");
    setCustoPecas("");
    setValorFinal("");

    carregarOrdens();
    carregarProdutos();
  }

  async function baixarEstoqueDaOS(ordem: OrdemServico) {
    if (!ordem.produto_id) return;

    const { data: produto, error } = await supabase
      .from("estoque")
      .select("id, quantidade")
      .eq("id", ordem.produto_id)
      .single();

    if (error || !produto) {
      alert("Não foi possível localizar a peça no estoque.");
      return;
    }

    const quantidadeAtual = Number(produto.quantidade || 0);

    if (quantidadeAtual <= 0) {
      alert("Atenção: essa peça já está sem estoque.");
      return;
    }

    const { error: erroEstoque } = await supabase
      .from("estoque")
      .update({ quantidade: quantidadeAtual - 1 })
      .eq("id", ordem.produto_id);

    if (erroEstoque) {
      alert("Erro ao baixar estoque: " + erroEstoque.message);
      return;
    }

    carregarProdutos();
  }

  async function atualizarStatusOS(ordem: OrdemServico, novoStatus: string) {
    const statusAnterior = ordem.status;

    const { error } = await supabase
      .from("ordens_servico")
      .update({ status: novoStatus })
      .eq("id", ordem.id);

    if (error) {
      alert("Erro ao atualizar status: " + error.message);
      return;
    }

    if (novoStatus === "Entregue" && statusAnterior !== "Entregue") {
      await baixarEstoqueDaOS(ordem);
    }

    alert("Status atualizado com sucesso!");
    carregarOrdens();
  }

  function abrirWhatsApp(
    telefone: string,
    nome: string,
    numeroOS: number,
    status: string
  ) {
    let telefoneLimpo = telefone.replace(/\D/g, "");

    if (!telefoneLimpo.startsWith("55")) {
      telefoneLimpo = "55" + telefoneLimpo;
    }

    const mensagem = `Olá ${nome}, aqui é da JD CELL.

Sua Ordem de Serviço Nº ${numeroOS} está com status: ${status}.

Qualquer dúvida estamos à disposição.`;

    const texto = encodeURIComponent(mensagem);

    window.open(
      `https://api.whatsapp.com/send?phone=${telefoneLimpo}&text=${texto}`,
      "_blank"
    );
  }

  function imprimirOS(ordem: OrdemServico) {
    const janela = window.open("", "_blank");

    if (!janela) return;

    const lucro =
      Number(ordem.valor_final || 0) - Number(ordem.custo_pecas || 0);

    janela.document.write(`
      <html>
        <head>
          <title>OS ${ordem.numero_os} - JD CELL</title>

          <style>
            body{
              font-family: Arial, sans-serif;
              margin:40px;
              color:#000;
              background-image: url('/jdcell-logo.png');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: 450px;
            }

            .cabecalho{
              text-align:center;
              border-bottom:3px solid #22c55e;
              padding-bottom:15px;
              margin-bottom:20px;
            }

            .logo{
              width:180px;
              margin-bottom:10px;
            }

            .os{
              font-size:24px;
              font-weight:bold;
              color:#22c55e;
            }

            .box{
              border:1px solid #d1d5db;
              padding:12px;
              margin-bottom:12px;
              border-radius:8px;
            }

            .titulo{
              font-weight:bold;
              margin-bottom:8px;
              color:#22c55e;
            }

            table{
              width:100%;
              border-collapse:collapse;
            }

            td{
              padding:6px;
              vertical-align: top;
            }

            .assinaturas{
              margin-top:70px;
              display:flex;
              justify-content:space-between;
            }

            .linha{
              width:280px;
              border-top:1px solid #000;
              text-align:center;
              padding-top:6px;
            }

            .garantia{
              background:#f3f4f6;
              padding:12px;
              border-radius:8px;
              margin-top:20px;
            }
          </style>
        </head>

        <body>
          <div class="cabecalho">
            <img src="/jdcell-logo.png" class="logo" />
            <h1>JD CELL</h1>
            <p>Assistência Técnica Especializada</p>
            <p>Arca Taquaralto - Box 25</p>
            <p>(63) 99981-8305</p>
          </div>

          <div class="os">
            ORDEM DE SERVIÇO Nº ${ordem.numero_os}
          </div>

          <br>

          <div class="box">
            <div class="titulo">DADOS DO CLIENTE</div>

            <table>
              <tr>
                <td><strong>Nome:</strong></td>
                <td>${ordem.clientes?.nome || ""}</td>
              </tr>

              <tr>
                <td><strong>Telefone:</strong></td>
                <td>${ordem.clientes?.telefone || ""}</td>
              </tr>
            </table>
          </div>

          <div class="box">
            <div class="titulo">APARELHO</div>

            <table>
              <tr>
                <td><strong>Marca:</strong></td>
                <td>${ordem.marca || ""}</td>
              </tr>

              <tr>
                <td><strong>Modelo:</strong></td>
                <td>${ordem.modelo || ""}</td>
              </tr>

              <tr>
                <td><strong>IMEI:</strong></td>
                <td>${ordem.imei || ""}</td>
              </tr>

              <tr>
                <td><strong>Defeito relatado:</strong></td>
                <td>${ordem.defeito_relatado || ""}</td>
              </tr>

              <tr>
                <td><strong>Senha do aparelho:</strong></td>
                <td>${ordem.senha_aparelho || ""}</td>
              </tr>

              <tr>
                <td><strong>Acessórios entregues:</strong></td>
                <td>${ordem.acessorios || ""}</td>
              </tr>

              <tr>
                <td><strong>Serviço executado:</strong></td>
                <td>${ordem.servico_executado || ""}</td>
              </tr>

              <tr>
                <td><strong>Status:</strong></td>
                <td>${ordem.status || ""}</td>
              </tr>

              <tr>
                <td><strong>Peça utilizada:</strong></td>
                <td>${ordem.produto_nome || "Não informada"}</td>
              </tr>
            </table>
          </div>

          <div class="box">
            <div class="titulo">VALORES</div>

            <table>
              <tr>
                <td>Valor da peça</td>
                <td>R$ ${Number(ordem.custo_pecas || 0).toFixed(2)}</td>
              </tr>

              <tr>
                <td>Valor do serviço</td>
                <td>R$ ${Number(ordem.valor_final || 0).toFixed(2)}</td>
              </tr>

              <tr>
                <td>Lucro</td>
                <td>R$ ${lucro.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="garantia">
            <strong>GARANTIA:</strong><br><br>
            A JD CELL concede garantia de 90 dias referente ao serviço executado.
            A garantia não cobre quedas, oxidação, mau uso, quebra de tela ou danos causados pelo cliente.
          </div>

          <div class="assinaturas">
            <div class="linha">Assinatura do Cliente</div>
            <div class="linha">Responsável Técnico</div>
          </div>
        </body>
      </html>
    `);

    janela.document.close();
    janela.print();
  }

  useEffect(() => {
    carregarClientes();
    carregarOrdens();
    carregarProdutos();
  }, []);

  const ordensFiltradas = ordens.filter((ordem) => {
    const textoBusca = busca.toLowerCase();

    return (
      String(ordem.numero_os).includes(textoBusca) ||
      ordem.clientes?.nome?.toLowerCase().includes(textoBusca) ||
      ordem.clientes?.telefone?.includes(textoBusca) ||
      ordem.marca?.toLowerCase().includes(textoBusca) ||
      ordem.modelo?.toLowerCase().includes(textoBusca) ||
      ordem.produto_nome?.toLowerCase().includes(textoBusca)
    );
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1>Ordem de Serviço</h1>

      <br />

      <select
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
        style={selectInput}
      >
        <option value="">Selecione o cliente</option>
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nome} - {cliente.telefone}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Marca"
        value={marca}
        onChange={(e) => setMarca(e.target.value)}
        style={input}
      />

      <input
        type="text"
        placeholder="Modelo"
        value={modelo}
        onChange={(e) => setModelo(e.target.value)}
        style={input}
      />

      <input
        type="text"
        placeholder="IMEI"
        value={imei}
        onChange={(e) => setImei(e.target.value)}
        style={input}
      />

      <textarea
        placeholder="Defeito Relatado"
        value={defeito}
        onChange={(e) => setDefeito(e.target.value)}
        style={textarea}
      />

      <input
        type="text"
        placeholder="Senha do aparelho"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={input}
      />

      <textarea
        placeholder="Acessórios entregues"
        value={acessorios}
        onChange={(e) => setAcessorios(e.target.value)}
        style={textareaMenor}
      />

      <textarea
        placeholder="Serviço executado"
        value={servicoExecutado}
        onChange={(e) => setServicoExecutado(e.target.value)}
        style={textarea}
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={selectInput}
      >
        <option>Recebido</option>
        <option>Em análise</option>
        <option>Aguardando aprovação</option>
        <option>Em reparo</option>
        <option>Finalizado</option>
        <option>Entregue</option>
      </select>

      <select
        value={produtoId}
        onChange={(e) => selecionarProduto(e.target.value)}
        style={selectInput}
      >
        <option value="">Selecione uma peça do estoque</option>
        {produtos.map((produto) => (
          <option key={produto.id} value={produto.id}>
            {produto.nome} | Qtd: {produto.quantidade} | Custo: R${" "}
            {Number(produto.valor_custo || 0).toFixed(2)}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Valor da peça"
        value={custoPecas}
        onChange={(e) => setCustoPecas(e.target.value)}
        style={input}
      />

      <input
        type="number"
        placeholder="Valor final do serviço"
        value={valorFinal}
        onChange={(e) => setValorFinal(e.target.value)}
        style={input}
      />

      <p>
        <strong>Lucro estimado:</strong> R$ {lucro.toFixed(2)}
      </p>

      <button onClick={salvarOS} style={botao}>
        Salvar Ordem de Serviço
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Ordens cadastradas</h2>

      <input
        type="text"
        placeholder="Pesquisar por OS, cliente, telefone, aparelho ou peça"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={input}
      />

      <div style={{ marginTop: "15px" }}>
        {ordensFiltradas.length === 0 && <p>Nenhuma OS encontrada.</p>}

        {ordensFiltradas.map((ordem) => {
          const lucroOS =
            Number(ordem.valor_final || 0) - Number(ordem.custo_pecas || 0);

          return (
            <div key={ordem.id} style={cardOS}>
              <strong>OS #{ordem.numero_os}</strong>
              <p>Cliente: {ordem.clientes?.nome || "Sem cliente"}</p>
              <p>
                Aparelho: {ordem.marca} {ordem.modelo}
              </p>
              <p>IMEI: {ordem.imei || "Não informado"}</p>
              <p>Defeito: {ordem.defeito_relatado || "Não informado"}</p>
              <p>Serviço executado: {ordem.servico_executado || "Não informado"}</p>
              <p>Peça usada: {ordem.produto_nome || "Não informada"}</p>

              {ordem.clientes?.telefone && (
                <button
                  onClick={() =>
                    abrirWhatsApp(
                      ordem.clientes!.telefone,
                      ordem.clientes!.nome,
                      ordem.numero_os,
                      ordem.status
                    )
                  }
                  style={botaoWhatsApp}
                >
                  WhatsApp Cliente
                </button>
              )}

              <label>Status:</label>
              <select
                value={ordem.status}
                onChange={(e) => atualizarStatusOS(ordem, e.target.value)}
                style={inputPequeno}
              >
                <option>Recebido</option>
                <option>Em análise</option>
                <option>Aguardando aprovação</option>
                <option>Em reparo</option>
                <option>Finalizado</option>
                <option>Entregue</option>
              </select>

              <label>Valor da peça:</label>
              <input
                type="number"
                defaultValue={ordem.custo_pecas}
                onBlur={async (e) => {
                  const novoCusto = Number(e.target.value || 0);

                  const { error } = await supabase
                    .from("ordens_servico")
                    .update({ custo_pecas: novoCusto })
                    .eq("id", ordem.id);

                  if (error) {
                    alert("Erro ao atualizar valor da peça: " + error.message);
                    return;
                  }

                  carregarOrdens();
                }}
                style={inputPequeno}
              />

              <label>Valor final do serviço:</label>
              <input
                type="number"
                defaultValue={ordem.valor_final}
                onBlur={async (e) => {
                  const novoValor = Number(e.target.value || 0);

                  const { error } = await supabase
                    .from("ordens_servico")
                    .update({ valor_final: novoValor })
                    .eq("id", ordem.id);

                  if (error) {
                    alert("Erro ao atualizar valor final: " + error.message);
                    return;
                  }

                  carregarOrdens();
                }}
                style={inputPequeno}
              />

              <p>Lucro: R$ {lucroOS.toFixed(2)}</p>

              <button onClick={() => imprimirOS(ordem)} style={botao}>
                Imprimir OS
              </button>

              <button
                onClick={async () => {
                  const confirmar = confirm(
                    `Deseja excluir a OS #${ordem.numero_os}?`
                  );

                  if (!confirmar) return;

                  const { error } = await supabase
                    .from("ordens_servico")
                    .delete()
                    .eq("id", ordem.id);

                  if (error) {
                    alert("Erro ao excluir OS: " + error.message);
                    return;
                  }

                  alert("OS excluída com sucesso!");
                  carregarOrdens();
                }}
                style={botaoExcluir}
              >
                Excluir OS
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}

const input = {
  width: "400px",
  padding: "10px",
  display: "block",
  marginBottom: "10px",
  color: "#000",
};

const selectInput = {
  ...input,
  width: "420px",
};

const textarea = {
  width: "400px",
  height: "100px",
  padding: "10px",
  display: "block",
  marginBottom: "10px",
  color: "#000",
};

const textareaMenor = {
  ...textarea,
  height: "80px",
};

const inputPequeno = {
  width: "220px",
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

const botaoExcluir = {
  ...botao,
  background: "#ef4444",
  marginLeft: "10px",
};

const botaoWhatsApp = {
  background: "#25D366",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "8px",
  marginTop: "8px",
  display: "block",
};

const cardOS = {
  background: "rgba(30, 41, 59, 0.90)",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};