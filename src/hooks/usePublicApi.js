import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://label-system-d8af.onrender.com/api";

export function usePublicApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Request failed.");
        }

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { data, loading, error };
}
