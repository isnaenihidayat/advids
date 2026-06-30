import { useSession } from "next-auth/react";

export function useApi() {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const request = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const headers = {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || `API error: ${res.status}`);
    }

    return res.json();
  };

  return {
    // Generic request for custom endpoints
    request,

    // Videos
    getVideos: (query?: string) =>
      request(`/api/videos${query ? `?${query}` : ""}`),
    createVideo: (data: any) =>
      request("/api/videos", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    getVideo: (id: string) => request(`/api/videos/${id}`),
    updateVideo: (id: string, data: any) =>
      request(`/api/videos/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    deleteVideo: (id: string) =>
      request(`/api/videos/${id}`, { method: "DELETE" }),

    // Assets
    getAssets: (type?: string) =>
      request(`/api/assets${type ? `?type=${type}` : ""}`),
    uploadAsset: (file: File, type?: string) => {
      const form = new FormData();
      form.append("file", file);
      if (type) form.append("type", type);
      return request("/api/assets/upload", { method: "POST", body: form });
    },
    deleteAsset: (id: string) =>
      request(`/api/assets/${id}`, { method: "DELETE" }),

    // Queue
    getQueue: (status?: string) =>
      request(`/api/queue${status ? `?status=${status}` : ""}`),
    createQueueItem: (data: any) =>
      request("/api/queue", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    updateQueueItem: (id: string, data: any) =>
      request(`/api/queue/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    deleteQueueItem: (id: string) =>
      request(`/api/queue/${id}`, { method: "DELETE" }),

    // Settings
    getSettings: () => request("/api/settings"),
    updateSettings: (data: any) =>
      request("/api/settings", { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  };
}