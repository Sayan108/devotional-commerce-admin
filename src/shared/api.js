import { useEffect, useState } from "react";
import { env } from "../env.ts";

export async function request(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(env.apiUrl + path, {
    method, signal, credentials: "include",
    ...(body && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "The request failed.");
  return result;
}

export async function uploadMedia(file) {
  const response = await fetch(env.apiUrl + "/admin/media", {
    method: "POST", credentials: "include", headers: { "Content-Type": file.type }, body: file
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Image upload failed.");
  return result.url;
}

export function useApi(path) {
  const [state, setState] = useState({});
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    request(path, { signal: controller.signal }).then(data => setState({ path, data }))
      .catch(error => { if (error.name !== "AbortError") setState({ path, error }); });
    return () => controller.abort();
  }, [path, version]);
  return { ...(state.path === path && state), reload: () => setVersion(value => value + 1) };
}

export const money = paise => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2
}).format(paise / 100);
export const dateTime = time => new Date(time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
