"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
};

type OrdemServico = {
  id: string;
  numero_os: number;
  marca: string;
  modelo: string;
  status: string;
  custo_pecas: number;
  valor_final: number;
  created_at: string;
  clientes: {
    nome: string;
    telefone: string;
  } | null;
};

export default function OrdensServico() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [imei, setImei] = useState("");
  const [defeito, setDefeito] = useState("");
  const [status, setStatus] = useState("Recebido");
  const [custoPecas, setCustoPecas] = useState("");
  const [valorFinal, setValorFinal] = useState("");
  const [mensagem, setMensagem] = useState("");

  const lucro = Number(valorFinal || 0) - Number(custoPecas || 0);

  async function carregarClientes() {
    const { data } = await supabase
      .from("clientes")
      .select("id, nome, telefone")
      .order("nome", { ascending: true });

    setClientes(data || []);
  }

  async function carregarOrdens() {
    const { data, error } = await supabase
      .from("ordens_servico")
      .select(`
        id,
        numero_os,
        marca,
        modelo,
        status,
        custo_pecas,
        valor_final,
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

  async function salvarOS() {
    setMensagem("");

    if (!clienteId) {
      setMensagem("Selecione um cliente.");
      return;
    }

    const { error } = await supabase.from("ordens_servico").insert([
      {
        cliente_id: clienteId,
        marca,
        modelo,
        imei,
        defeito_relatado: defeito,
        status,
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
    setStatus("Recebido");
    setCustoPecas("");
    setValorFinal("");

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
);}

  function imprimirOS(ordem: OrdemServico) {
    const janela = window.open("", "_blank");

    if (janela) {
      janela.document.write(`
        <html>
          <head>
            <title>Ordem de Serviço - JD CELL</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 30px;
                position: relative;
              }

              .watermark {
                position: fixed;
                top: 35%;
                left: 20%;
                width: 60%;
                opacity: 0.08;
                z-index: -1;
              }

              .header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }

              .logo {
                width: 180px;
              }

              .box {
                border: 1px solid #000;
                padding: 10px;
                margin-bottom: 12px;
              }

              .assinatura {
                margin-top: 60px;
                display: flex;
                justify-content: space-between;
              }

              .linha {
                border-top: 1px solid #000;
                width: 45%;
                text-align: center;
                padding-top: 5px;
              }
            </style>
          </head>
          <body>
            <img src="/jdcell-logo.png" class="watermark" />

            <div class="header">
              <img src="/jdcell-logo.png" class="logo" />
              <h2>JD CELL</h2>
              <p>Arca Taquaralto - Box 25</p>
              <p>Telefone: (63) 99981-8305</p>
            </div>

            <h2>Ordem de Serviço Nº ${ordem.numero_os}</h2>

            <div class="box">
              <strong>Cliente:</strong> ${
                ordem.clientes?.nome || "Sem cliente"
              }<br/>
              <strong>Telefone:</strong> ${ordem.clientes?.telefone || ""}
            </div>

            <div class="box">
              <strong>Aparelho:</strong> ${ordem.marca} ${ordem.modelo}<br/>
              <strong>Status:</strong> ${ordem.status}
            </div>

            <div class="box">
              <strong>Valor do Serviço:</strong> R$ ${Number(
                ordem.valor_final || 0
              ).toFixed(2)}<br/>
              <strong>Garantia:</strong> 90 dias
            </div>

            <div class="box">
              <strong>Observações:</strong><br/>
              Serviço registrado pela JD CELL.
            </div>

            <div class="assinatura">
              <div class="linha">Assinatura do Cliente</div>
              <div class="linha">JD CELL</div>
            </div>
          </body>
        </html>
      `);

      janela.document.close();
      janela.print();
    }
  }

  useEffect(() => {
    carregarClientes();
    carregarOrdens();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        padding: "30px",
      }}
    >
      <h1>Ordem de Serviço</h1>

      <br />

      <select
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
        style={{
          width: "420px",
          padding: "10px",
          display: "block",
          marginBottom: "10px",
          color: "#000",
        }}
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
        style={{
          width: "400px",
          padding: "10px",
          display: "block",
          marginBottom: "10px",
          color: "#000",
        }}
      />

      <input
        type="text"
        placeholder="Modelo"
        value={modelo}
        onChange={(e) => setModelo(e.target.value)}
        style={{
          width: "400px",
          padding: "10px",
          display: "block",
          marginBottom: "10px",
          color: "#000",
        }}
      />

      <input
        type="text"
        placeholder="IMEI"
        value={imei}
        onChange={(e) => setImei(e.target.value)}
        style={{
          width: "400px",
          padding: "10px",
          display: "block",
          marginBottom: "10px",
          color: "#000",
        }}
      />

      <textarea
        placeholder="Defeito Relatado"
        value={defeito}
        onChange={(e) => setDefeito(e.target.value)}
        style={{
          width: "400px",
          height: "100px",
          padding: "10px",
          display: "block",
          marginBottom: "10px",
          color: "#000",
        }}
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{
          width: "420px",
          padding: "10px",
          display: "block",
          marginBottom: "10px",
          color: "#000",
        }}
      >
        <option>Recebido</option>
        <option>Em análise</option>
        <option>Aguardando aprovação</option>
        <option>Em reparo</option>
        <option>Finalizado</option>
        <option>Entregue</option>
      </select>

      <input
        type="number"
        placeholder="Valor da peça"
        value={custoPecas}
        onChange={(e) => setCustoPecas(e.target.value)}
        style={{
          width: "400px",
          padding: "10px",
          display: "block",
          marginBottom: "10px",
          color: "#000",
        }}
      />

      <input
        type="number"
        placeholder="Valor final do serviço"
        value={valorFinal}
        onChange={(e) => setValorFinal(e.target.value)}
        style={{
          width: "400px",
          padding: "10px",
          display: "block",
          marginBottom: "10px",
          color: "#000",
        }}
      />

      <p>
        <strong>Lucro estimado:</strong> R$ {lucro.toFixed(2)}
      </p>

      <button
        onClick={salvarOS}
        style={{
          background: "#22c55e",
          color: "#fff",
          border: "none",
          padding: "12px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Salvar Ordem de Serviço
      </button>

      {mensagem && <p style={{ marginTop: "15px" }}>{mensagem}</p>}

      <hr style={{ margin: "30px 0", borderColor: "#334155" }} />

      <h2>Ordens cadastradas</h2>

      <div style={{ marginTop: "15px" }}>
        {ordens.length === 0 && <p>Nenhuma OS cadastrada ainda.</p>}

        {ordens.map((ordem) => {
          const lucroOS =
            Number(ordem.valor_final || 0) - Number(ordem.custo_pecas || 0);

          return (
            <div
              key={ordem.id}
              style={{
                background: "#1e293b",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            >
              <strong>OS #{ordem.numero_os}</strong>
              <p>Cliente: {ordem.clientes?.nome || "Sem cliente"}</p>

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
                  style={{
                    background: "#25D366",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: "8px",
                    marginTop: "8px",
                    display: "block",
                  }}
                >
                  WhatsApp Cliente
                </button>
              )}

              <p>
                Aparelho: {ordem.marca} {ordem.modelo}
              </p>
<label>Status:</label>

<select
  value={ordem.status}
  onChange={async (e) => {
    const novoStatus = e.target.value;

    const { error } = await supabase
      .from("ordens_servico")
      .update({ status: novoStatus })
      .eq("id", ordem.id);

    if (error) {
      alert("Erro ao atualizar status: " + error.message);
      return;
    }

    alert("Status atualizado com sucesso!");
    carregarOrdens();
  }}
  style={{
    width: "220px",
    padding: "8px",
    display: "block",
    marginBottom: "10px",
    color: "#000",
  }}
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
  style={{
    width: "220px",
    padding: "8px",
    display: "block",
    marginBottom: "10px",
    color: "#000",
  }}
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
  style={{
    width: "220px",
    padding: "8px",
    display: "block",
    marginBottom: "10px",
    color: "#000",
  }}
/>

<p>Lucro: R$ {lucroOS.toFixed(2)}</p>

              <button
  onClick={() => imprimirOS(ordem)}
  style={{
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  }}
>
  Imprimir OS
</button>

<button
  onClick={async () => {
    const confirmar = confirm(`Deseja excluir a OS #${ordem.numero_os}?`);

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
  style={{
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    marginLeft: "10px",
  }}
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