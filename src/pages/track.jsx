import { useState } from "react";
import { SectionLabel, PageTitle, StatCard, Panel, Tag, ErrorBox, Skeleton, EmptyState, PrimaryBtn } from "../components/ui";
import { useApi } from "../components/ui";

const GENRES = ["All", "Phonk", "Montagem", "Baile", "Drill", "Ambient"];
const TRACK_STATUSES = ["draft", "scheduled", "released"];

export default function Tracks() {
  const [genre, setGenre]   = useState("All");
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creatingTrack, setCreatingTrack] = useState(false);
  const [trackForm, setTrackForm] = useState({
    submissionId: "",
    title: "",
    artist: "",
    genre: "Phonk",
    bpm: "",
    streams: "0",
    status: "draft",
    duration: "",
  });

  const { data, loading, error } = useApi("/api/tracks", refresh);
  const {
    data: submissionData,
    loading: submissionsLoading,
    error: submissionsError,
  } = useApi("/api/submissions", refresh);

  // Added a console log to inspect the API response
  console.log("Tracks API Response:", data);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`https://label-system-d8af.onrender.com/api/tracks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRefresh(!refresh);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const tracks = data?.tracks ?? [];
  const totalStreams = data?.totalStreams ?? 0;
  const avgPerTrack = data?.avgPerTrack ?? 0;
  const approvedSubmissions = (submissionData?.submissions ?? []).filter(
    (submission) =>
      submission.status === "approved" &&
      !tracks.some((track) => track.sourceSubmissionId === submission.id)
  );
  const filtered = tracks.filter((t) => {
    const matchGenre  = genre === "All" || t.genre === genre;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                        t.artist.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  const handleTrackFieldChange = (event) => {
    const { name, value } = event.target;

    if (name === "submissionId") {
      const submission = approvedSubmissions.find((item) => item.id === value);
      setTrackForm((current) => ({
        ...current,
        submissionId: value,
        title: submission
          ? current.title && current.submissionId === value
            ? current.title
            : `${submission.artistName} Demo`
          : "",
        artist: submission?.artistName ?? "",
      }));
      return;
    }

    setTrackForm((current) => ({ ...current, [name]: value }));
  };

  const resetTrackForm = () => {
    setTrackForm({
      submissionId: "",
      title: "",
      artist: "",
      genre: "Phonk",
      bpm: "",
      streams: "0",
      status: "draft",
      duration: "",
    });
    setCreateError("");
  };

  const handleCreateTrack = async (event) => {
    event.preventDefault();
    setCreateError("");
    setCreatingTrack(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://label-system-d8af.onrender.com/api/tracks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submissionId: trackForm.submissionId || undefined,
          title: trackForm.title,
          artist: trackForm.artist,
          genre: trackForm.genre,
          bpm: trackForm.bpm ? Number(trackForm.bpm) : null,
          streams: Number(trackForm.streams || 0),
          status: trackForm.status,
          duration: trackForm.duration,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Could not create track.");
      }

      setShowAddTrack(false);
      resetTrackForm();
      setRefresh((current) => !current);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreatingTrack(false);
    }
  };

  return (
    <div className="p-8">
      {showAddTrack && (
        <div className="fixed inset-0 z-[300] bg-[rgba(0,0,0,0.78)] backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-[560px] border border-border bg-surface p-8 relative">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <SectionLabel text="New Track" />
                <div className="font-bebas text-[36px] leading-[0.95] uppercase text-cream">Add Track</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddTrack(false);
                  resetTrackForm();
                }}
                className="text-[10px] tracking-[0.18em] uppercase text-muted hover:text-cream transition-colors duration-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateTrack} className="space-y-4">
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Approved Submission</label>
                <select
                  name="submissionId"
                  value={trackForm.submissionId}
                  onChange={handleTrackFieldChange}
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red"
                >
                  <option value="">Manual Entry</option>
                  {approvedSubmissions.map((submission) => (
                    <option key={submission.id} value={submission.id}>
                      {submission.artistName} • {submission.trackingId}
                    </option>
                  ))}
                </select>
                {submissionsLoading && <div className="text-[9px] tracking-[0.15em] uppercase text-muted font-mono mt-2">Loading approved submissions...</div>}
                {submissionsError && <div className="text-[9px] tracking-[0.15em] uppercase text-red font-mono mt-2">{submissionsError}</div>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Track Title</label>
                  <input
                    name="title"
                    required
                    value={trackForm.title}
                    onChange={handleTrackFieldChange}
                    placeholder="Track title"
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Artist</label>
                  <input
                    name="artist"
                    required
                    value={trackForm.artist}
                    onChange={handleTrackFieldChange}
                    placeholder="Artist name"
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Genre</label>
                  <select
                    name="genre"
                    value={trackForm.genre}
                    onChange={handleTrackFieldChange}
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red"
                  >
                    {GENRES.filter((item) => item !== "All").map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Status</label>
                  <select
                    name="status"
                    value={trackForm.status}
                    onChange={handleTrackFieldChange}
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red"
                  >
                    {TRACK_STATUSES.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">BPM</label>
                  <input
                    name="bpm"
                    type="number"
                    min="0"
                    value={trackForm.bpm}
                    onChange={handleTrackFieldChange}
                    placeholder="140"
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Duration</label>
                  <input
                    name="duration"
                    value={trackForm.duration}
                    onChange={handleTrackFieldChange}
                    placeholder="2:48"
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Starting Streams</label>
                  <input
                    name="streams"
                    type="number"
                    min="0"
                    value={trackForm.streams}
                    onChange={handleTrackFieldChange}
                    placeholder="0"
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
                    setShowAddTrack(false);
                    resetTrackForm();
                  }}
                  className="border border-border px-5 py-3 text-[10px] tracking-[0.18em] uppercase text-muted font-mono hover:text-cream hover:border-red-dim transition-colors duration-200"
                >
                  Cancel
                </button>
                <PrimaryBtn disabled={creatingTrack}>
                  {creatingTrack ? "Adding..." : "Add Track"}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}

      <SectionLabel text="Catalogue" />
      <PageTitle>Tracks</PageTitle>

      <div className="grid grid-cols-4 gap-px bg-border mb-px">
        <StatCard label="Total Tracks"    value={loading ? "—" : tracks.length} />
        <StatCard label="Released"        value={loading ? "—" : tracks.filter(t => t.status === "released").length} />
        <StatCard label="Total Streams"   value={loading ? "—" : Number(totalStreams).toLocaleString()} />
        <StatCard label="Avg per Track"   value={loading ? "—" : Number(avgPerTrack).toLocaleString()} />
      </div>

      {/* Filters */}
      <div className="bg-surface border-b border-border px-[22px] py-4 flex items-center gap-4 flex-wrap mb-px">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH TRACKS..."
          className="bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] uppercase px-4 py-2 outline-none focus:border-red placeholder:text-border transition-colors duration-200 w-56"
        />
        <div className="flex gap-px bg-border">
          {GENRES.map((g) => (
            <button key={g} onClick={() => setGenre(g)}
              className={`text-[9px] tracking-[0.2em] uppercase font-mono px-4 py-2 transition-colors duration-200
                ${genre === g ? "bg-red text-cream" : "bg-surface text-muted hover:text-cream hover:bg-surface2"}`}>
              {g}
            </button>
          ))}
        </div>
        <PrimaryBtn onClick={() => setShowAddTrack(true)}>
          Add Track
        </PrimaryBtn>
        <PrimaryBtn onClick={() => setRefresh(!refresh)}>
          Refresh
        </PrimaryBtn>
      </div>

      {/* Table */}
      <div className="bg-surface">
        <div className="grid px-[22px] py-2 border-b border-border" style={{ gridTemplateColumns: "40px 1fr 140px 100px 80px 90px 80px 80px" }}>
          {["#","Title","Artist","Genre","BPM","Streams","Status","Action"].map((h) => (
            <div key={h} className="text-[9px] tracking-[0.2em] uppercase text-muted font-mono">{h}</div>
          ))}
        </div>

        {loading && <div className="p-6"><Skeleton rows={6} /></div>}
        {error   && <ErrorBox message={error} />}
        {!loading && !error && filtered.length === 0 && <EmptyState message="No tracks found" />}
        {!loading && !error && filtered.map((t, i) => (
          <div key={t.id ?? i}
            className="grid px-[22px] py-3 border-b border-border hover:bg-surface2 transition-colors duration-200 group items-center"
            style={{ gridTemplateColumns: "40px 1fr 140px 100px 80px 90px 80px 80px" }}>
            <div className="font-bebas text-[16px] text-border">{String(i + 1).padStart(2, "0")}</div>
            <div>
              <div className="font-anton text-[13px] uppercase text-cream tracking-[0.04em] truncate">{t.title}</div>
              <div className="text-[10px] text-muted mt-[2px]">{t.duration ?? "—"}</div>
            </div>
            <div className="text-[11px] text-[#888] font-mono truncate">{t.artist}</div>
            <Tag>{t.genre ?? "—"}</Tag>
            <div className="font-bebas text-[16px] text-muted">{t.bpm ?? "—"}</div>
            <div className="font-bebas text-[16px] text-cream">{t.streams ?? "0"}</div>
            <div className={`text-[9px] tracking-[0.15em] uppercase font-mono
              ${t.status === "released" ? "text-red" : t.status === "draft" ? "text-muted" : "text-[#888]"}`}>
              {t.status ?? "—"}
            </div>
            <button
              onClick={() => handleDelete(t.id)}
              className="text-[9px] uppercase text-red border border-red px-2 py-1 hover:bg-red hover:text-black transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Added a function to fetch and return the top 3 latest tracks
export function getLatestTracks(tracks) {
  return tracks.slice(0, 3);
}
