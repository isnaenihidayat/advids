"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const token = (session as any).backendToken;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setVideos(data.videos ?? data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Advids Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="text-sm px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Stats */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Videos" value={videos.length} />
          <StatCard
            label="Completed"
            value={videos.filter((v) => v.status === "completed").length}
          />
          <StatCard
            label="Pending"
            value={videos.filter((v) => v.status === "pending").length}
          />
        </div>

        {/* Videos list */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Videos</h2>

          {loading ? (
            <p className="text-gray-400">Loading videos...</p>
          ) : videos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
              <p className="text-gray-400">No videos yet.</p>
              <p className="text-sm text-gray-600 mt-1">Create your first video to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-800"
                >
                  <div>
                    <p className="font-medium truncate max-w-lg">{v.prompt}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {v.resolution} · {v.ratio} · {v.duration}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      v.status === "completed"
                        ? "bg-green-900 text-green-300"
                        : v.status === "failed"
                        ? "bg-red-900 text-red-300"
                        : v.status === "generating"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
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