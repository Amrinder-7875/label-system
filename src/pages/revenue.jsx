import { useState } from "react";
import { SectionLabel, PageTitle, StatCard, Panel, ErrorBox, Skeleton, EmptyState, PrimaryBtn } from "../components/ui";
import { useApi } from "../components/ui";

const PERIODS = ["Weekly", "Monthly", "Quarterly", "Yearly"];
const PLATFORMS = ["Spotify", "Apple", "YouTube", "Tidal", "Other"];

const initialRevenueForm = () => ({
  trackId: "",
  title: "",
  artist: "",
  platform: "Spotify",
  streams: "0",
  revenue: "",
  share: "",
  recordedAt: new Date().toISOString().slice(0, 10),
});

const initialPayoutForm = () => ({
  cycle: "",
  date: new Date().toISOString().slice(0, 10),
  status: "paid",
  amount: "",
});

export default function Revenue() {
  const [refreshKey, setRefreshKey] = useState(false);
  const [period, setPeriod] = useState("Monthly");
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [revenueForm, setRevenueForm] = useState(initialRevenueForm());
  const [payoutForm, setPayoutForm] = useState(initialPayoutForm());

  const { data, loading, error } = useApi(`/api/revenue?period=${period}`, refreshKey);
  const { data: trackData } = useApi("/api/tracks", refreshKey);

  const tracks = trackData?.tracks ?? [];
  const payouts = data?.payouts ?? [];
  const allPayouts = data?.allTime?.payouts ?? payouts;
  const earningsByTrack = data?.earningsByTrack ?? [];
  const allEarningsByTrack = data?.allTime?.earningsByTrack ?? earningsByTrack;
  const breakdown = data?.breakdown ?? [];
  const lastPaidPayout = payouts.find((entry) => entry.status === "paid");

  const saveRevenueSnapshot = async (nextPayload) => {
    setActionError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://label-system-d8af.onrender.com/api/revenue", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nextPayload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Could not update revenue.");
      }

      setRefreshKey((current) => !current);
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRevenueFieldChange = (event) => {
    const { name, value } = event.target;

    if (name === "trackId") {
      const selectedTrack = tracks.find((track) => track.id === value);
      setRevenueForm((current) => ({
        ...current,
        trackId: value,
        title: selectedTrack?.title ?? current.title,
        artist: selectedTrack?.artist ?? current.artist,
        streams: selectedTrack ? String(selectedTrack.streams ?? 0) : current.streams,
      }));
      return;
    }

    setRevenueForm((current) => ({ ...current, [name]: value }));
  };

  const handlePayoutFieldChange = (event) => {
    const { name, value } = event.target;
    setPayoutForm((current) => ({ ...current, [name]: value }));
  };

  const closeRevenueModal = () => {
    setShowRevenueModal(false);
    setRevenueForm(initialRevenueForm());
    setActionError("");
  };

  const closePayoutModal = () => {
    setShowPayoutModal(false);
    setPayoutForm(initialPayoutForm());
    setActionError("");
  };

  const handleAddRevenue = async (event) => {
    event.preventDefault();

    const success = await saveRevenueSnapshot({
      earningsByTrack: [
        {
          trackId: revenueForm.trackId,
          title: revenueForm.title,
          artist: revenueForm.artist,
          platform: revenueForm.platform,
          streams: Number(revenueForm.streams || 0),
          revenue: Number(revenueForm.revenue || 0),
          share: Number(revenueForm.share || 0),
          recordedAt: revenueForm.recordedAt,
        },
        ...allEarningsByTrack,
      ],
      payouts: allPayouts,
    });

    if (success) {
      closeRevenueModal();
    }
  };

  const handleAddPayout = async (event) => {
    event.preventDefault();

    const success = await saveRevenueSnapshot({
      earningsByTrack: allEarningsByTrack,
      payouts: [
        {
          cycle: payoutForm.cycle,
          date: payoutForm.date,
          status: payoutForm.status,
          amount: Number(payoutForm.amount || 0),
        },
        ...allPayouts,
      ],
    });

    if (success) {
      closePayoutModal();
    }
  };

  const handleDeleteRevenue = async (indexToRemove) => {
    await saveRevenueSnapshot({
      earningsByTrack: allEarningsByTrack.filter((_, index) => index !== indexToRemove),
      payouts: allPayouts,
    });
  };

  const handleDeletePayout = async (indexToRemove) => {
    await saveRevenueSnapshot({
      earningsByTrack: allEarningsByTrack,
      payouts: allPayouts.filter((_, index) => index !== indexToRemove),
    });
  };

  return (
    <div className="p-8">
      {showRevenueModal && (
        <div className="fixed inset-0 z-[300] bg-[rgba(0,0,0,0.78)] backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-[560px] border border-border bg-surface p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <SectionLabel text="Add Revenue" />
                <div className="font-bebas text-[36px] leading-[0.95] uppercase text-cream">Revenue Entry</div>
              </div>
              <button
                type="button"
                onClick={closeRevenueModal}
                className="text-[10px] tracking-[0.18em] uppercase text-muted hover:text-cream transition-colors duration-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddRevenue} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Track</label>
                <select
                  name="trackId"
                  value={revenueForm.trackId}
                  onChange={handleRevenueFieldChange}
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                >
                  <option value="">Manual Entry</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title} • {track.artist}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Track Title</label>
                <input
                  name="title"
                  required
                  value={revenueForm.title}
                  onChange={handleRevenueFieldChange}
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Artist</label>
                <input
                  name="artist"
                  required
                  value={revenueForm.artist}
                  onChange={handleRevenueFieldChange}
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Platform</label>
                <select
                  name="platform"
                  value={revenueForm.platform}
                  onChange={handleRevenueFieldChange}
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Recorded Date</label>
                <input
                  type="date"
                  name="recordedAt"
                  required
                  value={revenueForm.recordedAt}
                  onChange={handleRevenueFieldChange}
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Streams</label>
                <input
                  type="number"
                  min="0"
                  name="streams"
                  value={revenueForm.streams}
                  onChange={handleRevenueFieldChange}
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Revenue</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="revenue"
                  required
                  value={revenueForm.revenue}
                  onChange={handleRevenueFieldChange}
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Share %</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="share"
                  value={revenueForm.share}
                  onChange={handleRevenueFieldChange}
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                />
              </div>

              {actionError && (
                <div className="col-span-2 border border-red-dim bg-black px-4 py-3">
                  <div className="text-[9px] tracking-[0.18em] uppercase text-red font-mono">{actionError}</div>
                </div>
              )}

              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeRevenueModal}
                  className="border border-border px-5 py-3 text-[10px] tracking-[0.18em] uppercase text-muted font-mono hover:text-cream hover:border-red-dim transition-colors duration-200"
                >
                  Cancel
                </button>
                <PrimaryBtn disabled={saving}>{saving ? "Saving..." : "Add Revenue"}</PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPayoutModal && (
        <div className="fixed inset-0 z-[300] bg-[rgba(0,0,0,0.78)] backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-[520px] border border-border bg-surface p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <SectionLabel text="Add Payout" />
                <div className="font-bebas text-[36px] leading-[0.95] uppercase text-cream">Payout Record</div>
              </div>
              <button
                type="button"
                onClick={closePayoutModal}
                className="text-[10px] tracking-[0.18em] uppercase text-muted hover:text-cream transition-colors duration-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddPayout} className="space-y-4">
              <div>
                <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Cycle</label>
                <input
                  name="cycle"
                  required
                  value={payoutForm.cycle}
                  onChange={handlePayoutFieldChange}
                  placeholder="April 2026"
                  className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={payoutForm.date}
                    onChange={handlePayoutFieldChange}
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Status</label>
                  <select
                    name="status"
                    value={payoutForm.status}
                    onChange={handlePayoutFieldChange}
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.18em] uppercase text-muted font-mono mb-2">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="amount"
                    required
                    value={payoutForm.amount}
                    onChange={handlePayoutFieldChange}
                    className="w-full bg-black border border-border text-cream font-mono text-[11px] px-4 py-3 outline-none focus:border-red"
                  />
                </div>
              </div>

              {actionError && (
                <div className="border border-red-dim bg-black px-4 py-3">
                  <div className="text-[9px] tracking-[0.18em] uppercase text-red font-mono">{actionError}</div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePayoutModal}
                  className="border border-border px-5 py-3 text-[10px] tracking-[0.18em] uppercase text-muted font-mono hover:text-cream hover:border-red-dim transition-colors duration-200"
                >
                  Cancel
                </button>
                <PrimaryBtn disabled={saving}>{saving ? "Saving..." : "Add Payout"}</PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}

      <SectionLabel text="Financials" />
      <PageTitle>Revenue</PageTitle>

      <div className="grid grid-cols-4 gap-px bg-border mb-px">
        <StatCard label="Total Earned" value={loading ? "—" : `$${Number(data?.total ?? 0).toFixed(2)}`} delta={period} up />
        <StatCard label="Pending Payout" value={loading ? "—" : `$${Number(data?.pending ?? 0).toFixed(2)}`} delta={period} />
        <StatCard label="Paid Out" value={loading ? "—" : `$${Number(data?.paid ?? 0).toFixed(2)}`} delta={lastPaidPayout ? lastPaidPayout.cycle : `No ${period.toLowerCase()} payouts`} up />
        <StatCard label="Avg Per Track" value={loading ? "—" : `$${Number(data?.avgPerTrack ?? 0).toFixed(2)}`} />
      </div>

      <div className="bg-surface border-b border-border px-[22px] py-4 flex items-center gap-px bg-border mb-px">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`text-[9px] tracking-[0.2em] uppercase font-mono px-5 py-2 transition-colors duration-200 ${
              period === p ? "bg-red text-cream" : "bg-surface text-muted hover:text-cream hover:bg-surface2"
            }`}
          >
            {p}
          </button>
        ))}
        <div className="ml-auto flex gap-3">
          <PrimaryBtn onClick={() => setShowRevenueModal(true)}>Add Revenue</PrimaryBtn>
          <PrimaryBtn onClick={() => setShowPayoutModal(true)}>Add Payout</PrimaryBtn>
        </div>
      </div>

      {actionError && !showRevenueModal && !showPayoutModal && <ErrorBox message={actionError} />}

      <div className="grid grid-cols-2 gap-px bg-border mb-px">
        <Panel title="Platform Breakdown">
          {loading && <Skeleton />}
          {error && <ErrorBox message={error} />}
          {!loading && !error && breakdown.length === 0 && <EmptyState message={`No ${period.toLowerCase()} breakdown data`} />}
          {!loading && !error && breakdown.map((entry) => (
            <div key={entry.platform} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className="text-[10px] tracking-[0.15em] uppercase text-muted font-mono w-24">{entry.platform}</div>
              <div className="flex-1 h-1 bg-border relative">
                <div className="absolute top-0 left-0 h-full bg-red" style={{ width: `${entry.pct}%` }} />
              </div>
              <div className="font-bebas text-[18px] text-cream w-16 text-right">${entry.amount}</div>
              <div className="font-mono text-[10px] text-muted w-10 text-right">{entry.pct}%</div>
            </div>
          ))}
        </Panel>

        <Panel title="Payout History">
          {loading && <Skeleton />}
          {error && <ErrorBox message={error} />}
          {!loading && !error && payouts.length === 0 && <EmptyState message={`No ${period.toLowerCase()} payout history`} />}
          {!loading && !error && payouts.map((entry, index) => (
            <div key={`${entry.cycle}-${entry.date}-${index}`} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className="flex-1">
                <div className="font-anton text-[13px] uppercase text-cream tracking-[0.04em]">{entry.cycle}</div>
                <div className="text-[10px] text-muted mt-1 font-mono">{entry.date}</div>
              </div>
              <div className={`text-[9px] tracking-[0.15em] uppercase border font-mono px-[7px] py-[2px] ${entry.status === "paid" ? "border-red-dim text-red" : "border-border text-muted"}`}>
                {entry.status}
              </div>
              <div className="font-bebas text-[22px] text-cream">${entry.amount}</div>
              <button
                type="button"
                onClick={() => {
                  const originalIndex = allPayouts.findIndex((item) =>
                    item.cycle === entry.cycle &&
                    item.date === entry.date &&
                    item.amount === entry.amount &&
                    item.status === entry.status
                  );
                  if (originalIndex >= 0) handleDeletePayout(originalIndex);
                }}
                className="text-[9px] uppercase text-red border border-red px-2 py-1 hover:bg-red hover:text-black transition"
              >
                Delete
              </button>
            </div>
          ))}
        </Panel>
      </div>

      <div className="bg-surface">
        <div className="font-anton text-[15px] tracking-[0.05em] uppercase text-cream p-[22px] border-b border-border">
          Earnings by Track
        </div>
        <div className="grid px-[22px] py-2 border-b border-border" style={{ gridTemplateColumns: "1fr 120px 100px 100px 120px" }}>
          {["Track", "Artist", "Streams", "Revenue", "Share"].map((heading) => (
            <div key={heading} className="text-[9px] tracking-[0.2em] uppercase text-muted font-mono">{heading}</div>
          ))}
        </div>
        {loading && <div className="p-6"><Skeleton /></div>}
        {error && <ErrorBox message={error} />}
        {!loading && !error && earningsByTrack.length === 0 && <EmptyState message={`No ${period.toLowerCase()} earnings recorded`} />}
        {!loading && !error && earningsByTrack.map((entry, index) => (
          <div
            key={`${entry.title}-${entry.recordedAt}-${index}`}
            className="grid px-[22px] py-3 border-b border-border last:border-0 hover:bg-surface2 transition-colors duration-200 items-center"
            style={{ gridTemplateColumns: "1fr 120px 100px 100px 120px" }}
          >
            <div>
              <div className="font-anton text-[13px] uppercase text-cream truncate">{entry.title}</div>
              <div className="text-[9px] tracking-[0.15em] uppercase text-muted font-mono mt-1">{entry.platform} • {entry.recordedAt}</div>
            </div>
            <div className="text-[11px] text-muted font-mono truncate">{entry.artist}</div>
            <div className="font-bebas text-[16px] text-muted">{entry.streams}</div>
            <div className="font-bebas text-[18px] text-cream">${entry.revenue}</div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] text-red">{entry.share}%</span>
              <button
                type="button"
                onClick={() => {
                  const originalIndex = allEarningsByTrack.findIndex((item) =>
                    item.title === entry.title &&
                    item.artist === entry.artist &&
                    item.platform === entry.platform &&
                    item.recordedAt === entry.recordedAt &&
                    Number(item.revenue) === Number(entry.revenue)
                  );
                  if (originalIndex >= 0) handleDeleteRevenue(originalIndex);
                }}
                className="text-[9px] uppercase text-red border border-red px-2 py-1 hover:bg-red hover:text-black transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
