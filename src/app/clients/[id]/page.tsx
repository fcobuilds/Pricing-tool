import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SERVICE_LABELS } from "@/types";
import { ArrowLeft, User } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: { quotes: { orderBy: { createdAt: "desc" } } },
  });
  if (!client) notFound();

  const totalRevenue = client.quotes
    .filter((q) => q.status === "accepted")
    .reduce((s, q) => s + (q.finalPrice || 0), 0);

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/clients" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>

      <div className="flex items-start gap-5 mb-8">
        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-blue-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
            <span>{client.location}</span>
            <span>·</span>
            <span className="capitalize">{client.techLevel} tech level</span>
            <span>·</span>
            <span>{client.clientType === "smb" ? "Small/Medium Business" : "Residential"}</span>
            {client.email && <><span>·</span><span>{client.email}</span></>}
            {client.phone && <><span>·</span><span>{client.phone}</span></>}
          </div>
          {client.notes && <p className="text-sm text-slate-500 mt-2 italic">{client.notes}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-sm text-slate-500 mb-1">Total Quotes</p>
          <p className="text-2xl font-bold text-slate-900">{client.quotes.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500 mb-1">Accepted</p>
          <p className="text-2xl font-bold text-emerald-600">{client.quotes.filter((q) => q.status === "accepted").length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="section-title">Quote History</h2>
        </div>
        {client.quotes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No quotes yet for this client.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {client.quotes.map((q) => (
              <div key={q.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900">
                        {SERVICE_LABELS[q.serviceType] || q.serviceType}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[q.status] || STATUS_STYLES.draft}`}>
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{q.description}</p>
                    {q.estimatedHours && <p className="text-xs text-slate-400 mt-1">Est. {q.estimatedHours}h</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-slate-900">
                      {q.finalPrice ? formatCurrency(q.finalPrice) : q.recommendedPrice ? formatCurrency(q.recommendedPrice) : "—"}
                    </p>
                    {q.recommendedPrice && q.finalPrice && q.finalPrice !== q.recommendedPrice && (
                      <p className="text-xs text-slate-400">rec: {formatCurrency(q.recommendedPrice)}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{formatDate(q.createdAt)}</p>
                  </div>
                </div>
                {q.notes && <p className="text-xs text-slate-400 mt-2 italic">{q.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
