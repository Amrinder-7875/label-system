export default function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#e63329] mb-5">
      <span className="block w-6 h-px bg-[#e63329]" />
      {children}
    </div>
  )
}
