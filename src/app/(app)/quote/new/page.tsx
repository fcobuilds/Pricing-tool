"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { SERVICE_LABELS, NEED_LEVEL_LABELS, TECH_LEVEL_LABELS } from "@/types";
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Check,
  AlertCircle,
  User,
  Plus,
  Loader2,
  Clock,
  Layers,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

type ClientQuote = {
  serviceType: string;
  finalPrice: number | null;
  recommendedPrice: number | null;
  createdAt: string;
  description: string;
};

type Client = {
  id: string;
  name: string;
  location: string;
  techLevel: string;
  clientType: string;
  quotes: ClientQuote[];
};

type Research = {
  low: number;
  high: number;
  recommended: number;
  reasoning: string;
  marketContext: string;
};

const SERVICE_OPTIONS = Object.entries(SERVICE_LABELS);

export default function NewQuotePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    techLevel: "beginner",
    clientType: "residential",
    notes: "",
  });
  const [creatingClient, setCreatingClient] = useState(false);

  // Step 2
  const [serviceType, setServiceType] = useState("it-support");
  const [description, setDescription] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [needLevel, setNeedLevel] = useState("medium");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [multiTask, setMultiTask] = useState(false);

  // Step 3
  const [research, setResearch] = useState<Research | null>(null);
  const [myRate, setMyRate] = useState<{ min: number; max: number; unit: string } | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState("");
  const [recommendedPrice, setRecommendedPrice] = useState("");

  // Step 4
  const [finalPrice, setFinalPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);

  const lastQuote = selectedClient?.quotes[0] ?? null;
  const lastPrice = lastQuote?.finalPrice ?? lastQuote?.recommendedPrice ?? null;

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
      .catch(() => {});
  }, []);

  // Auto-calculate hours from start/end time
  useEffect(() => {
    if (!startTime || !endTime) return;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    if (minutes > 0) setEstimatedHours((minutes / 60).toFixed(2));
  }, [startTime, endTime]);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  async function createClient() {
    if (!newClient.name || !newClient.location) return;
    setCreatingClient(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (!res.ok) throw new Error("Failed to create client");
      const created: Client = await res.json();
      setClients((p) => [created, ...p]);
      setSelectedClient(created);
      setShowNewClient(false);
    } catch {
      // keep form open so user can retry
    } finally {
      setCreatingClient(false);
    }
  }

  async function runResearch() {
    if (!selectedClient) return;
    setResearchLoading(true);
    setResearchError("");
    setResearch(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          location: selectedClient.location,
          description,
          techLevel: selectedClient.techLevel,
          needLevel,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
          multiTask,
          isRepeatClient: selectedClient.quotes.length > 0,
          previousPrice: lastPrice ?? undefined,
          previousService: lastQuote?.serviceType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Research failed");
      setResearch(data.research);
      setMyRate(data.myRate);
      setRecommendedPrice(String(data.research.recommended));
      setFinalPrice(String(data.research.recommended));
    } catch (err) {
      setResearchError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setResearchLoading(false);
    }
  }

  function goBackToService() {
    setResearch(null);
    setMyRate(null);
    setResearchError("");
    setRecommendedPrice("");
    setStep(2);
  }

  async function saveQuote() {
    if (!selectedClient || !finalPrice) return;
    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          serviceType,
          description,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
          finalPrice: parseFloat(finalPrice),
          recommendedPrice: research?.recommended ?? null,
          marketLow: research?.low ?? null,
          marketHigh: research?.high ?? null,
          marketResearch: research ? JSON.stringify(research) : null,
          needLevel,
          status,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to save quote");
      router.push("/history");
    } catch {
      // staying on page lets user retry
    } finally {
      setSaving(false);
    }
  }

  const stepLabels = ["Client", "Service", "Research", "Finalize"];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="page-title mb-6">New Quote</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => {
          const s = (i + 1) as Step;
          const done = s < step;
          const active = s === step;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  done
                    ? "bg-blue-600 text-white"
                    : active
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              <span
                className={`text-sm font-medium ${
                  active ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              {s < 4 && <ChevronRight className="w-4 h-4 text-slate-300" />}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: CLIENT ── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="section-title mb-4">Select Client</h2>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {filtered.length === 0 && search && (
              <p className="text-sm text-slate-400 text-center py-4">No clients found.</p>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  selectedClient?.id === c.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.location} · {TECH_LEVEL_LABELS[c.techLevel] || c.techLevel} ·{" "}
                    {c.clientType === "smb" ? "Business" : "Residential"}
                    {c.quotes.length > 0 &&
                      ` · ${c.quotes.length} previous quote${
                        c.quotes.length !== 1 ? "s" : ""
                      }`}
                  </p>
                </div>
                {selectedClient?.id === c.id && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewClient(!showNewClient)}
            className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
          >
            <Plus className="w-4 h-4" />
            {showNewClient ? "Cancel" : "Add New Client"}
          </button>

          {showNewClient && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3 mb-4">
              <p className="text-sm font-semibold text-slate-900">New Client</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name *</label>
                  <input
                    className="input"
                    value={newClient.name}
                    onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Location *</label>
                  <input
                    className="input"
                    placeholder="City, State"
                    value={newClient.location}
                    onChange={(e) => setNewClient((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    className="input"
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Tech Level</label>
                  <select
                    className="input"
                    value={newClient.techLevel}
                    onChange={(e) => setNewClient((p) => ({ ...p, techLevel: e.target.value }))}
                  >
                    {Object.entries(TECH_LEVEL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Client Type</label>
                  <select
                    className="input"
                    value={newClient.clientType}
                    onChange={(e) => setNewClient((p) => ({ ...p, clientType: e.target.value }))}
                  >
                    <option value="residential">Residential</option>
                    <option value="smb">Small/Medium Business</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows={2}
                  value={newClient.notes}
                  onChange={(e) => setNewClient((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <button
                onClick={createClient}
                disabled={!newClient.name || !newClient.location || creatingClient}
                className="btn-primary w-full"
              >
                {creatingClient ? "Saving..." : "Save Client & Select"}
              </button>
            </div>
          )}

          {selectedClient && selectedClient.quotes.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Previous Work with {selectedClient.name}
              </p>
              <div className="space-y-1.5">
                {selectedClient.quotes.slice(0, 4).map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2"
                  >
                    <span className="font-medium text-slate-700">
                      {SERVICE_LABELS[q.serviceType] || q.serviceType}
                    </span>
                    <span className="text-slate-400">—</span>
                    <span className="font-semibold text-slate-900">
                      {q.finalPrice
                        ? formatCurrency(q.finalPrice)
                        : q.recommendedPrice
                        ? formatCurrency(q.recommendedPrice)
                        : "No price set"}
                    </span>
                    <span className="text-slate-400 ml-auto">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedClient}
              className="btn-primary flex items-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: SERVICE ── */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="section-title mb-4">Service Details</h2>

          {/* Repeat client banner */}
          {selectedClient && lastQuote && lastPrice !== null && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
              <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-semibold text-amber-900">Repeat client</span>
                <span className="text-amber-700"> · Last charged </span>
                <span className="font-bold text-amber-900">{formatCurrency(lastPrice)}</span>
                <span className="text-amber-700"> for {SERVICE_LABELS[lastQuote.serviceType] || lastQuote.serviceType}</span>
                <span className="text-amber-500 ml-2 text-xs">
                  {new Date(lastQuote.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="label">Service Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_OPTIONS.map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setServiceType(value)}
                    className={`p-3 rounded-lg border text-sm font-medium text-left transition-all ${
                      serviceType === value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Describe the work in detail — what needs to be done, scope, any special requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Multi-task toggle */}
            <button
              type="button"
              onClick={() => setMultiTask(!multiTask)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                multiTask
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div
                className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${
                  multiTask ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    multiTask ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-900">Multiple unrelated tasks</p>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  This visit covered several different problems — context-switching warrants a complexity premium
                </p>
              </div>
            </button>

            {/* Visit time picker */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Visit Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Start time</p>
                  <input
                    className="input"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">End time</p>
                  <input
                    className="input"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              {startTime && endTime && estimatedHours && (
                <p className="text-xs text-blue-600 font-medium mt-1.5">
                  → {estimatedHours} hours calculated automatically
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Hours</label>
                <input
                  className="input"
                  type="number"
                  min="0.25"
                  step="0.25"
                  placeholder="e.g. 1.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {startTime && endTime ? "Auto-calculated — edit to override" : "Or use time picker above"}
                </p>
              </div>
              <div>
                <label className="label">Urgency / Need Level</label>
                <select
                  className="input"
                  value={needLevel}
                  onChange={(e) => setNeedLevel(e.target.value)}
                >
                  {Object.entries(NEED_LEVEL_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Urgent jobs can command higher rates</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => {
                setStep(3);
                runResearch();
              }}
              disabled={!description.trim()}
              className="btn-primary flex items-center gap-2"
            >
              Get Market Research <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: RESEARCH ── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="section-title mb-4">Market Research</h2>

          {researchLoading && (
            <div className="flex flex-col items-center py-14 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500">
                Researching rates for {selectedClient?.location}...
              </p>
              <p className="text-xs text-slate-400">
                Checking market data for {SERVICE_LABELS[serviceType]}
              </p>
            </div>
          )}

          {researchError && !researchLoading && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Research failed</p>
                <p className="text-xs text-red-600 mt-0.5">{researchError}</p>
                <button onClick={runResearch} className="text-xs text-red-700 underline mt-2">
                  Try again
                </button>
              </div>
            </div>
          )}

          {research && !researchLoading && (
            <div className="space-y-4">
              {/* Context chips */}
              <div className="flex flex-wrap gap-2">
                {selectedClient && lastPrice !== null && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    Repeat client · last {formatCurrency(lastPrice)}
                  </span>
                )}
                {multiTask && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    <Layers className="w-3 h-3" /> Multi-task visit
                  </span>
                )}
                {estimatedHours && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" /> {estimatedHours}h
                    {startTime && endTime && ` (${startTime}–${endTime})`}
                  </span>
                )}
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-blue-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  Market Rate Range — {selectedClient?.location}
                </p>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Low End</p>
                    <p className="text-xl font-bold text-slate-500">{formatCurrency(research.low)}</p>
                  </div>
                  <div className="flex-1 h-1.5 bg-gradient-to-r from-slate-200 via-blue-400 to-blue-600 rounded-full" />
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">High End</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(research.high)}</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Recommends: {formatCurrency(research.recommended)}
                  </span>
                </div>
              </div>

              {myRate && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Your Rate Table Baseline</p>
                  <p className="text-sm text-emerald-800">
                    {formatCurrency(myRate.min)} – {formatCurrency(myRate.max)} / {myRate.unit}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Why this price?</p>
                  <p className="text-sm text-slate-700">{research.reasoning}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Market Context</p>
                  <p className="text-sm text-slate-600">{research.marketContext}</p>
                </div>
              </div>

              <div>
                <label className="label">Your Price (adjust if needed)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">$</span>
                  <input
                    className="input pl-7 text-lg font-semibold"
                    type="number"
                    value={recommendedPrice}
                    onChange={(e) => {
                      setRecommendedPrice(e.target.value);
                      setFinalPrice(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {!researchLoading && (
            <div className="flex justify-between mt-6">
              <button onClick={goBackToService} className="btn-secondary flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!research}
                className="btn-primary flex items-center gap-2"
              >
                Finalize Quote <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: FINALIZE ── */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="section-title mb-4">Finalize Quote</h2>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-5 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">Client: </span>
              <span className="font-medium">{selectedClient?.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Location: </span>
              <span className="font-medium">{selectedClient?.location}</span>
            </div>
            <div>
              <span className="text-slate-500">Service: </span>
              <span className="font-medium">{SERVICE_LABELS[serviceType]}</span>
            </div>
            <div>
              <span className="text-slate-500">Need Level: </span>
              <span className="font-medium capitalize">{needLevel}</span>
            </div>
            {startTime && endTime ? (
              <div>
                <span className="text-slate-500">Visit Time: </span>
                <span className="font-medium">{startTime} – {endTime}</span>
              </div>
            ) : null}
            {estimatedHours && (
              <div>
                <span className="text-slate-500">Hours: </span>
                <span className="font-medium">{estimatedHours}h</span>
              </div>
            )}
            {multiTask && (
              <div className="col-span-2">
                <span className="text-slate-500">Visit Type: </span>
                <span className="font-medium text-blue-700">Multiple unrelated tasks</span>
              </div>
            )}
            {research && (
              <div>
                <span className="text-slate-500">AI Recommended: </span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(research.recommended)}
                </span>
              </div>
            )}
            {lastPrice !== null && (
              <div>
                <span className="text-slate-500">Last Charged: </span>
                <span className="font-medium text-amber-700">{formatCurrency(lastPrice)}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Final Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500 font-medium">$</span>
                <input
                  className="input pl-7 text-xl font-bold"
                  type="number"
                  placeholder="0"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Quote Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="sent">Sent to Client</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="label">Internal Notes</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Notes about scope, client preferences, what was agreed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(3)} className="btn-secondary flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={saveQuote}
              disabled={!finalPrice || saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4" /> Save Quote</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
