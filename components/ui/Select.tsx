import { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select(props: Props) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "12px",
        background: "#111827",
        color: "#fff",
        border: "1px solid #334155",
        borderRadius: "10px",
        outline: "none",
        marginBottom: "12px",
      }}
    />
  );
}