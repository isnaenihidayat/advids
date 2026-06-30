"use client";

import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";

type Video = {
  id: string;
  prompt: string;
  status: string;
  videoUrl?: string;
  resolution: string;
  ratio: string;
  duration: string;
  createdAt: string;
};

export default function LibraryPage() {
  const api = useApi();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    api
      .getVideos("status=completed")
      .then((data) => setVideos(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Library</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
          <p className="text-gray-400">No completed videos yet.</p>
          <p className="text-sm text-gray-600 mt-1">Create and complete a video to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedVideo?.id === video.id
                      ? "border-blue-500 ring-2 ring-blue-500/50"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      className="w-full aspect-video bg-gray-900 object-cover"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">No preview</p>
                    </div>
                  )}
                  <div className="p-3 bg-gray-900">
                    <p className="text-sm font-medium truncate">{video.prompt}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video player & details */}
          {selectedVideo && (
            <div className="lg:col-span-1">
              <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden sticky top-8">
                {selectedVideo.videoUrl ? (
                  <video
                    src={selectedVideo.videoUrl}
                    controls
                    className="w-full aspect-video bg-black"
                    autoPlay
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                    <p className="text-gray-500">No video available</p>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Prompt</p>
                    <p className="text-sm mt-1">{selectedVideo.prompt}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Resolution</p>
                      <p className="text-white">{selectedVideo.resolution}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Ratio</p>
                      <p className="text-white">{selectedVideo.ratio}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white">{selectedVideo.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Created</p>
                      <p className="text-white">{new Date(selectedVideo.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedVideo.videoUrl && (
                    <a
                      href={selectedVideo.videoUrl}
                      download
                      className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium text-center transition-colors"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}