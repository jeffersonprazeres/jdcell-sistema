type HeaderProps = {
  usuario?: string;
  funcao?: string;
};

export default function Header({
  usuario = "Usuário",
  funcao = "",
}: HeaderProps) {
  return (
    <header
      style={{
        background: "rgba(15,23,42,.96)",
        borderBottom: "2px solid #22c55e",
        padding: "18px 30px",
        marginBottom: "25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <img
          src="/jdcell-logo.png"
          alt="JD CELL"
          style={{
            width: "55px",
            height: "55px",
            objectFit: "contain",
          }}
        />

        <div>
          <h2
            style={{
              margin: 0,
              color: "#22c55e",
            }}
          >
            JD CELL PRO
          </h2>

          <small style={{ color: "#cbd5e1" }}>
            Assistência Técnica Especializada
          </small>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <strong>{usuario}</strong>

        <br />

        <small style={{ color: "#94a3b8" }}>{funcao}</small>
      </div>
    </header>
  );
}