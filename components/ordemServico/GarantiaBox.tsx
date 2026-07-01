type Props = {
  status: string;
  dataEntrega: string | null;
  garantiaDias: number | null;
};

export default function GarantiaBox({
  status,
  dataEntrega,
  garantiaDias,
}: Props) {
  if (status !== "Entregue" || !dataEntrega) {
    return null;
  }

  const diasGarantia = Number(garantiaDias || 0);
  const entrega = new Date(dataEntrega);

  const vencimento = new Date(
    entrega.getTime() + diasGarantia * 24 * 60 * 60 * 1000
  );

  const diasRestantes = Math.ceil(
    (vencimento.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const ativa = diasRestantes > 0;

  return (
    <div
      style={{
        background: ativa ? "#14532d" : "#7f1d1d",
        padding: "12px",
        borderRadius: "8px",
        marginTop: "10px",
        marginBottom: "10px",
        color: "#fff",
      }}
    >
      <strong>{ativa ? "✅ Garantia Ativa" : "❌ Garantia Vencida"}</strong>

      <p>Data Entrega: {entrega.toLocaleDateString("pt-BR")}</p>
      <p>Vencimento: {vencimento.toLocaleDateString("pt-BR")}</p>

      {ativa && <p>Dias restantes: {diasRestantes}</p>}
    </div>
  );
}