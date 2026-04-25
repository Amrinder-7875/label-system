import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Add to your index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

const NoiseOverlay = () => (
  <svg
    className="fixed inset-0 w-full h-full pointer-events-none z-[9999] opacity-50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <filter id="xcile-noise">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.65"
        numOctaves="3"
        stitchTiles="stitch"
      />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#xcile-noise)" opacity="0.2" />
  </svg>
);

const SectionLabel = ({ text }) => (
  <div className="flex items-center gap-3 text-[10px] tracking-label uppercase text-red font-mono">
    <span className="block w-6 h-px bg-red flex-shrink-0" />
    {text}
  </div>
);

const CornerAccents = () => (
  <>
    <span className="absolute top-[-1px] right-[-1px] w-8 h-8 border-t-2 border-r-2 border-red pointer-events-none" />
    <span className="absolute bottom-[-1px] left-[-1px] w-8 h-8 border-b-2 border-l-2 border-red pointer-events-none" />
  </>
);

const AUTH_BASE_URL = "https://label-system-d8af.onrender.com/api/auth";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const ACCESS_MODES = {
  member: "member",
  artist: "artist",
};

const Login = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [accessMode, setAccessMode] = useState(ACCESS_MODES.member);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const isArtistMode = accessMode === ACCESS_MODES.artist;
  const showCreateFlow = isArtistMode && isCreateMode;
  const localAuthPath = showCreateFlow
    ? "/artist/signup"
    : isArtistMode
      ? "/artist/login"
      : "/login";

  const completeLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (typeof setIsAuth === "function") {
      setIsAuth(true);
    }

    if (data.user?.role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    navigate("/");
    window.setTimeout(() => {
      window.location.hash = "contact";
    }, 0);
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) {
      return undefined;
    }

    let isMounted = true;
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

    const renderGoogleButton = () => {
      if (!isMounted || !window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setError("");
          setSuccess("");
          setLoading(true);

          try {
            const res = await fetch(`${AUTH_BASE_URL}/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                credential: response.credential,
                role: isArtistMode ? "artist" : undefined,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              setError(data.message || "Google authentication failed.");
              return;
            }

            completeLogin(data);
          } catch {
            setError("Cannot reach server. Try again.");
          } finally {
            setLoading(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: 356,
      });
    };

    if (existingScript) {
      if (window.google?.accounts?.id) {
        renderGoogleButton();
      } else {
        existingScript.addEventListener("load", renderGoogleButton, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderGoogleButton, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
    };
  }, [isArtistMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (showCreateFlow && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (showCreateFlow) {
        const registerRes = await fetch(`${AUTH_BASE_URL}${localAuthPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          setError(registerData.message || "Could not create account.");
          return;
        }

        completeLogin(registerData);
        return;
      }

      const res = await fetch(`${AUTH_BASE_URL}${localAuthPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        completeLogin(data);
      } else {
        setError(data.message || "Authentication failed.");
      }
    } catch {
      setError("Cannot reach server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-black flex items-center justify-center px-6 cursor-crosshair overflow-hidden"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <NoiseOverlay />

      {/* Red atmosphere glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(230,51,41,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Login panel */}
      <div className="relative w-full max-w-[420px] bg-surface border border-border animate-fadeUp">
        <CornerAccents />

        {/* Header */}
        <div className="border-b border-border px-8 pt-7 pb-6">
          <SectionLabel text="Access" />
          <h1
            className="font-bebas text-cream uppercase leading-[0.95] mt-4"
            style={{ fontSize: "clamp(44px, 10vw, 58px)" }}
          >
            {isCreateMode ? "Create" : "Sign"}
            <br />
            {showCreateFlow ? "Account" : isArtistMode ? "Demo Access" : "In"}
          </h1>
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-sm border border-border bg-black p-1">
            <button
              type="button"
              onClick={() => {
                setAccessMode(ACCESS_MODES.member);
                setIsCreateMode(false);
                setError("");
                setSuccess("");
                setPassword("");
                setConfirmPassword("");
              }}
              className={`px-3 py-2 text-[10px] tracking-[0.18em] uppercase transition-colors duration-200 ${
                !isArtistMode ? "bg-red text-cream" : "text-muted hover:text-cream"
              }`}
            >
              Members Only
            </button>
            <button
              type="button"
              onClick={() => {
                setAccessMode(ACCESS_MODES.artist);
                setError("");
                setSuccess("");
                setPassword("");
                setConfirmPassword("");
              }}
              className={`px-3 py-2 text-[10px] tracking-[0.18em] uppercase transition-colors duration-200 ${
                isArtistMode ? "bg-red text-cream" : "text-muted hover:text-cream"
              }`}
            >
               Artists
            </button>
          </div>
          <p className="mt-4 text-[10px] tracking-[0.12em] uppercase text-muted font-mono leading-5">
            {isArtistMode
              ? "Submit your music for consideration after creating and artist account."
              : "Use your existing member credentials to continue."}
          </p>
        </div>

        {/* Body */}
        <form className="px-8 py-8" onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <div className="mb-5 border border-red-dim bg-black px-4 py-3">
              <p className="text-[11px] tracking-ui uppercase text-red font-mono">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mb-5 border border-border bg-black px-4 py-3">
              <p className="text-[11px] tracking-ui uppercase text-cream font-mono">
                {success}
              </p>
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[10px] tracking-ui uppercase text-muted font-mono mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@xcile.media"
              className="w-full bg-surface border border-border text-cream font-mono text-[13px] px-[14px] py-3 outline-none transition-colors duration-200 placeholder-border focus:border-red"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className={showCreateFlow ? "mb-5" : "mb-3"}>
            <label className="block text-[10px] tracking-ui uppercase text-muted font-mono mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface border border-border text-cream font-mono text-[13px] px-[14px] py-3 outline-none transition-colors duration-200 placeholder-border focus:border-red"
              autoComplete={showCreateFlow ? "new-password" : "current-password"}
            />
          </div>

          {showCreateFlow && (
            <div className="mb-5">
              <label className="block text-[10px] tracking-ui uppercase text-muted font-mono mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-border text-cream font-mono text-[13px] px-[14px] py-3 outline-none transition-colors duration-200 placeholder-border focus:border-red"
                autoComplete="new-password"
              />
            </div>
          )}

          {!showCreateFlow && (
            <div className="flex justify-end mb-7">
              <button
                type="button"
                className="text-[10px] tracking-ui uppercase text-muted font-mono transition-colors duration-200 hover:text-cream after:content-['_→'] hover:after:content-['_→']"
              >
                Forgot password
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red text-cream font-mono text-[12px] tracking-ui uppercase font-bold py-4 transition-opacity duration-200 hover:opacity-85 active:opacity-70 disabled:opacity-50 mb-6"
          >
            {loading
              ? showCreateFlow
                ? "Creating..."
                : "Authenticating..."
              : showCreateFlow
                ? "Create Artist Login →"
                : isArtistMode
                  ? "Artist Login →"
                  : "Member Login →"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <span className="flex-1 h-px bg-border" />
            <span className="text-[10px] tracking-ui uppercase text-muted font-mono">or</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          {GOOGLE_CLIENT_ID ? (
            <div className="flex justify-center">
              <div ref={googleButtonRef} />
            </div>
          ) : (
            <div className="border border-border bg-black px-4 py-3 text-center">
              <p className="text-[10px] tracking-ui uppercase text-muted font-mono">
                Set `VITE_GOOGLE_CLIENT_ID` to enable Google sign-in
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-border px-8 py-[18px] flex items-center justify-between">
          <p className="text-[11px] text-muted font-mono">
            {isArtistMode
              ? showCreateFlow
                ? "Already registered as an artist?"
                : "Need a new artist login?"
              : "New here as an artist?"}
          </p>
          <button
            type="button"
            onClick={() => {
              if (!isArtistMode) {
                setAccessMode(ACCESS_MODES.artist);
                setIsCreateMode(true);
              } else {
                setIsCreateMode((current) => !current);
              }
              setError("");
              setSuccess("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-[10px] tracking-ui uppercase text-red font-mono transition-opacity duration-200 hover:opacity-70"
          >
            {isArtistMode
              ? showCreateFlow
                ? "Back to artist login →"
                : "Create artist login →"
              : "Switch to new artist →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
