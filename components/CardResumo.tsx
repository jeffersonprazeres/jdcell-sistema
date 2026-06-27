type CardResumoProps = {
  titulo: string;
  valor: string | number;
  icone: string;
  destaque?: boolean;
  alerta?: boolean;
};

export default function CardResumo({
  titulo,
  valor,
  icone,
  destaque,
  alerta,
}: CardResumoProps) {
  return (
    <div
      style={{
        background: alerta
          ? "linear-gradient(135deg, rgba(127,29,29,.95), rgba(69,10,10,.95))"
          : destaque
          ? "linear-gradient(135deg, rgba(6,95,70,.95), rgba(20,83,45,.95))"
          : "linear-gradient(135deg, rgba(30,41,59,.96), rgba(15,23,42,.96))",
        padding: "22px",
        borderRadius: "18px",
        border: "1px solid rgba(148,163,184,.22)",
        boxShadow: "0 12px 28px rgba(0,0,0,.28)",
        minHeight: "120px",
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: "10px" }}>{icone}</div>

      <h3 style={{ margin: 0, color: "#cbd5e1", fontSize: "15px" }}>
        {titulo}
      </h3>

      <strong
        style={{
          display: "block",
          marginTop: "10px",
          fontSize: "30px",
          color: "#22c55e",
        }}
      >
        {valor}
      </strong>
    </div>
  );
}
