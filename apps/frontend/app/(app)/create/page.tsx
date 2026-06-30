"use client";

import { useApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RESOLUTIONS = ["360p", "540p", "720p", "1080p"];
const RATIOS = ["16:9", "9:16", "1:1", "4:3"];
const DURATIONS = ["5s", "10s", "15s", "30s"];

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

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prompt.trim()) return setError("Prompt is required");
    setError("");
    setSubmitting(true);
    try {
      await api.createVideo(form);
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