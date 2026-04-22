import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'
import { usePublicApi } from '../hooks/usePublicApi'

function ReleaseCard({ title, artist, type, streams, year, coverUrl }) {
  return (
    <div className="bg-[#141414] px-7 py-8 hover:bg-[#1c1c1c] transition-colors duration-200">
      <div className="w-full aspect-square bg-[#0e0e0e] border border-[#2a2a2a] mb-5 flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="w-full h-full object-cover opacity-85" />
        ) : (
          <span className="text-[48px] tracking-[0.1em] text-[#2a2a2a]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {title?.[0] ?? "◈"}
          </span>
        )}
      </div>

      <div className="text-[18px] text-[#f0ede8] mb-1" style={{ fontFamily: "'Anton', sans-serif" }}>
        {title}
      </div>
      <div className="text-[11px] tracking-[0.15em] uppercase text-[#666] mb-4">
        {artist}
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="inline-block text-[9px] tracking-[0.2em] uppercase px-[10px] py-1 border border-[#7a1a15] text-[#e63329]">
          {type}
        </span>
        <span className="text-[10px] tracking-[0.15em] uppercase text-[#666]">
          {Number(streams ?? 0).toLocaleString()} • {year ?? "—"}
        </span>
      </div>
    </div>
  );
}

export default function Releases() {
const { data, loading, error } = usePublicApi("/api/releases");
const releases = data?.releases?.slice(0, 3) ?? [];

  return (
    <section id="releases" className="px-6 md:px-12 py-24 border-b border-[#2a2a2a] bg-[#0e0e0e]">
      <SectionLabel>Catalogue</SectionLabel>
      <SectionTitle>LATEST<br />RELEASES</SectionTitle>

      {loading && <div className="border border-[#2a2a2a] px-10 py-16 mt-14 bg-[#141414] text-center text-[#666] text-[11px] tracking-[0.12em] uppercase">Loading releases...</div>}
      {error && <div className="border border-[#7a1a15] px-10 py-16 mt-14 bg-[#141414] text-center text-[#e63329] text-[11px] tracking-[0.12em] uppercase">{error}</div>}
      {!loading && !error && releases.length === 0 && (
        <div className="border border-[#2a2a2a] px-10 py-16 mt-14 bg-[#141414] text-center">
          <div className="text-[22px] text-[#f0ede8] mb-3" style={{ fontFamily: "'Anton', sans-serif" }}>
            NO RELEASE DATA YET
          </div>
          <p className="text-[11px] tracking-[0.12em] uppercase text-[#666]">
            Published releases will appear here once real catalogue data is available.
          </p>
        </div>
      )}
      {!loading && !error && releases.length > 0 && (
        <div
          className="border border-[#2a2a2a] px-10 py-16 grid md:grid-cols-3 mt-14"
          style={{ gap: '1px', background: '#2a2a2a' }}
        >
          {releases.slice(0, 3).map((release) => (
            <ReleaseCard key={release.id} {...release} />
          ))}
        </div>
      )}
    </section>
  )
}
