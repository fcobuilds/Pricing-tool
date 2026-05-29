"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Check, AlertCircle } from "lucide-react";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
  });
}

export default function ImportClients() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target?.result as string);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(file);
  }

  async function doImport() {
    if (!fileRef.current?.files?.[0]) return;
    setImporting(true);
    const text = await fileRef.current.files[0].text();
    const rows = parseCSV(text);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setOpen(false);
    setPreview([]);
    setFileName("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDone() {
    reset();
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary flex items-center gap-2">
        <Upload className="w-4 h-4" /> Import CSV
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Import Clients from CSV</h2>
              <button onClick={reset} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!result ? (
                <>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-600">
                    <p className="font-semibold mb-1">Expected CSV columns:</p>
                    <p className="font-mono">name, location, email, phone, techLevel, clientType, notes</p>
                    <p className="mt-1 text-slate-400">Only <strong>name</strong> and <strong>location</strong> are required. techLevel: beginner/intermediate/advanced. clientType: residential/smb.</p>
                  </div>

                  <div>
                    <label className="label">Select CSV file</label>
                    <input ref={fileRef} type="file" accept=".csv" onChange={handleFile}
                      className="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  </div>

                  {preview.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">Preview (first 5 rows)</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-100">
                              {Object.keys(preview[0]).map((k) => (
                                <th key={k} className="text-left font-semibold text-slate-500 pb-1 pr-3">{k}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {preview.map((row, i) => (
                              <tr key={i} className="border-b border-slate-50">
                                {Object.values(row).map((v, j) => (
                                  <td key={j} className="py-1 pr-3 text-slate-700 truncate max-w-24">{v || "—"}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <button onClick={doImport} disabled={!fileName || importing}
                    className="btn-primary w-full">
                    {importing ? "Importing..." : `Import${fileName ? ` "${fileName}"` : ""}`}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  {result.created > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="text-lg font-bold text-slate-900">{result.created} client{result.created !== 1 ? "s" : ""} imported</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-10 h-10 text-red-400" />
                      <p className="text-sm text-slate-600">No clients were imported.</p>
                    </div>
                  )}
                  {result.errors.length > 0 && (
                    <div className="mt-3 text-left">
                      <p className="text-xs font-semibold text-red-600 mb-1">{result.errors.length} error{result.errors.length !== 1 ? "s" : ""}:</p>
                      <ul className="text-xs text-red-500 space-y-0.5">
                        {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}
                  <button onClick={handleDone} className="btn-primary mt-4">
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
