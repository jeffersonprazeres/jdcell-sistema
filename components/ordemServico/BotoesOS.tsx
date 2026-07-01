type Props = {
  ordemId: string;
  numeroOS: number;
  onPdf: () => void;
  onExcluir: () => void;
};

export default function BotoesOS({
  ordemId,
  numeroOS,
  onPdf,
  onExcluir,
}: Props) {
  return (
    <div style={{ marginTop: "10px" }}>
      <button
        onClick={() => (window.location.href = `/ordem-impressao?id=${ordemId}`)}
        style={botao}
      >
        🖨️ Imprimir OS
      </button>

      <button
        onClick={() => (window.location.href = `/etiqueta-os?os=${numeroOS}`)}
        style={{ ...botao, background: "#f97316" }}
      >
        🏷️ Etiqueta
      </button>

      <button onClick={onPdf} style={{ ...botao, background: "#a855f7" }}>
        📄 PDF
      </button>

      <button onClick={onExcluir} style={{ ...botao, background: "#ef4444" }}>
        Excluir OS
      </button>
    </div>
  );
}

const botao = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "10px",
  marginRight: "10px",
};