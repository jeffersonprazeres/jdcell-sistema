"use client";

import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";
import SignatureCanvas from "react-signature-canvas";

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
  foto_aparelho: string;
  foto_url: string | null;
  status: string;
  custo_pecas: number;
  valor_mao_obra: number;
  desconto: number;
  valor_final: number;
  produto_id: string | null;
  produto_nome: string | null;
  estoque_baixado: boolean;
  created_at: string;
  data_entrega: string | null;
  garantia_dias: number | null;
  assinatura_cliente: string | null;
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
  const [cor, setCor] = useState("");
  const [imei1, setImei1] = useState("");
  const [imei2, setImei2] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [bateria, setBateria] = useState("");
  const [estadoAparelho, setEstadoAparelho] = useState("");
  const [defeito, setDefeito] = useState("");
  const [senha, setSenha] = useState("");
  const [acessorios, setAcessorios] = useState("");
  const [servicoExecutado, setServicoExecutado] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [dataPrevisao, setDataPrevisao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [status, setStatus] = useState("Recebido");
  const [produtoId, setProdutoId] = useState("");
  const [custoPecas, setCustoPecas] = useState("");
  const [valorMaoObra, setValorMaoObra] = useState("");
  const [desconto, setDesconto] = useState("");
  const [valorFinal, setValorFinal] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");
  const assinaturaRef = useRef<SignatureCanvas>(null);
  const [assinatura, setAssinatura] = useState("");

  const lucro =
    Number(valorFinal || 0) -
    Number(custoPecas || 0) -
    Number(desconto || 0);

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
        produto_id,
        produto_nome,
        estoque_baixado,
        created_at,
        data_entrega,
        garantia_dias,
        assinatura_cliente,
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

    let fotoUrl = "";

    if (foto) {
      const nomeArquivo = `${Date.now()}-${foto.name}`;

      const { error: erroUpload } = await supabase.storage
        .from("aparelhos")
        .upload(nomeArquivo, foto);

      if (erroUpload) {
        setMensagem("Erro ao enviar foto: " + erroUpload.message);
        return;
      }

      const { data } = supabase.storage
        .from("aparelhos")
        .getPublicUrl(nomeArquivo);

      fotoUrl = data.publicUrl;
    }

    const produtoSelecionado = produtos.find(
      (produto) => String(produto.id) === String(produtoId)
    );

    const { error } = await supabase.from("ordens_servico").insert([
      {
        cliente_id: clienteId,
        marca,
        modelo,
        cor,
        imei: imei1,
        imei1,
        imei2,
        numero_serie: numeroSerie,
        bateria: bateria ? Number(bateria) : null,
        estado_aparelho: estadoAparelho,
        defeito_relatado: defeito,
        senha_aparelho: senha,
        acessorios,
        servico_executado: servicoExecutado,
        tecnico,
        data_previsao: dataPrevisao || null,
        foto_aparelho: fotoUrl,
        foto_url: fotoUrl,
        status,
        produto_id: produtoSelecionado ? String(produtoSelecionado.id) : null,
        produto_nome: produtoSelecionado ? produtoSelecionado.nome : null,
        custo_pecas: Number(custoPecas || 0),
        valor_mao_obra: Number(valorMaoObra || 0),
        desconto: Number(desconto || 0),
        valor_final: Number(valorFinal || 0),
        garantia_dias: 90,
        estoque_baixado: false,
        assinatura_cliente: assinatura || null,
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
    setCor("");
    setImei1("");
    setImei2("");
    setNumeroSerie("");
    setBateria("");
    setEstadoAparelho("");
    setDefeito("");
    setSenha("");
    setAcessorios("");
    setServicoExecutado("");
    setTecnico("");
    setDataPrevisao("");
    setFoto(null);
    setStatus("Recebido");
    setProdutoId("");
    setCustoPecas("");
    setValorMaoObra("");
    setDesconto("");
    setValorFinal("");
    setAssinatura("");
    assinaturaRef.current?.clear();

    carregarOrdens();
    carregarProdutos();
  }

  async function baixarEstoqueDaOS(ordem: OrdemServico) {
    if (!ordem.produto_id) return;
    if (ordem.estoque_baixado) return;

    const { data: produto, error } = await supabase
      .from("estoque")
      .select("id, quantidade")
      .eq("id", ordem.produto_id)
      .single();

    if (error || !produto) {
      alert("Não foi possível localizar a peça.");
      return;
    }

    const quantidadeAtual = Number(produto.quantidade || 0);

    if (quantidadeAtual <= 0) {
      alert("Produto sem estoque.");
      return;
    }

    const { error: erroEstoque } = await supabase
      .from("estoque")
      .update({
        quantidade: quantidadeAtual - 1,
      })
      .eq("id", ordem.produto_id);

    if (erroEstoque) {
      alert("Erro ao baixar estoque.");
      return;
    }

    await supabase.from("movimentacoes_estoque").insert([
      {
        produto_id: ordem.produto_id,
        produto_nome: ordem.produto_nome || "Peça não informada",
        tipo: "Saída",
        quantidade: 1,
        origem: "Ordem de Serviço",
        referencia: `OS ${ordem.numero_os}`,
      },
    ]);

    await supabase
      .from("ordens_servico")
      .update({
        estoque_baixado: true,
      })
      .eq("id", ordem.id);

    carregarProdutos();
  }

  async function atualizarStatusOS(ordem: OrdemServico, novoStatus: string) {
    const statusAnterior = ordem.status;

    const dadosAtualizacao: any = {
      status: novoStatus,
    };

    if (novoStatus === "Entregue" && ordem.status !== "Entregue") {
      dadosAtualizacao.data_entrega = new Date().toISOString();
      dadosAtualizacao.garantia_dias = 90;
    }

    const { error } = await supabase
      .from("ordens_servico")
      .update(dadosAtualizacao)
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
    statusAtual: string
  ) {
    let telefoneLimpo = telefone.replace(/\D/g, "");

    if (!telefoneLimpo.startsWith("55")) {
      telefoneLimpo = "55" + telefoneLimpo;
    }

    const texto = encodeURIComponent(`Olá ${nome}, aqui é da JD CELL.

Sua Ordem de Serviço Nº ${numeroOS} está com status: ${statusAtual}.

Qualquer dúvida estamos à disposição.`);

    window.open(
      `https://api.whatsapp.com/send?phone=${telefoneLimpo}&text=${texto}`,
      "_blank"
    );
  }

  function gerarPdfOS(ordem: OrdemServico) {
    const doc = new jsPDF();

    const lucroOS =
      Number(ordem.valor_final || 0) -
      Number(ordem.custo_pecas || 0) -
      Number(ordem.desconto || 0);

    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94);
    doc.text("JD CELL", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Assistência Técnica Especializada", 105, 28, {
      align: "center",
    });
    doc.text("Arca Taquaralto - Box 25", 105, 35, { align: "center" });
    doc.text("(63) 99981-8305", 105, 42, { align: "center" });

    doc.setDrawColor(34, 197, 94);
    doc.line(20, 48, 190, 48);

    doc.setFontSize(18);
    doc.setTextColor(34, 197, 94);
    doc.text(`ORDEM DE SERVIÇO Nº ${ordem.numero_os}`, 20, 62);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    doc.text(`Cliente: ${ordem.clientes?.nome || ""}`, 20, 78);
    doc.text(`Telefone: ${ordem.clientes?.telefone || ""}`, 20, 88);

    doc.text(`Marca: ${ordem.marca || ""}`, 20, 105);
    doc.text(`Modelo: ${ordem.modelo || ""}`, 20, 115);
    doc.text(`Cor: ${ordem.cor || ""}`, 20, 125);
    doc.text(`IMEI 1: ${ordem.imei1 || ordem.imei || ""}`, 20, 135);
    doc.text(`IMEI 2: ${ordem.imei2 || ""}`, 20, 145);
    doc.text(`Série: ${ordem.numero_serie || ""}`, 20, 155);
    doc.text(`Bateria: ${ordem.bateria || ""}%`, 20, 165);
    doc.text(`Estado: ${ordem.estado_aparelho || ""}`, 20, 175);

    doc.text(`Defeito: ${ordem.defeito_relatado || ""}`, 20, 190);
    doc.text(`Serviço: ${ordem.servico_executado || ""}`, 20, 200);
    doc.text(`Peça: ${ordem.produto_nome || "Não informada"}`, 20, 210);
    doc.text(`Técnico: ${ordem.tecnico || "Não informado"}`, 20, 220);

    doc.setTextColor(34, 197, 94);
    doc.text(
      `Valor da peça: R$ ${Number(ordem.custo_pecas || 0).toFixed(2)}`,
      20,
      235
    );
    doc.text(
      `Mão de obra: R$ ${Number(ordem.valor_mao_obra || 0).toFixed(2)}`,
      20,
      245
    );
    doc.text(
      `Desconto: R$ ${Number(ordem.desconto || 0).toFixed(2)}`,
      20,
      255
    );
    doc.text(
      `Valor final: R$ ${Number(ordem.valor_final || 0).toFixed(2)}`,
      20,
      265
    );

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(
      `Lucro estimado: R$ ${lucroOS.toFixed(2)} | Garantia de 90 dias referente ao serviço executado. Não cobre queda, oxidação, mau uso ou danos causados pelo cliente.`,
      20,
      278,
      { maxWidth: 170 }
    );

    if (ordem.assinatura_cliente) {
      doc.setTextColor(0, 0, 0);
      doc.text("Assinatura do Cliente:", 20, 292);
      doc.addImage(ordem.assinatura_cliente, "PNG", 20, 296, 70, 25);
    }

    doc.save(`OS-${ordem.numero_os}-JD-CELL.pdf`);
  }

  function imprimirOS(ordem: OrdemServico) {
    const janela = window.open("", "_blank");

    if (!janela) return;

    const lucroOS =
      Number(ordem.valor_final || 0) -
      Number(ordem.custo_pecas || 0) -
      Number(ordem.desconto || 0);

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
            .logo{ width:180px; margin-bottom:10px; }
            .os{ font-size:24px; font-weight:bold; color:#22c55e; }
            .box{
              border:1px solid #d1d5db;
              padding:12px;
              margin-bottom:12px;
              border-radius:8px;
              background:rgba(255,255,255,.85);
            }
            .titulo{ font-weight:bold; margin-bottom:8px; color:#22c55e; }
            table{ width:100%; border-collapse:collapse; }
            td{ padding:6px; vertical-align: top; }
            .foto{ max-width:250px; border-radius:8px; margin-top:8px; }
            .assinatura-img{ max-width:260px; max-height:90px; border:1px solid #ddd; }
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

          <div class="os">ORDEM DE SERVIÇO Nº ${ordem.numero_os}</div>
          <br>

          <div class="box">
            <div class="titulo">DADOS DO CLIENTE</div>
            <table>
              <tr><td><strong>Nome:</strong></td><td>${ordem.clientes?.nome || ""}</td></tr>
              <tr><td><strong>Telefone:</strong></td><td>${ordem.clientes?.telefone || ""}</td></tr>
            </table>
          </div>

          <div class="box">
            <div class="titulo">APARELHO</div>
            <table>
              <tr><td><strong>Marca:</strong></td><td>${ordem.marca || ""}</td></tr>
              <tr><td><strong>Modelo:</strong></td><td>${ordem.modelo || ""}</td></tr>
              <tr><td><strong>Cor:</strong></td><td>${ordem.cor || ""}</td></tr>
              <tr><td><strong>IMEI 1:</strong></td><td>${ordem.imei1 || ordem.imei || ""}</td></tr>
              <tr><td><strong>IMEI 2:</strong></td><td>${ordem.imei2 || ""}</td></tr>
              <tr><td><strong>Nº Série:</strong></td><td>${ordem.numero_serie || ""}</td></tr>
              <tr><td><strong>Bateria:</strong></td><td>${ordem.bateria || ""}%</td></tr>
              <tr><td><strong>Estado:</strong></td><td>${ordem.estado_aparelho || ""}</td></tr>
              <tr><td><strong>Senha:</strong></td><td>${ordem.senha_aparelho || ""}</td></tr>
              <tr><td><strong>Acessórios:</strong></td><td>${ordem.acessorios || ""}</td></tr>
              <tr><td><strong>Defeito:</strong></td><td>${ordem.defeito_relatado || ""}</td></tr>
              <tr><td><strong>Serviço:</strong></td><td>${ordem.servico_executado || ""}</td></tr>
              <tr><td><strong>Técnico:</strong></td><td>${ordem.tecnico || ""}</td></tr>
              <tr><td><strong>Data prevista:</strong></td><td>${ordem.data_previsao || ""}</td></tr>
              <tr><td><strong>Status:</strong></td><td>${ordem.status || ""}</td></tr>
              <tr><td><strong>Peça:</strong></td><td>${ordem.produto_nome || "Não informada"}</td></tr>
              <tr>
                <td><strong>Foto:</strong></td>
                <td>${
                  ordem.foto_aparelho || ordem.foto_url
                    ? `<img src="${ordem.foto_aparelho || ordem.foto_url}" class="foto" />`
                    : "Sem foto"
                }</td>
              </tr>
            </table>
          </div>

          <div class="box">
            <div class="titulo">VALORES</div>
            <table>
              <tr><td>Valor da peça</td><td>R$ ${Number(ordem.custo_pecas || 0).toFixed(2)}</td></tr>
              <tr><td>Mão de obra</td><td>R$ ${Number(ordem.valor_mao_obra || 0).toFixed(2)}</td></tr>
              <tr><td>Desconto</td><td>R$ ${Number(ordem.desconto || 0).toFixed(2)}</td></tr>
              <tr><td>Valor final</td><td>R$ ${Number(ordem.valor_final || 0).toFixed(2)}</td></tr>
              <tr><td>Lucro estimado</td><td>R$ ${lucroOS.toFixed(2)}</td></tr>
            </table>
          </div>

          <div class="garantia">
            <strong>GARANTIA:</strong><br><br>
            A JD CELL concede garantia de 90 dias referente ao serviço executado.
            A garantia não cobre quedas, oxidação, mau uso, quebra de tela ou danos causados pelo cliente.
          </div>

          <div class="box">
            <div class="titulo">ASSINATURA DIGITAL DO CLIENTE</div>
            ${
              ordem.assinatura_cliente
                ? `<img src="${ordem.assinatura_cliente}" class="assinatura-img" />`
                : "Sem assinatura digital"
            }
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
      ordem.cor?.toLowerCase().includes(textoBusca) ||
      ordem.imei1?.toLowerCase().includes(textoBusca) ||
      ordem.imei2?.toLowerCase().includes(textoBusca) ||
      ordem.numero_serie?.toLowerCase().includes(textoBusca) ||
      ordem.tecnico?.toLowerCase().includes(textoBusca) ||
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
      <h1 style={{ color: "#22c55e" }}>Ordem de Serviço Profissional</h1>

      <br />

      <h2>Dados do Cliente</h2>

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

      <h2>Dados do Aparelho</h2>

      <input type="text" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} style={input} />
      <input type="text" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} style={input} />
      <input type="text" placeholder="Cor" value={cor} onChange={(e) => setCor(e.target.value)} style={input} />
      <input type="text" placeholder="IMEI 1" value={imei1} onChange={(e) => setImei1(e.target.value)} style={input} />
      <input type="text" placeholder="IMEI 2" value={imei2} onChange={(e) => setImei2(e.target.value)} style={input} />
      <input type="text" placeholder="Número de Série" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} style={input} />
      <input type="number" placeholder="Bateria (%)" value={bateria} onChange={(e) => setBateria(e.target.value)} style={input} />

      <select
        value={estadoAparelho}
        onChange={(e) => setEstadoAparelho(e.target.value)}
        style={selectInput}
      >
        <option value="">Estado do aparelho</option>
        <option>Sem marcas</option>
        <option>Com marcas de uso</option>
        <option>Tela quebrada</option>
        <option>Tampa quebrada</option>
        <option>Oxidação</option>
        <option>Não liga</option>
        <option>Outro</option>
      </select>

      <textarea placeholder="Defeito Relatado" value={defeito} onChange={(e) => setDefeito(e.target.value)} style={textarea} />
      <input type="text" placeholder="Senha do aparelho" value={senha} onChange={(e) => setSenha(e.target.value)} style={input} />
      <textarea placeholder="Acessórios entregues" value={acessorios} onChange={(e) => setAcessorios(e.target.value)} style={textareaMenor} />
      <textarea placeholder="Serviço executado" value={servicoExecutado} onChange={(e) => setServicoExecutado(e.target.value)} style={textarea} />

      <h2>Controle</h2>

      <input type="text" placeholder="Técnico responsável" value={tecnico} onChange={(e) => setTecnico(e.target.value)} style={input} />

      <label>Data prevista:</label>
      <input type="date" value={dataPrevisao} onChange={(e) => setDataPrevisao(e.target.value)} style={input} />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setFoto(e.target.files[0]);
          }
        }}
        style={input}
      />

      <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectInput}>
        <option>Recebido</option>
        <option>Em análise</option>
        <option>Aguardando aprovação</option>
        <option>Aguardando peça</option>
        <option>Em reparo</option>
        <option>Pronto</option>
        <option>Finalizado</option>
        <option>Entregue</option>
        <option>Cancelado</option>
      </select>

      <h2>Peça e Valores</h2>

      <select value={produtoId} onChange={(e) => selecionarProduto(e.target.value)} style={selectInput}>
        <option value="">Selecione uma peça do estoque</option>
        {produtos.map((produto) => (
          <option key={produto.id} value={produto.id}>
            {produto.nome} | Qtd: {produto.quantidade} | Custo: R$ {Number(produto.valor_custo || 0).toFixed(2)}
          </option>
        ))}
      </select>

      <input type="number" placeholder="Valor da peça" value={custoPecas} onChange={(e) => setCustoPecas(e.target.value)} style={input} />
      <input type="number" placeholder="Valor da mão de obra" value={valorMaoObra} onChange={(e) => setValorMaoObra(e.target.value)} style={input} />
      <input type="number" placeholder="Desconto" value={desconto} onChange={(e) => setDesconto(e.target.value)} style={input} />
      <input type="number" placeholder="Valor final cobrado" value={valorFinal} onChange={(e) => setValorFinal(e.target.value)} style={input} />

      <p>
        <strong>Lucro estimado:</strong> R$ {lucro.toFixed(2)}
      </p>

      <h2>Assinatura do Cliente</h2>

      <div
        style={{
          background: "#fff",
          width: "420px",
          height: "180px",
          borderRadius: "8px",
          marginBottom: "10px",
        }}
      >
        <SignatureCanvas
          ref={assinaturaRef}
          penColor="black"
          canvasProps={{
            width: 420,
            height: 180,
            style: {
              border: "1px solid #ccc",
              borderRadius: "8px",
            },
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          const dataUrl = assinaturaRef.current?.toDataURL() || "";
          setAssinatura(dataUrl);
          alert("Assinatura salva.");
        }}
        style={botao}
      >
        Salvar Assinatura
      </button>

      <button
        type="button"
        onClick={() => {
          assinaturaRef.current?.clear();
          setAssinatura("");
        }}
        style={{ ...botao, background: "#ef4444", marginLeft: "10px" }}
      >
        Limpar Assinatura
      </button>

      {assinatura && (
        <p style={{ color: "#22c55e" }}>Assinatura capturada com sucesso.</p>
      )}

      <br />

      <button onClick={salvarOS} style={botao}>
        Salvar Ordem de Serviço
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Ordens cadastradas</h2>

      <input
        type="text"
        placeholder="Pesquisar por OS, cliente, telefone, aparelho, IMEI, série, técnico ou peça"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={input}
      />

      <div style={{ marginTop: "15px" }}>
        {ordensFiltradas.length === 0 && <p>Nenhuma OS encontrada.</p>}

        {ordensFiltradas.map((ordem) => {
          const lucroOS =
            Number(ordem.valor_final || 0) -
            Number(ordem.custo_pecas || 0) -
            Number(ordem.desconto || 0);

          const garantiaDias = Number(ordem.garantia_dias || 0);

          const dataEntrega = ordem.data_entrega
            ? new Date(ordem.data_entrega)
            : null;

          const dataVencimento = dataEntrega
            ? new Date(dataEntrega.getTime() + garantiaDias * 24 * 60 * 60 * 1000)
            : null;

          const diasRestantes = dataVencimento
            ? Math.ceil(
                (dataVencimento.getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            : null;

          return (
            <div key={ordem.id} style={cardOS}>
              <strong>OS #{ordem.numero_os}</strong>

              <p>Cliente: {ordem.clientes?.nome || "Sem cliente"}</p>
              <p>Aparelho: {ordem.marca} {ordem.modelo}</p>
              <p>Cor: {ordem.cor || "Não informada"}</p>
              <p>IMEI 1: {ordem.imei1 || ordem.imei || "Não informado"}</p>
              <p>IMEI 2: {ordem.imei2 || "Não informado"}</p>
              <p>Nº Série: {ordem.numero_serie || "Não informado"}</p>
              <p>Bateria: {ordem.bateria || "Não informada"}%</p>
              <p>Estado: {ordem.estado_aparelho || "Não informado"}</p>
              <p>Defeito: {ordem.defeito_relatado || "Não informado"}</p>
              <p>Serviço executado: {ordem.servico_executado || "Não informado"}</p>
              <p>Técnico: {ordem.tecnico || "Não informado"}</p>
              <p>Data prevista: {ordem.data_previsao || "Não informada"}</p>
              <p>Peça usada: {ordem.produto_nome || "Não informada"}</p>

              {(ordem.foto_aparelho || ordem.foto_url) && (
                <img
                  src={ordem.foto_aparelho || ordem.foto_url || ""}
                  alt="Aparelho"
                  style={{
                    width: "180px",
                    borderRadius: "10px",
                    marginTop: "10px",
                    marginBottom: "10px",
                    display: "block",
                  }}
                />
              )}

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
                <option>Aguardando peça</option>
                <option>Em reparo</option>
                <option>Pronto</option>
                <option>Finalizado</option>
                <option>Entregue</option>
                <option>Cancelado</option>
              </select>

              <p>Valor peça: R$ {Number(ordem.custo_pecas || 0).toFixed(2)}</p>
              <p>Mão de obra: R$ {Number(ordem.valor_mao_obra || 0).toFixed(2)}</p>
              <p>Desconto: R$ {Number(ordem.desconto || 0).toFixed(2)}</p>
              <p>Valor final: R$ {Number(ordem.valor_final || 0).toFixed(2)}</p>
              <p>Lucro: R$ {lucroOS.toFixed(2)}</p>

              {ordem.assinatura_cliente && (
                <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                  <strong>Assinatura do cliente:</strong>
                  <br />
                  <img
                    src={ordem.assinatura_cliente}
                    alt="Assinatura do cliente"
                    style={{
                      background: "#fff",
                      width: "240px",
                      borderRadius: "8px",
                      marginTop: "8px",
                    }}
                  />
                </div>
              )}

              {ordem.status === "Entregue" && dataEntrega && (
                <div
                  style={{
                    background:
                      diasRestantes !== null && diasRestantes > 0
                        ? "#14532d"
                        : "#7f1d1d",
                    padding: "12px",
                    borderRadius: "8px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <strong>
                    {diasRestantes !== null && diasRestantes > 0
                      ? "✅ Garantia Ativa"
                      : "❌ Garantia Vencida"}
                  </strong>

                  <p>
                    Data Entrega:{" "}
                    {new Date(ordem.data_entrega!).toLocaleDateString("pt-BR")}
                  </p>

                  <p>
                    Vencimento: {dataVencimento?.toLocaleDateString("pt-BR")}
                  </p>

                  {diasRestantes !== null && diasRestantes > 0 && (
                    <p>Dias restantes: {diasRestantes}</p>
                  )}
                </div>
              )}

              <button
  onClick={() => (window.location.href = `/ordem-impressao?id=${ordem.id}`)}
  style={botao}
>
  Imprimir OS
</button>
<button
  onClick={() =>
    (window.location.href = `/etiqueta-os?os=${ordem.numero_os}`)
  }
  style={{
    ...botao,
    background: "#f97316",
    marginLeft: "10px",
  }}
>
  🏷️ Etiqueta
</button>
              <button
                onClick={() => gerarPdfOS(ordem)}
                style={{
                  ...botao,
                  background: "#a855f7",
                  marginLeft: "10px",
                }}
              >
                PDF da OS
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