type BotaoProps = {
  texto: string;
  onClick?: () => void;
  tipo?: "verde" | "azul" | "vermelho" | "cinza";
  type?: "button" | "submit";
};

export default function Botao({
  texto,
  onClick,
  tipo = "verde",
  type = "button",
}: BotaoProps) {
  const cores = {
    verde: "#22c55e",
    azul: "#2563eb",
    vermelho: "#dc2626",
    cinza: "#475569",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: cores[tipo],
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "12px 18px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "15px",
        transition: "0.2s",
      }}
    >
      {texto}
    </button>
  );
}