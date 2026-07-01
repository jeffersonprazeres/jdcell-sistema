type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const cor =
    status === "Entregue"
      ? "#14532d"
      : status === "Pronto" || status === "Finalizado"
      ? "#166534"
      : status === "Cancelado"
      ? "#7f1d1d"
      : status === "Em reparo"
      ? "#1e3a8a"
      : status === "Aguardando peça" || status === "Aguardando aprovação"
      ? "#713f12"
      : "#334155";

  return (
    <span
      style={{
        background: cor,
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "bold",
      }}
    >
      {status}
    </span>
  );
}