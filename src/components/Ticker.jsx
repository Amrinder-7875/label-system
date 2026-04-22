const ITEMS = [
  'FUNK', 'PHONK', 'UNDERGROUND', 'XCILE MEDIA',
  'INDEPENDENT', 'RAW ENERGY', 'DARK SOUND', 'EMERGING ARTISTS',
]

export default function Ticker() {
  // Duplicate for seamless loop
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="overflow-hidden border-t border-b border-[#2a2a2a] py-3 bg-[#0e0e0e]">
      <div
        className="flex gap-[60px] whitespace-nowrap"
        style={{ animation: 'ticker 18s linear infinite' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-[60px] shrink-0">
            <span
              className="text-[13px] tracking-[0.25em] text-[#666] uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {item}
            </span>
            <span
              className="text-[18px] text-[#e63329] leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              ×
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
