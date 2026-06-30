"use client";

import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";

type Asset = {
  id: string;
  filename: string;
  type: "product" | "model" | "background";
  filesize: number;
  url: string;
  createdAt: string;
};

const ASSET_TYPES = [
  { value: "product", label: "Product" },
  { value: "model", label: "Model" },
  { value: "background", label: "Background" },
];

export default function AssetsPage() {
  const api = useApi();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("product");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const data = await api.getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const newAsset = await api.uploadAsset(file, selectedType);
      setAssets((prev) => [newAsset, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    try {
      await api.deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const filteredAssets = assets.filter((a) => a.type === selectedType);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Assets</h2>

      {/* Upload section */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Upload Asset</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Asset Type</label>
            <div className="flex gap-2">
              {ASSET_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === t.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">File</label>
            <label className="flex items-center justify-center w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
              <span className="text-sm text-gray-400">
                {uploading ? "Uploading…" : "Click to select file"}
              </span>
              <input
                type="file"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                accept="image/*,video/*"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">Images (JPG, PNG, GIF, WebP) or Videos (MP4, WebM, MOV) up to 100MB</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>

      {/* Assets list */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">
          {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Assets ({filteredAssets.length})
        </h3>

        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : filteredAssets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
            <p className="text-gray-400">No {selectedType} assets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="rounded-lg bg-gray-900 border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
                {/* Preview */}
                <div className="aspect-video bg-gray-800 flex items-center justify-center overflow-hidden">
                  {asset.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                  ) : asset.url.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={asset.url} className="w-full h-full object-cover" />
                  ) : (
                    <p className="text-gray-500 text-sm">No preview</p>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <p className="text-sm font-medium truncate">{asset.filename}</p>
                  <p className="text-xs text-gray-500">{formatSize(asset.filesize)}</p>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="w-full py-1.5 px-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-300 text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}