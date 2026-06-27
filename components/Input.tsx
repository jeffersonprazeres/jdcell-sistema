type InputProps = {
  placeholder?: string;
  value?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
  placeholder,
  value,
  type = "text",
  onChange,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: "400px",
        maxWidth: "100%",
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