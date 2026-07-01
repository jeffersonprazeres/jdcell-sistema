type BadgeProps = {
  children: React.ReactNode;
  tipo?: "verde" | "vermelho" | "amarelo" | "azul" | "cinza";
};

export default function Badge({ children, tipo = "verde" }: BadgeProps) {
  const cores = {
    verde: "#14532d",
    vermelho: "#7f1d1d",
    amarelo: "#713f12",
    azul: "#1e3a8a",
    cinza: "#334155",
  };

  return (
    <span
      style={{
        background: cores[tipo],
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "bold",
      }}
    >
      {children}
    </span>
  );
}