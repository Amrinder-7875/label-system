import { useState } from "react";
import { SectionLabel, PageTitle, StatCard, Panel, Tag, ErrorBox, Skeleton, EmptyState, PrimaryBtn } from "../components/ui";
import { useApi } from "../components/ui";
import { useSubmissions } from "../context/submissions";

const STATUS_OPTIONS = ["pending", "in_review", "approved", "rejected"];
const STATUS_LABELS = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function Artists() {
  const [refreshKey, setRefreshKey] = useState(false);
  const { data, loading, error } = useApi("/api/artists", refreshKey);
  const { submissions, loading: submissionsLoading, error: submissionsError, updateSubmissionStatus } = useSubmissions();
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [showCreateArtist, setShowCreateArtist] = useState(false);
  const [createArtistError, setCreateArtistError] = useState("");
  const [creatingArtist, setCreatingArtist] = useState(false);
  const [artistForm, setArtistForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const artists = (data?.artists ?? []).filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );
  const liveSubmissions = submissions.filter(
    (submission) => submission.source === "database"
  );

  const handleStatusUpdate = async (submissionId, status) => {
    setReviewError("");
    setUpdatingId(submissionId);

    try {
      await updateSubmissionStatus(submissionId, status);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setUpdatingId("");
    }
  };

  const handleArtistFieldChange = (event) => {
    const { name, value } = event.target;
    setArtistForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateArtist = async (event) => {
    event.preventDefault();
    setCreateArtistError("");
    setCreatingArtist(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://label-system-d8af.onrender.com/api/artists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(artistForm),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Could not create artist.");
      }

      setArtistForm({ name: "", email: "", password: "" });
      setShowCreateArtist(false);
      setRefreshKey((current) => !current);
    } catch (err) {
      setCreateArtistError(err.message);
    } finally {
      setCreatingArtist(false);
    }
  };

  return (
    <div className="p-8">
      {showCreateArtist && (
        <div className="fixed inset-0 z-[300] bg-[rgba(0,0,0,0.78)] backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-[480px] border border-border bg-surface p-8 relative">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <SectionLabel text="New Artist" />
                <div className="font-bebas text-[36px] leading-[0.95] uppercase text-cream">Create Artist</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateArtist(false);
                  setCreateArtistError("");
                }}
                className="text-[10px] tracking-[0.18em] uppercase text-muted hover:text-cream transition-colors duration-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateArtist} className="space-y-4">
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Artist Name</label>
                <input
                  name="name"
                  value={artistForm.name}
                  onChange={handleArtistFieldChange}
                  placeholder="Artist display name"
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={artistForm.email}
                  onChange={handleArtistFieldChange}
                  placeholder="artist@email.com"
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={artistForm.password}
                  onChange={handleArtistFieldChange}
                  placeholder="Create login password"
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] px-4 py-3 outline-none focus:border-red placeholder:text-border transition-colors duration-200"
                />
              </div>

              {createArtistError && (
                <div className="border border-red-dim bg-black px-4 py-3">
                  <div className="text-[9px] tracking-[0.18em] uppercase text-red font-mono">{createArtistError}</div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateArtist(false);
                    setCreateArtistError("");
                  }}
                  className="border border-border px-5 py-3 text-[10px] tracking-[0.18em] uppercase text-muted font-mono hover:text-cream hover:border-red-dim transition-colors duration-200"
                >
                  Cancel
                </button>
                <PrimaryBtn disabled={creatingArtist}>
                  {creatingArtist ? "Creating..." : "Create Artist"}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}

      <SectionLabel text="Roster" />
      <PageTitle>Artists</PageTitle>

      <div className="grid grid-cols-4 gap-px bg-border mb-px">
        <StatCard label="Total Artists"  value={loading ? "—" : (data?.artists?.length ?? 0)} />
        <StatCard label="Active"         value={loading ? "—" : (data?.artists?.filter(a => a.status === "active").length ?? 0)} delta="On roster" up />
        <StatCard label="Total Releases" value={data?.totalReleases ?? "—"} />
        <StatCard label="Combined Streams" value={data?.combinedStreams ?? "—"} delta="↑ 14%" up />
      </div>

      {/* Search */}
      <div className="bg-surface border-b border-border px-[22px] py-4 flex items-center justify-between mb-px">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH ARTISTS..."
          className="bg-black border border-border text-cream font-mono text-[11px] tracking-[0.1em] uppercase px-4 py-2 outline-none focus:border-red placeholder:text-border transition-colors duration-200 w-56" />
        <PrimaryBtn onClick={() => setShowCreateArtist(true)}>+ Add Artist</PrimaryBtn>
      </div>

      {/* Artist grid */}
      {loading && <div className="p-6"><Skeleton rows={4} /></div>}
      {error   && <ErrorBox message={error} />}
      {createArtistError && !showCreateArtist && <ErrorBox message={createArtistError} />}
      {!loading && !error && artists.length === 0 && <EmptyState message="No artists found" />}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-px bg-border">
          {artists.map((a, i) => (
            <div key={a.id ?? i} className="group bg-surface hover:bg-surface2 p-[22px] relative overflow-hidden transition-colors duration-200">
              {/* Initials avatar */}
              <div className="w-12 h-12 bg-black border border-border flex items-center justify-center mb-4">
                <span className="font-bebas text-[20px] text-red">
                  {a.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="font-anton text-[16px] uppercase text-cream tracking-[0.04em] mb-1">{a.name}</div>
              <div className="text-[10px] text-muted font-mono mb-3">{a.email}</div>
              <div className="flex gap-2 flex-wrap mb-3">
                {(a.genres ?? []).map((g) => <Tag key={g}>{g}</Tag>)}
              </div>
              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="bg-black px-3 py-2">
                  <div className="text-[9px] uppercase text-muted font-mono">Tracks</div>
                  <div className="font-bebas text-[20px] text-cream">{a.trackCount ?? "—"}</div>
                </div>
                <div className="bg-black px-3 py-2">
                  <div className="text-[9px] uppercase text-muted font-mono">Streams</div>
                  <div className="font-bebas text-[20px] text-cream">{a.streams ?? "—"}</div>
                </div>
              </div>
              <div className={`absolute top-[22px] right-[22px] text-[9px] tracking-[0.15em] uppercase border font-mono px-[7px] py-[2px]
                ${a.status === "active" ? "border-red-dim text-red" : "border-border text-muted"}`}>
                {a.status ?? "—"}
              </div>
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-red scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-px bg-surface p-[22px]">
        <div className="flex items-end justify-between gap-6 mb-6">
          <div>
            <SectionLabel text="Artist Demos" />
            <div className="font-anton text-[18px] uppercase text-cream tracking-[0.05em]">Review Queue</div>
          </div>
          <div className="text-[10px] tracking-[0.14em] uppercase text-muted font-mono">
            {submissionsLoading ? "Loading..." : `${liveSubmissions.length} live submissions`}
          </div>
        </div>

        {submissionsLoading && <Skeleton rows={4} />}
        {submissionsError && <ErrorBox message={submissionsError} />}
        {reviewError && <ErrorBox message={reviewError} />}
        {!submissionsLoading && !submissionsError && liveSubmissions.length === 0 && (
          <EmptyState message="No live demo submissions yet" />
        )}

        {!submissionsLoading && !submissionsError && liveSubmissions.length > 0 && (
          <div className="space-y-px bg-border">
            {liveSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="grid gap-px bg-border"
                style={{ gridTemplateColumns: "1.1fr 1.1fr 140px 180px" }}
              >
                <div className="bg-black px-5 py-4">
                  <div className="font-anton text-[14px] uppercase text-cream tracking-[0.04em]">
                    {submission.artistName}
                  </div>
                  <div className="text-[10px] text-muted font-mono mt-1">{submission.email}</div>
                  {submission.demoUrl && (
                    <a
                      href={submission.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[10px] text-red font-mono mt-3 break-all hover:opacity-80 transition-opacity duration-200"
                    >
                      {submission.demoUrl}
                    </a>
                  )}
                </div>
                <div className="bg-black px-5 py-4">
                  <div className="text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Tracking ID</div>
                  <div className="font-mono text-[14px] text-cream tracking-[0.12em]">{submission.trackingId}</div>
                  <div className="text-[9px] tracking-[0.18em] uppercase text-muted font-mono mt-4 mb-1">Message</div>
                  <div className="text-[11px] text-[#888] font-mono leading-[1.7]">
                    {submission.message || "No message attached"}
                  </div>
                </div>
                <div className="bg-black px-5 py-4">
                  <div className="text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Current Status</div>
                  <Tag>{STATUS_LABELS[submission.status] ?? submission.status}</Tag>
                  <div className="text-[9px] text-muted font-mono mt-4">
                    {submission.updatedAt
                      ? `Updated ${new Date(submission.updatedAt).toLocaleDateString()}`
                      : `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="bg-black px-5 py-4">
                  <div className="text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-3">Update Status</div>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusUpdate(submission.id, status)}
                        disabled={updatingId === submission.id}
                        className={`border px-3 py-2 text-[9px] tracking-[0.16em] uppercase font-mono transition-colors duration-200 ${
                          submission.status === status
                            ? "border-red-dim text-red bg-surface"
                            : "border-border text-muted hover:text-cream hover:border-red-dim"
                        } disabled:opacity-50`}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
