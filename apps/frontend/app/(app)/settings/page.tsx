"use client";

import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";

type Settings = {
  id?: string;
  userId?: string;
  voice?: string | null;
  language?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function SettingsPage() {
  const api = useApi();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getSettings()
      .then((data: Settings) => setSettings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // ponytail: single load for Phase 3; upgrade to optimistic updates later.

  const update = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSettings((s) => (s ? { ...s, [k]: v } : s));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    try {
      await api.updateSettings(settings);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!settings) return <div className="p-8 text-gray-400">No settings found.</div>;

  return (
    <div className="p-8 max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Voice</label>
          <input
            value={settings.voice ?? ""}
            onChange={update("voice")}
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="e.g. en-US-JennyNeural"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
          <input
            value={settings.language ?? ""}
            onChange={update("language")}
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="e.g. en"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm transition-colors"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}