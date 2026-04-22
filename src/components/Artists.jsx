import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'
import { usePublicApi } from '../hooks/usePublicApi'

function ArtistCard({ name, genres, trackCount, streams }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group bg-[#141414] px-5 py-7 relative overflow-hidden hover:bg-[#1c1c1c] transition-colors duration-200">
      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e63329] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
      <div className="w-12 h-12 border border-[#2a2a2a] flex items-center justify-center mb-4">
        <span className="text-[#e63329] text-[18px]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          {initials}
        </span>
      </div>
      <div className="text-[18px] tracking-[0.05em] text-[#f0ede8] mb-1" style={{ fontFamily: "'Anton', sans-serif" }}>
        {name}
      </div>
      <div className="text-[9px] tracking-[0.25em] uppercase text-[#666] mb-5">
        {(genres?.length ?? 0) > 0 ? genres.join(" / ") : "Artist"}
      </div>
      <div className="grid grid-cols-2 gap-px bg-[#2a2a2a]">
        <div className="bg-[#0e0e0e] px-3 py-2">
          <div className="text-[8px] uppercase text-[#666] font-mono">Tracks</div>
          <div className="text-[#f0ede8] text-[20px]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{trackCount ?? 0}</div>
        </div>
        <div className="bg-[#0e0e0e] px-3 py-2">
          <div className="text-[8px] uppercase text-[#666] font-mono">Streams</div>
          <div className="text-[#f0ede8] text-[20px]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{Number(streams ?? 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

export default function Artists() {
  const { data, loading, error } = usePublicApi("/api/artists");
  const artists = data?.artists ?? [];

  return (
    <section id="artists" className="px-6 md:px-12 py-24 border-b border-[#2a2a2a] bg-[#0e0e0e]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14">
        <div>
          <SectionLabel>Our Roster</SectionLabel>
          <SectionTitle>THE<br />ARTISTS</SectionTitle>
        </div>
        <p className="max-w-[360px] text-[#666] text-[13px] leading-[1.8] mt-4 md:mt-0">
          Live roster data pulled directly from the label system.
        </p>
      </div>

      {loading && <div className="border border-[#2a2a2a] bg-[#141414] px-8 py-16 text-center text-[#666] text-[11px] tracking-[0.12em] uppercase">Loading roster...</div>}
      {error && <div className="border border-[#7a1a15] bg-[#141414] px-8 py-16 text-center text-[#e63329] text-[11px] tracking-[0.12em] uppercase">{error}</div>}
      {!loading && !error && artists.length === 0 && (
        <div className="border border-[#2a2a2a] bg-[#141414] px-8 py-16 text-center">
          <div className="text-[22px] text-[#f0ede8] mb-3" style={{ fontFamily: "'Anton', sans-serif" }}>
            NO ROSTER DATA YET
          </div>
          <p className="text-[11px] tracking-[0.12em] uppercase text-[#666]">
            Add artists through the live system to populate this section.
          </p>
        </div>
      )}
      {!loading && !error && artists.length > 0 && (
        <div
          className="grid md:grid-cols-3 border border-[#2a2a2a]"
          style={{ gap: '1px', background: '#2a2a2a' }}
        >
          {artists.slice(0, 6).map((artist) => (
            <ArtistCard key={artist.id} {...artist} />
          ))}
        </div>
      )}
    </section>
  )
}
