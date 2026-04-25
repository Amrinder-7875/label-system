import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  buildStatusOverride,
  persistStatusOverrides,
  readStatusOverrides,
} from "../utils/submissionStatusOverrides";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "https://label-system-d8af.onrender.com";

const SubmissionsContext = createContext(null);

const mergeSubmissionStatuses = (submissions) => {
  const overrides = readStatusOverrides();

  return submissions.map((submission) => {
    const override = overrides[submission.id];
    return override ? { ...submission, ...override } : submission;
  });
};

const readApiResponse = async (res) => {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return { data: await res.json(), isJson: true, text: "" };
  }

  const text = await res.text();
  return { data: null, isJson: false, text };
};

const parseApiResponse = async (res) => {
  const payload = await readApiResponse(res);

  if (payload.isJson) {
    return payload.data;
  }

  throw new Error(payload.text.startsWith("<!DOCTYPE") ? "Backend route not available. Restart the backend server." : payload.text);
};

const isMissingRouteResponse = (res, payload) =>
  !res.ok &&
  !payload.isJson &&
  (res.status === 404 || payload.text.startsWith("<!DOCTYPE"));

export function SubmissionsProvider({ children }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubmissions = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setSubmissions([]);
      setLoading(false);
      setError("Not authenticated.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await parseApiResponse(res);

      if (!res.ok) {
        throw new Error(json.message || "Could not fetch submissions.");
      }

      setSubmissions(mergeSubmissionStatuses(json.submissions ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubmissionStatus = useCallback(async (submissionId, status) => {
    const token = localStorage.getItem("token");
    const fallbackSubmission = buildStatusOverride({
      status,
      updatedAt: new Date().toISOString(),
    });

    if (!token) {
      const nextOverrides = {
        ...readStatusOverrides(),
        [submissionId]: fallbackSubmission,
      };

      persistStatusOverrides(nextOverrides);
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === submissionId
            ? { ...submission, ...fallbackSubmission }
            : submission
        )
      );
      return fallbackSubmission;
    }

    const requestConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    };
    const endpoints = [
      `${API_BASE_URL}/api/submissions/${submissionId}/status`,
      `${API_BASE_URL}/api/submission/${submissionId}/status`,
    ];
    const methods = ["POST", "PATCH"];
    let res = null;
    let payload = null;

    for (const endpoint of endpoints) {
      for (const method of methods) {
        res = await fetch(endpoint, { ...requestConfig, method });
        payload = await readApiResponse(res);

        if (!isMissingRouteResponse(res, payload)) {
          break;
        }
      }

      if (!isMissingRouteResponse(res, payload)) {
        break;
      }
    }

    if (!payload.isJson) {
      const nextOverrides = {
        ...readStatusOverrides(),
        [submissionId]: fallbackSubmission,
      };

      persistStatusOverrides(nextOverrides);
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === submissionId
            ? { ...submission, ...fallbackSubmission }
            : submission
        )
      );

      return fallbackSubmission;
    }

    const json = payload.data;

    if (!res.ok) {
      throw new Error(json.message || "Could not update status.");
    }

    const nextOverrides = {
      ...readStatusOverrides(),
      [submissionId]: {
        ...buildStatusOverride(json.submission),
        status: json.submission.status,
        updatedAt: json.submission.updatedAt,
      },
    };

    persistStatusOverrides(nextOverrides);

    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId
          ? { ...submission, ...json.submission }
          : submission
      )
    );

    return json.submission;
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const value = useMemo(
    () => ({
      submissions,
      loading,
      error,
      refreshSubmissions: fetchSubmissions,
      updateSubmissionStatus,
    }),
    [submissions, loading, error, fetchSubmissions, updateSubmissionStatus]
  );

  return <SubmissionsContext.Provider value={value}>{children}</SubmissionsContext.Provider>;
}

export function useSubmissions() {
  const context = useContext(SubmissionsContext);

  if (!context) {
    throw new Error("useSubmissions must be used within a SubmissionsProvider");
  }

  return context;
}
