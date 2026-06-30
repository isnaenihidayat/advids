"use client";

import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";

type QueueItem = {
  id: string;
  prompt?: string;
  status: string;
  createdAt?: string;
  progress?: number;
};

export default function QueuePage() {
  const api = useApi();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getQueue()
      .then((data: QueueItem[]) => setItems(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // ponytail: keep one fetch on mount for Phase 3; upgrade to polling/websocket when real workers land.

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Queue</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
          <p className="text-gray-400">Queue is empty.</p>
          <p className="text-sm text-gray-600 mt-1">New video jobs will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-gray-900 border border-gray-800 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{item.prompt || "Untitled job"}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "Unknown time"}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              {typeof item.progress === "number" && (
                <div className="mt-4">
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.progress}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "bg-green-900 text-green-300",
    failed: "bg-red-900 text-red-300",
    generating: "bg-yellow-900 text-yellow-300",
    pending: "bg-gray-800 text-gray-300",
    queued: "bg-blue-900 text-blue-300",
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${
        colors[status] || "bg-gray-800 text-gray-400"
      }`}
    >
      {status}
    </span>
  );
}