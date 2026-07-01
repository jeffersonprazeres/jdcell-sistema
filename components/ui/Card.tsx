type CardProps = {
  children: React.ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <div
      style={{
        background: "rgba(30,41,59,0.92)",
        border: "1px solid rgba(148,163,184,0.22)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
      }}
    >
      {children}
    </div>
  );
}