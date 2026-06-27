type TextareaProps = {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  pequeno?: boolean;
};

export default function Textarea({
  placeholder,
  value,
  onChange,
  pequeno = false,
}: TextareaProps) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: "400px",
        maxWidth: "100%",
        height: pequeno ? "80px" : "100px",
        padding: "10px",
        display: "block",
        marginBottom: "10px",
        color: "#000",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
      }}
    />
  );
}