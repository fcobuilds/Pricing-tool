"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Check, Edit2, X } from "lucide-react";

type Rate = {
  id: string;
  serviceType: string;
  displayName: string;
  minRate: number;
  maxRate: number;
  unit: string;
  notes: string | null;
};

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Rate>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then(setRates)
      .catch(() => setError("Failed to load rates. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(rate: Rate) {
    setEditing(rate.id);
    setEditValues({ ...rate });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/rates/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setRates((prev) => prev.map((r) => (r.id === editing ? updated : r)));
      setEditing(null);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="page-title">My Rate Table</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Your baseline rates per service. Used alongside AI market research to recommend prices.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["Service", "Min Rate", "Max Rate", "Unit", "Notes", ""].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rates.map((rate) =>
              editing === rate.id ? (
                <tr key={rate.id} className="bg-blue-50">
                  <td className="px-6 py-3 text-sm font-medium text-slate-900">{rate.displayName}</td>
                  <td className="px-6 py-3">
                    <div className="relative w-28">
                      <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                      <input
                        className="input pl-6 py-1.5 text-sm"
                        type="number"
                        value={editValues.minRate}
                        onChange={(e) =>
                          setEditValues((p) => ({ ...p, minRate: parseFloat(e.target.value) }))
                        }
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="relative w-28">
                      <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                      <input
                        className="input pl-6 py-1.5 text-sm"
                        type="number"
                        value={editValues.maxRate}
                        onChange={(e) =>
                          setEditValues((p) => ({ ...p, maxRate: parseFloat(e.target.value) }))
                        }
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      className="input py-1.5 text-sm w-28"
                      value={editValues.unit}
                      onChange={(e) => setEditValues((p) => ({ ...p, unit: e.target.value }))}
                    >
                      {["hour", "project", "month", "day"].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <input
                      className="input py-1.5 text-sm"
                      value={editValues.notes || ""}
                      onChange={(e) => setEditValues((p) => ({ ...p, notes: e.target.value }))}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="w-7 h-7 bg-slate-200 rounded-md flex items-center justify-center hover:bg-slate-300"
                      >
                        <X className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{rate.displayName}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-700">{formatCurrency(rate.minRate)}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-700">{formatCurrency(rate.maxRate)}</td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      /{rate.unit}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-400 max-w-xs truncate">
                    {rate.notes || "—"}
                  </td>
                  <td className="px-6 py-3.5">
                    <button
                      onClick={() => startEdit(rate)}
                      className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center hover:bg-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {loading && (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> These are your baseline rates. The AI research pulls current market
          data for the specific location and compares against your rates to give a recommendation.
        </p>
      </div>
    </div>
  );
}
