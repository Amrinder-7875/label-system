import { useState } from "react";
import { SectionLabel, PageTitle, StatCard, Tag, ErrorBox, Skeleton, EmptyState } from "../components/ui";
import { useSubmissions } from "../context/submissions";

const STATUS_OPTIONS = ["pending", "in_review", "approved", "rejected"];
const STATUS_LABELS = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_STYLES = {
  pending:  "border-red-dim text-red",
  in_review: "border-red-dim text-[#f0ede8]",
  approved: "border-border text-[#888]",
  rejected: "border-border text-muted",
};

export default function Submissions() {
  const { submissions, loading, error, updateSubmissionStatus } = useSubmissions();
  const [filter, setFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState("");
  const [reviewError, setReviewError] = useState("");

  const all  = submissions;
  const list = filter === "All" ? all : all.filter(s => s.status === filter.toLowerCase());

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

  return (
    <div className="p-8">
      <SectionLabel text="Inbox" />
      <PageTitle>Submissions</PageTitle>

      <div className="grid grid-cols-4 gap-px bg-border mb-px">
        <StatCard label="Total"    value={loading ? "—" : all.length} />
        <StatCard label="Pending"  value={loading ? "—" : all.filter(s => s.status === "pending").length}  delta="Needs review" />
        <StatCard label="Approved" value={loading ? "—" : all.filter(s => s.status === "approved").length} delta="This month" up />
        <StatCard label="Rejected" value={loading ? "—" : all.filter(s => s.status === "rejected").length} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-px bg-border mb-px">
        {["All", "Pending", "Approved", "Rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[9px] tracking-[0.2em] uppercase font-mono px-6 py-3 transition-colors duration-200
              ${filter === f ? "bg-red text-cream" : "bg-surface text-muted hover:text-cream hover:bg-surface2"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface">
        <div className="grid px-[22px] py-2 border-b border-border" style={{ gridTemplateColumns: "1fr 140px 100px 100px 90px 120px 120px" }}>
          {["Track", "Artist", "Genre", "BPM", "Status", "Submitted", "Review"].map((h) => (
            <div key={h} className="text-[9px] tracking-[0.2em] uppercase text-muted font-mono">{h}</div>
          ))}
        </div>

        {loading && <div className="p-6"><Skeleton rows={6} /></div>}
        {error   && <ErrorBox message={error} />}
        {reviewError && <ErrorBox message={reviewError} />}
        {!loading && !error && list.length === 0 && <EmptyState message={`No ${filter.toLowerCase()} submissions`} />}
        {!loading && !error && list.map((s, i) => (
          <div key={s.id ?? i}
            className="grid px-[22px] py-3 border-b border-border last:border-0 hover:bg-surface2 transition-all duration-200 items-center group"
            style={{ gridTemplateColumns: "1fr 140px 100px 100px 90px 120px 120px" }}>
            <div>
              <div className="font-anton text-[13px] uppercase text-cream tracking-[0.04em] truncate">{s.trackTitle}</div>
              {(s.demoUrl || s.fileUrl) && (
                <a
                  href={s.demoUrl || s.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-[9px] text-red font-mono mt-[2px] truncate hover:opacity-80 transition-opacity duration-200"
                >
                  {s.demoUrl || s.fileUrl}
                </a>
              )}
            </div>
            <div className="text-[11px] text-muted font-mono truncate">{s.artistName}</div>
            <Tag>{s.genre ?? "—"}</Tag>
            <div className="font-bebas text-[16px] text-muted">{s.bpm ?? "—"}</div>
            <div className={`text-[9px] tracking-[0.15em] uppercase border font-mono px-[7px] py-[2px] w-fit ${STATUS_STYLES[s.status] ?? "text-muted border-border"}`}>
              {s.status}
            </div>
            <div className="font-mono text-[10px] text-muted">
              {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "—"}
            </div>
            <div>
              {(s.demoUrl || s.fileUrl) ? (
                <a
                  href={s.demoUrl || s.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center border border-red-dim px-3 py-2 text-[9px] tracking-[0.15em] uppercase text-red font-mono hover:bg-surface2 transition-colors duration-200"
                >
                  Review Demo
                </a>
              ) : (
                <span className="text-[9px] tracking-[0.15em] uppercase text-muted font-mono">No Link</span>
              )}
            </div>
            <div className="col-span-full mt-3 border-t border-border pt-3">
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusUpdate(s.id, status)}
                    disabled={updatingId === s.id}
                    className={`border px-3 py-2 text-[9px] tracking-[0.16em] uppercase font-mono transition-colors duration-200 ${
                      s.status === status
                        ? "border-red-dim text-red bg-black"
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
    </div>
  );
}
