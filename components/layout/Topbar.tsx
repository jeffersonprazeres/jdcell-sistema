type TopbarProps = {
  email?: string;
  funcao?: string;
};

export default function Topbar({ email = "Usuário", funcao = "" }: TopbarProps) {
  return (
    <header
      style={{
        height: "70px",
        background: "rgba(15,23,42,.96)",
        borderBottom: "1px solid rgba(34,197,94,.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div>
        <strong style={{ color: "#22c55e", fontSize: "18px" }}>
          JD CELL PRO
        </strong>
        <br />
        <small style={{ color: "#94a3b8" }}>
          Sistema de Assistência Técnica
        </small>
      </div>

      <div style={{ textAlign: "right" }}>
        <strong>{email}</strong>
        <br />
        <small style={{ color: "#94a3b8" }}>{funcao}</small>
      </div>
    </header>
  );
}