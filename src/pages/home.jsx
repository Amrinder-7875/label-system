import { useApi } from "../components/ui";
import { SectionLabel, PageTitle, Skeleton, ErrorBox, EmptyState, Tag } from "../components/ui";

export default function Home() {
  const { data, loading, error } = useApi("/api/tracks");

  const latestTracks = (data?.tracks ?? []).slice(0, 3);

  return (
    <div className="p-8">
      <SectionLabel text="Catalogue" />
      <PageTitle>Latest Releases</PageTitle>

      {loading && <div className="p-6"><Skeleton rows={3} /></div>}
      {error && <ErrorBox message={error} />}
      {!loading && !error && latestTracks.length === 0 && <EmptyState message="No tracks available yet" />}
      {!loading && !error && latestTracks.length > 0 && (
        <div className="grid grid-cols-3 gap-px bg-border">
          {latestTracks.map((track, i) => (
            <div key={track.id ?? i} className="group bg-surface hover:bg-surface2 p-[22px] relative overflow-hidden transition-colors duration-200">
              {/* Cover placeholder */}
              <div className="w-full aspect-square bg-black border border-border flex items-center justify-center mb-4 overflow-hidden">
                {track.coverUrl
                  ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  : <span className="font-bebas text-[40px] text-border">{track.title?.[0] ?? "T"}</span>
                }
              </div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-anton text-[14px] uppercase text-cream tracking-[0.04em] truncate">{track.title}</div>
                <Tag>{track.status}</Tag>
              </div>
              <div className="text-[10px] text-muted font-mono mb-3">{track.artist}</div>
              <div className="grid grid-cols-3 gap-px bg-border">
                <div className="bg-black px-2 py-2 text-center">
                  <div className="text-[8px] uppercase text-muted font-mono">Genre</div>
                  <div className="font-bebas text-[14px] text-cream">{track.genre ?? "—"}</div>
                </div>
                <div className="bg-black px-2 py-2 text-center">
                  <div className="text-[8px] uppercase text-muted font-mono">Streams</div>
                  <div className="font-bebas text-[14px] text-cream">{track.streams ?? "0"}</div>
                </div>
                <div className="bg-black px-2 py-2 text-center">
                  <div className="text-[8px] uppercase text-muted font-mono">BPM</div>
                  <div className="font-bebas text-[14px] text-cream">{track.bpm ?? "—"}</div>
                </div>
              </div>
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-red scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}