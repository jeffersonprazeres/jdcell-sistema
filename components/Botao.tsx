type BotaoProps = {
  children: React.ReactNode;
  onClick?: () => void;
  tipo?: "verde" | "vermelho" | "cinza" | "roxo" | "laranja";
};

export default function Botao({
  children,
  onClick,
  tipo = "verde",
}: BotaoProps) {
  const cores = {
    verde: "#22c55e",
    vermelho: "#ef4444",
    cinza: "#334155",
    roxo: "#a855f7",
    laranja: "#f97316",
  };

  return (
    <button
      onClick={onClick}
      style={{
        background: cores[tipo],
        color: "#fff",
        border: "none",
        padding: "10px 15px",
        borderRadius: "8px",
        cursor: "pointer",
        marginTop: "10px",
        marginRight: "10px",
        fontWeight: "bold",
      }}
    >
      {children}
    </button>
  );
}