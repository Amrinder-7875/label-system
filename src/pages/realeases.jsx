import { useState } from "react";
import { SectionLabel, PageTitle, StatCard, Tag, ErrorBox, Skeleton, EmptyState, PrimaryBtn } from "../components/ui";
import { useApi } from "../components/ui";

const TYPE_FILTER = ["All", "Album", "EP", "Single", "Compilation"];

export default function Releases() {
  const { data, loading, error } = useApi("/api/releases");
  const [type, setType]     = useState("All");
  const [search, setSearch] = useState("");
  const [showAddRelease, setShowAddRelease] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creatingRelease, setCreatingRelease] = useState(false);
  const [releaseForm, setReleaseForm] = useState({
    title: "",
    artist: "",
    type: "Single",
    coverUrl: "",
    trackCount: "",
    streams: "0",
    year: new Date().getFullYear(),
  });

  const handleReleaseFieldChange = (event) => {
    const { name, value } = event.target;
    setReleaseForm((current) => ({ ...current, [name]: value }));
  };

  const resetReleaseForm = () => {
    setReleaseForm({
      title: "",
      artist: "",
      type: "Single",
      coverUrl: "",
      trackCount: "",
      streams: "0",
      year: new Date().getFullYear(),
    });
    setCreateError("");
  };

  const handleCreateRelease = async (event) => {
    event.preventDefault();
    setCreateError("");
    setCreatingRelease(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/releases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(releaseForm),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Could not create release.");
      }

      setShowAddRelease(false);
      resetReleaseForm();
      setRefresh(!refresh);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreatingRelease(false);
    }
  };

  const releases = (data?.releases ?? []).filter((r) => {
    const matchType   = type === "All" || r.type === type;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                        r.artist.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="p-8">
      <SectionLabel text="Discography" />
      <PageTitle>Releases</PageTitle>

      <div className="grid grid-cols-4 gap-px bg-border mb-px">
        <StatCard label="Total Releases" value={loading ? "—" : (data?.releases?.length ?? 0)} />
        <StatCard label="This Year"      value={loading ? "—" : (data?.thisYear ?? 0)} delta="↑ vs last year" up />
        <StatCard label="Total Streams"  value={data?.totalStreams ?? "—"} delta="↑ 18%" up />
        <StatCard label="Avg Rating"     value={data?.avgRating   ?? "—"} />
      </div>

      {/* Filters */}
      <div className="bg-surface border-b border-border px-[22px] py-4 flex items-center gap-4 flex-wrap mb-px">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH RELEASES..."
          className="bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] uppercase px-4 py-2 outline-none focus:border-red placeholder:text-border transition-colors duration-200 w-56" />
        <div className="flex gap-px bg-border">
          {TYPE_FILTER.map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`text-[9px] tracking-[0.2em] uppercase font-mono px-4 py-2 transition-colors duration-200
                ${type === t ? "bg-red text-cream" : "bg-surface text-muted hover:text-cream hover:bg-surface2"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <PrimaryBtn onClick={() => setShowAddRelease(true)}>+ New Release</PrimaryBtn>
        </div>
      </div>

      {showAddRelease && (
        <div className="fixed inset-0 z-[300] bg-[rgba(0,0,0,0.78)] backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-[560px] border border-border bg-surface p-8 relative">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <SectionLabel text="New Release" />
                <div className="font-bebas text-[36px] leading-[0.95] uppercase text-cream">Add Release</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddRelease(false);
                  resetReleaseForm();
                }}
                className="text-[10px] tracking-[0.18em] uppercase text-muted hover:text-cream transition-colors duration-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateRelease} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Title</label>
                  <input
                    name="title"
                    required
                    value={releaseForm.title}
                    onChange={handleReleaseFieldChange}
                    placeholder="Release title"
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Artist</label>
                  <input
                    name="artist"
                    required
                    value={releaseForm.artist}
                    onChange={handleReleaseFieldChange}
                    placeholder="Artist name"
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Type</label>
                  <select
                    name="type"
                    value={releaseForm.type}
                    onChange={handleReleaseFieldChange}
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red"
                  >
                    <option value="Album">Album</option>
                    <option value="EP">EP</option>
                    <option value="Single">Single</option>
                    <option value="Compilation">Compilation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Year</label>
                  <input
                    name="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={releaseForm.year}
                    onChange={handleReleaseFieldChange}
                    placeholder={new Date().getFullYear()}
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Track Count</label>
                  <input
                    name="trackCount"
                    type="number"
                    min="1"
                    value={releaseForm.trackCount}
                    onChange={handleReleaseFieldChange}
                    placeholder="1"
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Streams</label>
                  <input
                    name="streams"
                    type="number"
                    min="0"
                    value={releaseForm.streams}
                    onChange={handleReleaseFieldChange}
                    placeholder="0"
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Cover URL (optional)</label>
                  <input
                    name="coverUrl"
                    value={releaseForm.coverUrl}
                    onChange={handleReleaseFieldChange}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
              </div>

              {createError && (
                <div className="border border-red-dim bg-black px-4 py-3">
                  <div className="text-[9px] tracking-[0.18em] uppercase text-red font-mono">{createError}</div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRelease(false);
                    resetReleaseForm();
                  }}
                  className="border border-border px-5 py-3 text-[10px] tracking-[0.18em] uppercase text-muted font-mono hover:text-cream hover:border-red-dim transition-colors duration-200"
                >
                  Cancel
                </button>
                <PrimaryBtn disabled={creatingRelease} type="submit">
                  {creatingRelease ? "Creating..." : "Create Release"}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Release grid */}
      {loading && <div className="p-6"><Skeleton rows={4} /></div>}
      {error   && <ErrorBox message={error} />}
      {!loading && !error && releases.length === 0 && <EmptyState message="No releases found" />}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-px bg-border">
          {releases.map((r, i) => (
            <div key={r.id ?? i} className="group bg-surface hover:bg-surface2 p-[22px] relative overflow-hidden transition-colors duration-200">
              {/* Cover placeholder */}
              <div className="w-full aspect-square bg-black border border-border flex items-center justify-center mb-4 overflow-hidden">
                {r.coverUrl
                  ? <img src={r.coverUrl} alt={r.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  : <span className="font-bebas text-[40px] text-border">{r.title?.[0] ?? "X"}</span>
                }
              </div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-anton text-[14px] uppercase text-cream tracking-[0.04em] truncate">{r.title}</div>
                <Tag>{r.type}</Tag>
              </div>
              <div className="text-[10px] text-muted font-mono mb-3">{r.artist}</div>
              <div className="grid grid-cols-3 gap-px bg-border">
                <div className="bg-black px-2 py-2 text-center">
                  <div className="text-[8px] uppercase text-muted font-mono">Tracks</div>
                  <div className="font-bebas text-[18px] text-cream">{r.trackCount ?? "—"}</div>
                </div>
                <div className="bg-black px-2 py-2 text-center">
                  <div className="text-[8px] uppercase text-muted font-mono">Streams</div>
                  <div className="font-bebas text-[18px] text-cream">{r.streams ?? "—"}</div>
                </div>
                <div className="bg-black px-2 py-2 text-center">
                  <div className="text-[8px] uppercase text-muted font-mono">Year</div>
                  <div className="font-bebas text-[18px] text-cream">{r.year ?? "—"}</div>
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