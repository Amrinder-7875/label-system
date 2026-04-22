import { SectionLabel, PageTitle, StatCard, Panel, ErrorBox, Skeleton, EmptyState, Tag } from "../components/ui";
import { useApi } from "../components/ui";

export default function Dashboard() {
  const { data, loading, error } = useApi("/api/admin");
  const { data: tracksData, loading: tracksLoading, error: tracksError } = useApi("/api/tracks");
  
  const stats = data?.stats ?? {};
  const latestTracks = (tracksData?.tracks ?? []).slice(0, 3);

  return (
    <div className="p-8">
      <SectionLabel text="This month" />
      <PageTitle>Label<br />Overview</PageTitle>

      <div className="grid grid-cols-4 gap-px bg-border mb-px">
        <StatCard label="Artists" value={loading ? "—" : stats.artists ?? 0} />
        <StatCard label="Submissions" value={loading ? "—" : stats.submissions ?? 0} />
        <StatCard label="Tracks" value={loading ? "—" : stats.tracks ?? 0} />
        <StatCard label="Total Revenue" value={loading ? "—" : `$${Number(stats.revenue ?? 0).toFixed(2)}`} />
      </div>

      <div className="grid grid-cols-2 gap-px bg-border mb-px">
        <Panel title="Overview Status">
          {loading && <Skeleton />}
          {error && <ErrorBox message={error} />}
          {!loading && !error && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] tracking-[0.15em] uppercase text-muted font-mono">Backend</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-red font-mono">Live</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] tracking-[0.15em] uppercase text-muted font-mono">Artists</span>
                <span className="font-bebas text-[22px] text-cream">{stats.artists ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] tracking-[0.15em] uppercase text-muted font-mono">Submissions</span>
                <span className="font-bebas text-[22px] text-cream">{stats.submissions ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] tracking-[0.15em] uppercase text-muted font-mono">Paid Out</span>
                <span className="font-bebas text-[22px] text-cream">${Number(stats.paidOut ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.15em] uppercase text-muted font-mono">Message</span>
                <span className="text-[10px] tracking-[0.15em] uppercase text-muted font-mono">{data?.message ?? "No summary available"}</span>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Admin Data">
          {loading && <Skeleton />}
          {error   && <ErrorBox message={error} />}
          {!loading && !error && <EmptyState message="No additional admin records yet" />}
        </Panel>
      </div>

      <div className="grid gap-px bg-border" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <Panel title="Recent Activity">
          <EmptyState message="No recent activity yet" />
        </Panel>

        <Panel title="Platform Split">
          <EmptyState message="No platform split data yet" />
        </Panel>
      </div>

      {/* Latest Releases Section */}
      <div className="mt-8">
        <SectionLabel text="Catalogue" />
        <PageTitle>Latest Releases</PageTitle>

        {tracksLoading && <div className="p-6"><Skeleton rows={3} /></div>}
        {tracksError && <ErrorBox message={tracksError} />}
        {!tracksLoading && !tracksError && latestTracks.length === 0 && <EmptyState message="No tracks available yet" />}
        {!tracksLoading && !tracksError && latestTracks.length > 0 && (
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
    </div>
  );
}
