import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
  return (
    <input
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