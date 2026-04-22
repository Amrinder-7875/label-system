import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Dashboard from "../pages/dashboard";
import Revenue from "../pages/revenue";
import Schedule from "../pages/scheddule";
import Artists from "../pages/artist";
import Submissions from "../pages/submission";
import Releases from "../pages/realeases";
import { SubmissionsProvider } from "../context/submissions";

const NoiseOverlay = () => (
  <svg
    className="fixed inset-0 h-full w-full pointer-events-none z-[9999] opacity-40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <filter id="dash-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#dash-noise)" opacity={0.3} />
  </svg>
);

const TOP_NAV = ["Dashboard", "Releases", "Artists", "Audience"];

const SIDEBAR = {
  Overview: ["Dashboard", "Revenue", "Schedule"],
  Label: ["Artists", "Submissions"],
};

const PAGE_MAP = {
  Dashboard,

  Revenue,

  Schedule,
  Artists,
  Submissions,
  Releases,
};

const ROUTE_MAP = {
  dashboard: "Dashboard",

  revenue: "Revenue",

  schedule: "Schedule",
  artists: "Artists",
  submissions: "Submissions",
  releases: "Releases",
};

const LABEL_TO_ROUTE = {
  Dashboard: "dashboard",

  Revenue: "revenue",

  Schedule: "schedule",
  Artists: "artists",
  Submissions: "submissions",
  Releases: "releases",
};

export default function AdminDashboard({ setIsAuth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const routeSegment = location.pathname.split("/")[2] || "dashboard";
  const page = useMemo(() => ROUTE_MAP[routeSegment] ?? "Dashboard", [routeSegment]);

  const ActivePage = PAGE_MAP[page] ?? Dashboard;

  const goToPage = (label) => {
    navigate(`/admin/${LABEL_TO_ROUTE[label] ?? "dashboard"}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof setIsAuth === "function") {
      setIsAuth(false);
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      className="bg-black text-cream font-mono cursor-crosshair min-h-screen relative"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <NoiseOverlay />

      <div className="bg-offblack border-b border-border flex items-center justify-between px-8 h-[52px] relative z-10">
        <div className="font-bebas text-[22px] tracking-[0.08em]">
          X<span className="text-red">C</span>ILE{" "}
          <span className="text-border mx-1">|</span>{" "}
          <span className="text-[13px] text-muted tracking-[0.1em] font-mono">MEDIA</span>
        </div>

        <div className="flex items-center">
          {TOP_NAV.map((item) => (
            <button
              key={item}
              onClick={() => goToPage(item)}
              className={`text-[10px] tracking-[0.2em] uppercase px-[18px] h-[52px] border-l border-border transition-all duration-200 font-mono
                ${page === item
                  ? "text-red border-b-2 border-b-red"
                  : "text-muted hover:text-cream hover:bg-surface"}`}
            >
              {item}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="ml-3 text-[10px] tracking-[0.2em] uppercase px-[18px] h-[52px] border border-red text-red hover:bg-red hover:text-cream transition-all duration-200 font-mono"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-52px)]" style={{ gridTemplateColumns: "200px 1fr" }}>
        <div className="bg-offblack border-r border-border pt-7 relative">
          {Object.entries(SIDEBAR).map(([group, items]) => (
            <div key={group}>
              <div className="flex items-center gap-2 text-[9px] tracking-[0.3em] uppercase text-red px-5 mb-2 mt-4 font-mono">
                <span className="block w-4 h-px bg-red" />
                {group}
              </div>

              <nav>
                {items.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => goToPage(label)}
                    className={`w-full text-left flex items-center text-[11px] tracking-[0.12em] uppercase px-5 py-[11px] border-l-2 transition-all duration-200
                      ${page === label
                        ? "text-red border-red bg-surface"
                        : "text-muted border-transparent hover:text-cream hover:bg-surface hover:border-border"}`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          ))}

          <div className="absolute bottom-0 left-0 right-0 border-t border-border px-5 py-3 bg-offblack">
            <div className="text-[9px] tracking-[0.15em] uppercase text-muted font-mono">Signed in as</div>
            <div className="font-anton text-[13px] tracking-[0.05em] uppercase text-cream mt-1 truncate">
              {user?.name || user?.email || "Admin"}
            </div>
          </div>
        </div>

        <div className="bg-black overflow-y-auto">
          <SubmissionsProvider>
            <ActivePage />
          </SubmissionsProvider>
        </div>
      </div>
    </div>
  );
}
