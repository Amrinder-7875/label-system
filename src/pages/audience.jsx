import { SectionLabel, PageTitle, StatCard, Panel, ErrorBox, Skeleton, EmptyState } from "../components/ui";
import { useApi } from "../components/ui";

export default function Audience() {
  const { data, loading, error } = useApi("/api/audience");

  return (
    <div className="p-8">
      <SectionLabel text="Growth" />
      <PageTitle>Audience</PageTitle>

      <div className="grid grid-cols-4 gap-px bg-border mb-px">
        <StatCard label="Monthly Listeners" value={loading ? "—" : data?.monthlyListeners} delta="Across platforms" up />
        <StatCard label="Followers" value={loading ? "—" : data?.followers} delta="↑ 9% this month" up />
        <StatCard label="Save Rate" value={loading ? "—" : data?.saveRate} />
        <StatCard label="Engagement" value={loading ? "—" : data?.engagement} delta="Healthy trend" up />
      </div>

      <div className="grid grid-cols-2 gap-px bg-border">
        <Panel title="Top Cities">
          {loading && <Skeleton rows={4} />}
          {error && <ErrorBox message={error} />}
          {!loading && !error && (data?.topCities?.length ?? 0) === 0 && <EmptyState message="No audience data" />}
          {!loading && !error && data?.topCities?.map((city) => (
            <div key={city.city} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className="flex-1">
                <div className="font-anton text-[13px] uppercase text-cream tracking-[0.04em]">{city.city}</div>
                <div className="text-[10px] text-muted font-mono mt-1">{city.listeners} listeners</div>
              </div>
              <div className="text-[10px] font-mono text-red">{city.growth}</div>
            </div>
          ))}
        </Panel>

        <Panel title="Age Split">
          {loading && <Skeleton rows={4} />}
          {error && <ErrorBox message={error} />}
          {!loading && !error && (data?.demographics?.length ?? 0) === 0 && <EmptyState message="No demographic data" />}
          {!loading && !error && data?.demographics?.map((group) => (
            <div key={group.label} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className="w-16 text-[10px] tracking-[0.15em] uppercase text-muted font-mono">{group.label}</div>
              <div className="flex-1 h-1 bg-border relative">
                <div className="absolute top-0 left-0 h-full bg-red" style={{ width: `${group.pct}%` }} />
              </div>
              <div className="font-bebas text-[18px] text-cream w-12 text-right">{group.pct}%</div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
