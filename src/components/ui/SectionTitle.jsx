export default function SectionTitle({ children }) {
  return (
    <h2
      className="leading-[0.95] tracking-[0.02em] text-[#f0ede8] mb-10"
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(48px, 6vw, 80px)',
      }}
    >
      {children}
    </h2>
  )
}
