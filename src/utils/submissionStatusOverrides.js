const STATUS_OVERRIDES_KEY = "submissionStatusOverrides";

export const readStatusOverrides = () => {
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const persistStatusOverrides = (overrides) => {
  localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
};

export const buildStatusOverride = (submission) => ({
  status: submission.status,
  updatedAt: submission.updatedAt ?? new Date().toISOString(),
  trackingId: submission.trackingId ?? "",
});

export const applyStatusOverride = (submission) => {
  if (!submission) {
    return submission;
  }

  const overrides = readStatusOverrides();
  const entries = Object.entries(overrides);
  const match = entries.find(([, override]) =>
    override.trackingId && submission.trackingId && override.trackingId === submission.trackingId
  );

  if (match) {
    return { ...submission, ...match[1] };
  }

  return submission;
};
