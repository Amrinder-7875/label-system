import { useState } from "react";
import Dashboard    from "./src/pages/Dashboard";
import Tracks       from "./src/pages/Tracks";
import Revenue      from "./src/pages/Revenue";
import Audience     from "./src/pages/Audience";
import Schedule     from "./src/pages/Schedule";
import Artists      from "./src/pages/Artists";
import Submissions  from "./src/pages/Submissions";
import Releases     from "./src/pages/Releases";

const NoiseOverlay = () => (
  <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9999] opacity-40" xmlns="http://www.w3.org/2000/svg">
    <filter id="shell-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#shell-noise)" />
  </svg>
);

const TOP_NAV = ["Dashboard", "Releases", "Artists", "Analytics"];

const SIDEBAR = {
  Overview: ["Dashboard", "Tracks", "Revenue", "Audience", "Schedule"],
  Label:    ["Artists", "Submissions"],
};

const PAGE_MAP = {
  Dashboard,
  Tracks,
  Revenue,
  Audience,
  Schedule,
  Artists,
  Submissions,
  Releases,
};

export default function Shell({ setIsAuth }) {
  const [page, setPage] = useState("Dashboard");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuth(false);
  };

  const ActivePage = PAGE_MAP[page] ?? Dashboard;

  return (
    <div className="bg-black text-cream font-mono cursor-crosshair min-h-screen relative"
      style={{ fontFamily: "'Space Mono', monospace" }}>
      <NoiseOverlay />

      {/* Topbar */}
      <div className="bg-offblack border-b border-border flex items-center justify-between px-8 h-[52px] relative z-10">
        <div className="font-bebas text-[22px] tracking-[0.08em]">
          X<span className="text-red">C</span>ILE
          <span className="text-border mx-1">|</span>
          <span className="text-[13px] text-muted tracking-[0.1em] font-mono">MEDIA</span>
        </div>
        <div className="flex items-center">
          {TOP_NAV.map((item) => (
            <button key={item} onClick={() => setPage(item)}
              className={`text-[10px] tracking-[0.2em] uppercase px-[18px] h-[52px] border-l border-border transition-all duration-200 font-mono
                ${page === item ? "text-red border-b-2 border-b-red" : "text-muted hover:text-cream hover:bg-surface"}`}>
              {item}
            </button>
          ))}
          <button onClick={handleLogout}
            className="ml-3 text-[10px] tracking-[0.2em] uppercase px-[18px] h-[52px] border border-red text-red hover:bg-red hover:text-cream transition-all duration-200 font-mono">
            Logout →
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid min-h-[calc(100vh-52px)]" style={{ gridTemplateColumns: "200px 1fr" }}>

        {/* Sidebar */}
        <div className="bg-offblack border-r border-border pt-7 relative">
          {Object.entries(SIDEBAR).map(([group, items]) => (
            <div key={group}>
              <div className="flex items-center gap-2 text-[9px] tracking-[0.3em] uppercase text-red px-5 mb-2 mt-4 font-mono">
                <span className="block w-4 h-px bg-red" />{group}
              </div>
              <nav>
                {items.map((label) => (
                  <button key={label} onClick={() => setPage(label)}
                    className={`w-full text-left flex items-center text-[11px] tracking-[0.12em] uppercase px-5 py-[11px] border-l-2 transition-all duration-200
                      ${page === label
                        ? "text-red border-red bg-surface"
                        : "text-muted border-transparent hover:text-cream hover:bg-surface hover:border-border"}`}>
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          ))}

          {/* User strip */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border px-5 py-3 bg-offblack">
            <div className="text-[9px] tracking-[0.15em] uppercase text-muted font-mono">Signed in as</div>
            <div className="font-anton text-[13px] tracking-[0.05em] uppercase text-cream mt-1 truncate">
              {user?.name || user?.email || "Admin"}
            </div>
          </div>
        </div>

        {/* Page */}
        <div className="bg-black overflow-y-auto">
          <ActivePage />
        </div>
      </div>
    </div>
  );
}