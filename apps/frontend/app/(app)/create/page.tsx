"use client";

import { useApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const RESOLUTIONS = ["360p", "540p", "720p", "1080p"];
const RATIOS = ["16:9", "9:16", "1:1", "4:3"];
const DURATIONS = ["5s", "10s", "15s", "30s"];

type Asset = {
  id: string;
  filename: string;
  type: "product" | "model" | "background";
  url: string;
};

export default function CreatePage() {
  const api = useApi();
  const router = useRouter();
  const [form, setForm] = useState({
    prompt: "",
    resolution: "720p",
    ratio: "16:9",
    duration: "10s",
    style: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  useEffect(() => {
    api.getAssets().then((data) => setAssets(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prompt.trim()) return setError("Prompt is required");
    setError("");
    setSubmitting(true);
    try {
      await api.createVideo({ ...form, assetIds: selectedAssets });
      router.push("/queue");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Create Video</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Prompt *</label>
          <textarea
            value={form.prompt}
            onChange={set("prompt")}
            rows={4}
            placeholder="Describe the video you want to create…"
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Style</label>
          <input
            value={form.style}
            onChange={set("style")}
            placeholder="e.g. cinematic, animated, realistic"
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Resolution</label>
            <select value={form.resolution} onChange={set("resolution")} className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              {RESOLUTIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ratio</label>
            <select value={form.ratio} onChange={set("ratio")} className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              {RATIOS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
            <select value={form.duration} onChange={set("duration")} className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              {DURATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {assets.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Assets (Optional)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => toggleAsset(asset.id)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedAssets.includes(asset.id)
                      ? "border-blue-500 bg-blue-900/20"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="aspect-video bg-gray-800 rounded mb-1 flex items-center justify-center overflow-hidden text-xs">
                    {asset.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500">Video</span>
                    )}
                  </div>
                  <p className="text-xs truncate">{asset.filename}</p>
                  <p className="text-xs text-gray-500">{asset.type}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition-colors"
        >
          {submitting ? "Creating…" : "Create Video"}
        </button>
      </form>
    </div>
  );
}