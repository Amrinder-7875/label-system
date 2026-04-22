import { SectionLabel, PageTitle, StatCard, ErrorBox, Skeleton, EmptyState } from "../components/ui";
import { useApi } from "../components/ui";

const STATUS_STYLES = {
  scheduled: "border-red-dim text-red",
  "in-progress": "border-border text-cream",
  done: "border-border text-muted",
};

export default function Schedule() {
  const { data, loading, error } = useApi("/api/schedule");
  const schedule = data?.schedule ?? [];

  return (
    <div className="p-8">
      <SectionLabel text="Planning" />
      <PageTitle>Schedule</PageTitle>

      <div className="grid grid-cols-4 gap-px bg-border mb-px">
        <StatCard label="Upcoming Items" value={loading ? "—" : schedule.length} />
        <StatCard label="This Week" value={loading ? "—" : schedule.filter((item) => item.status === "scheduled").length} delta="Queued" up />
        <StatCard label="In Progress" value={loading ? "—" : schedule.filter((item) => item.status === "in-progress").length} />
        <StatCard label="Completed" value={loading ? "—" : schedule.filter((item) => item.status === "done").length} />
      </div>

      <div className="bg-surface">
        <div className="grid px-[22px] py-2 border-b border-border" style={{ gridTemplateColumns: "1fr 140px 120px 110px" }}>
          {["Task", "Owner", "Date", "Status"].map((heading) => (
            <div key={heading} className="text-[9px] tracking-[0.2em] uppercase text-muted font-mono">{heading}</div>
          ))}
        </div>

        {loading && <div className="p-6"><Skeleton rows={4} /></div>}
        {error && <ErrorBox message={error} />}
        {!loading && !error && schedule.length === 0 && <EmptyState message="No schedule items found" />}
        {!loading && !error && schedule.map((item) => (
          <div
            key={item.id}
            className="grid px-[22px] py-3 border-b border-border last:border-0 hover:bg-surface2 transition-colors duration-200 items-center"
            style={{ gridTemplateColumns: "1fr 140px 120px 110px" }}
          >
            <div className="font-anton text-[13px] uppercase text-cream tracking-[0.04em]">{item.title}</div>
            <div className="text-[11px] text-muted font-mono">{item.owner}</div>
            <div className="font-mono text-[10px] text-muted">{item.date}</div>
            <div className={`text-[9px] tracking-[0.15em] uppercase border font-mono px-[7px] py-[2px] w-fit ${STATUS_STYLES[item.status] ?? "border-border text-muted"}`}>
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
