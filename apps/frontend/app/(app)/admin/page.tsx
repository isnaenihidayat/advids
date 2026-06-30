"use client";

import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";

type AdminStats = {
  users: number;
  videos: number;
  assets: number;
  queueItems: number;
  completedVideos: number;
  failedVideos: number;
  pendingVideos: number;
};

type AdminUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count?: {
    videos?: number;
    assets?: number;
    queueItems?: number;
  };
};

export default function AdminPage() {
  const api = useApi();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await api.request("/api/admin/stats");
        setStats(s);
        const u = await api.request("/api/admin/users");
        setUsers(Array.isArray(u) ? u : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setRole = async (id: string, role: "USER" | "ADMIN") => {
    try {
      await api.request(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Admin</h2>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
            <div className="text-xs text-gray-500">Users</div>
            <div className="text-xl font-semibold">{stats.users}</div>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
            <div className="text-xs text-gray-500">Videos</div>
            <div className="text-xl font-semibold">{stats.videos}</div>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
            <div className="text-xs text-gray-500">Assets</div>
            <div className="text-xl font-semibold">{stats.assets}</div>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
            <div className="text-xs text-gray-500">Queue Items</div>
            <div className="text-xl font-semibold">{stats.queueItems}</div>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
            <div className="text-xs text-gray-500">Completed</div>
            <div className="text-xl font-semibold">{stats.completedVideos}</div>
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
            <div className="text-xs text-gray-500">Failed / Pending</div>
            <div className="text-xl font-semibold">
              {stats.failedVideos} / {stats.pendingVideos}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300">Users</h3>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-950 text-gray-400">
              <tr>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Videos</th>
                <th className="text-left p-3 font-medium">Assets</th>
                <th className="text-left p-3 font-medium">Queue</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-800">
                  <td className="p-3 text-gray-200">{u.email}</td>
                  <td className="p-3 text-gray-200">{u.role}</td>
                  <td className="p-3 text-gray-300">{u._count?.videos ?? 0}</td>
                  <td className="p-3 text-gray-300">{u._count?.assets ?? 0}</td>
                  <td className="p-3 text-gray-300">{u._count?.queueItems ?? 0}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRole(u.id, "USER")}
                        disabled={u.role === "USER"}
                        className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-200 text-xs font-medium transition-colors"
                      >
                        Make USER
                      </button>
                      <button
                        onClick={() => setRole(u.id, "ADMIN")}
                        disabled={u.role === "ADMIN"}
                        className="px-3 py-1 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 disabled:opacity-50 text-blue-200 text-xs font-medium transition-colors"
                      >
                        Make ADMIN
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}