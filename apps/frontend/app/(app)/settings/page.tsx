"use client";

import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";

type Settings = {
  id?: string;
  userId?: string;
  apiKey?: string;
  apiBaseUrl?: string;
  defaultModel?: string;
  defaultResolution?: string;
  defaultRatio?: string;
  defaultDuration?: string;
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
        <div className="border-b border-gray-800 pb-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Seedance API</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
              <input
                type="password"
                value={settings.apiKey ?? ""}
                onChange={update("apiKey")}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Your Seedance API key"
              />
              <p className="text-xs text-gray-500 mt-1">Required for video generation</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">API Base URL</label>
              <input
                value={settings.apiBaseUrl ?? ""}
                onChange={update("apiBaseUrl")}
                className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="https://ark.ap-southeast.bytepluses.com/api/v3"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Default Model</label>
                <input
                  value={settings.defaultModel ?? ""}
                  onChange={update("defaultModel")}
                  className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="seedance-2.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Default Duration</label>
                <input
                  value={settings.defaultDuration ?? ""}
                  onChange={update("defaultDuration")}
                  className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="5s"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Default Resolution</label>
                <input
                  value={settings.defaultResolution ?? ""}
                  onChange={update("defaultResolution")}
                  className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="1080p"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Default Ratio</label>
                <input
                  value={settings.defaultRatio ?? ""}
                  onChange={update("defaultRatio")}
                  className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="9:16"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Voice & Language</h3>
          <div className="space-y-3">
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
          </div>
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