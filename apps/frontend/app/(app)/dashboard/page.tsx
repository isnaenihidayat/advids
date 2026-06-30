"use client";

import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const api = useApi();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getVideos()
      .then((data) => setVideos(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Videos" value={videos.length} />
        <StatCard label="Completed" value={videos.filter((v) => v.status === "completed").length} />
        <StatCard label="Pending" value={videos.filter((v) => v.status === "pending").length} />
      </div>

      {/* Recent Videos */}
      <h3 className="text-lg font-semibold mb-4">Recent Videos</h3>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
          <p className="text-gray-400">No videos yet.</p>
          <p className="text-sm text-gray-600 mt-1">Create your first video to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-800">
              <div>
                <p className="font-medium truncate max-w-lg">{v.prompt}</p>
                <p className="text-sm text-gray-500 mt-0.5">{v.resolution} · {v.ratio} · {v.duration}</p>
              </div>
              <StatusBadge status={v.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "bg-green-900 text-green-300",
    failed: "bg-red-900 text-red-300",
    generating: "bg-yellow-900 text-yellow-300",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || "bg-gray-800 text-gray-400"}`}>
      {status}
    </span>
  );
}