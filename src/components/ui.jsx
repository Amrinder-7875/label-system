export const SectionLabel = ({ text }) => (
  <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-red font-mono mb-3">
    <span className="block w-6 h-px bg-red flex-shrink-0" />
    {text}
  </div>
);

export const PageTitle = ({ children }) => (
  <h1 className="font-bebas text-[42px] leading-[0.95] uppercase text-cream mb-8">{children}</h1>
);

export const StatCard = ({ label, value, delta, up }) => (
  <div className="group bg-surface hover:bg-surface2 p-5 relative overflow-hidden transition-colors duration-200">
    <div className="text-[9px] tracking-[0.25em] uppercase text-muted font-mono mb-2">{label}</div>
    <div className="font-bebas text-[38px] text-cream leading-none">{value ?? "—"}</div>
    {delta && (
      <div className={`text-[10px] tracking-[0.1em] mt-1 font-mono ${up ? "text-red" : "text-muted"}`}>{delta}</div>
    )}
    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-red scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
  </div>
);

export const Tag = ({ children }) => (
  <span className="text-[9px] tracking-[0.15em] uppercase border border-red-dim text-red px-[7px] py-[2px] font-mono flex-shrink-0">
    {children}
  </span>
);

export const Panel = ({ title, children }) => (
  <div className="bg-surface p-[22px]">
    {title && <div className="font-anton text-[15px] tracking-[0.05em] uppercase text-cream mb-4">{title}</div>}
    {children}
  </div>
);

export const ErrorBox = ({ message }) => (
  <div className="border border-red-dim bg-black px-4 py-3 m-6">
    <div className="text-[9px] tracking-[0.2em] uppercase text-red font-mono mb-1">API Error</div>
    <div className="text-[11px] text-[#888] font-mono leading-[1.7]">{message}</div>
  </div>
);

export const EmptyState = ({ message = "No data returned" }) => (
  <div className="border border-border px-4 py-8 text-center">
    <div className="text-[10px] tracking-[0.2em] uppercase text-muted font-mono">{message}</div>
  </div>
);

export const Skeleton = ({ rows = 4 }) => (
  <div className="animate-pulse space-y-px">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="bg-surface h-[52px] w-full" style={{ opacity: 1 - i * 0.18 }} />
    ))}
  </div>
);

export const PrimaryBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    className="bg-red text-cream font-mono text-[11px] tracking-[0.2em] uppercase font-bold px-9 py-[14px] transition-opacity duration-200 hover:opacity-85 active:opacity-70 disabled:opacity-40">
    {children}
  </button>
);

export const GhostBtn = ({ children, onClick }) => (
  <button onClick={onClick}
    className="text-muted hover:text-cream font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-200 after:content-['_→']">
    {children}
  </button>
);

// Generic API hook
export const useApi = (endpoint, refreshKey) => {
  const [data, setData]     = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated.");
        const res = await fetch(`http://localhost:8000${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Request failed.");
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint, refreshKey]);

  return { data, loading, error };
};

import React from "react";
