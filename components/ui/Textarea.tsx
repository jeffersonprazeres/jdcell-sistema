import { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea(props: Props) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        minHeight: "120px",
        padding: "12px",
        background: "#111827",
        color: "#fff",
        border: "1px solid #334155",
        borderRadius: "10px",
        outline: "none",
        resize: "vertical",
      }}
    />
  );
}