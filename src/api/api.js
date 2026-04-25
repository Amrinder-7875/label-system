const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

export const apiFetch = async (endpoint) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message);
  return data;
};