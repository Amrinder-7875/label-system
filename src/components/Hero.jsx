import { usePublicApi } from "../hooks/usePublicApi";

export default function Hero() {
  const { data: artistData } = usePublicApi("/api/artists");
  const { data: releaseData } = usePublicApi("/api/releases");

  const artistCount = artistData?.artists?.length ?? 0;
  const releaseCount = releaseData?.releases?.length ?? 0;
  const trackStreams = Number(artistData?.combinedStreams ?? 0);
  const releaseStreams = Number(releaseData?.totalStreams ?? 0);
  const combinedStreams = trackStreams + releaseStreams;
  const latestRelease = releaseData?.releases?.[0]?.title ?? "No release yet";

  return (
    <section className="relative min-h-screen grid md:grid-cols-2 items-center px-6 md:px-12 pt-[120px] pb-20 border-b border-[#2a2a2a] overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '-120px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230,51,41,0.08) 0%, transparent 70%)',
        }}
      />

      {/* LEFT */}
      <div className="hero-left">
        <div
          className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#e63329] mb-6"
          style={{ animation: 'fadeUp 0.6s ease 0.1s both' }}
        >
          <span className="block w-8 h-px bg-[#e63329]" />
          Independent Music Label
        </div>

        <h1
          className="leading-[0.9] tracking-[0.02em] text-[#f0ede8] mb-3"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(72px, 9vw, 130px)',
            animation: 'fadeUp 0.6s ease 0.2s both',
          }}
        >
          DISCOVER
          <br />
          THE <span className="text-[#e63329]">SOUND</span>
          <br />
          OF TMR
        </h1>

        <p
          className="text-[12px] tracking-[0.15em] text-[#666] uppercase mb-12 max-w-[360px]"
          style={{ animation: 'fadeUp 0.6s ease 0.3s both' }}
        >
          Raw. Underground. Uncompromising. We back artists who push funk and phonk beyond its limits.
        </p>

        <div
          className="flex gap-5 items-center"
          style={{ animation: 'fadeUp 0.6s ease 0.4s both' }}
        >
          <a
            href="#contact"
            className="text-[12px] tracking-[0.15em] uppercase px-9 py-[14px] bg-[#e63329] text-[#f0ede8] hover:opacity-85 transition-opacity duration-200"
          >
            Submit Your Demo
          </a>
          <a
            href="#artists"
            className="text-[12px] tracking-[0.1em] uppercase text-[#666] hover:text-[#f0ede8] transition-colors duration-200 flex items-center gap-2 after:content-['→']"
          >
            Our Artists
          </a>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex items-center justify-end pl-12">
        <div
          className="grid grid-cols-2 w-full max-w-[420px]"
          style={{
            gap: "1px",
            background: "#2a2a2a",
            border: "1px solid #2a2a2a",
          }}
        >
          {[
            { label: "Artists", value: artistCount, accent: "+" },
            { label: "Releases", value: releaseCount, accent: "+" },
            { label: "Streams", value: combinedStreams.toLocaleString(), accent: "" },
            { label: "Latest", value: latestRelease, accent: "" },
          ].map((item) => (
            <div key={item.label} className="bg-[#0e0e0e] px-6 py-7 min-h-[140px] flex flex-col justify-between">
              <div
                className="text-[42px] leading-none text-[#f0ede8] break-words"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {item.value}
                <span className="text-[#e63329]">{item.accent}</span>
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#666] mt-3">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
