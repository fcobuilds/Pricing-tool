import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SERVICE_LABELS } from "@/types";
import Link from "next/link";
import { Plus } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function HistoryPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true, location: true, id: true } } },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Quote History</h1>
          <p className="text-slate-500 text-sm mt-0.5">{quotes.length} total quote{quotes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/quote/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Quote
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {quotes.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No quotes yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Client", "Service", "Description", "AI Rec.", "Final Price", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <Link href={`/clients/${q.client.id}`} className="text-sm font-medium text-slate-900 hover:text-blue-600">
                      {q.client.name}
                    </Link>
                    <p className="text-xs text-slate-400">{q.client.location}</p>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-700">{SERVICE_LABELS[q.serviceType] || q.serviceType}</td>
                  <td className="px-6 py-3.5">
                    <p className="text-xs text-slate-500 max-w-xs line-clamp-2">{q.description}</p>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-medium text-blue-600">
                    {q.recommendedPrice ? formatCurrency(q.recommendedPrice) : "—"}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-semibold text-slate-900">
                      {q.finalPrice ? formatCurrency(q.finalPrice) : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[q.status] || STATUS_STYLES.draft}`}>
                      {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-400">{formatDate(q.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
