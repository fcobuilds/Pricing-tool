import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SERVICE_LABELS } from "@/types";
import Link from "next/link";
import { Users, FileText, TrendingUp, DollarSign, ArrowRight, Plus } from "lucide-react";

async function getStats() {
  const [clientCount, quotes] = await Promise.all([
    prisma.client.count(),
    prisma.quote.findMany({ select: { finalPrice: true, recommendedPrice: true, status: true } }),
  ]);
  const accepted = quotes.filter((q) => q.status === "accepted");
  const revenue = accepted.reduce((s, q) => s + (q.finalPrice || 0), 0);
  const avgQuote =
    quotes.length > 0
      ? quotes.reduce((s, q) => s + (q.finalPrice || q.recommendedPrice || 0), 0) / quotes.length
      : 0;
  return { clientCount, quoteCount: quotes.length, revenue, avgQuote };
}

async function getRecentQuotes() {
  return prisma.quote.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true, location: true } } },
  });
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([getStats(), getRecentQuotes()]);

  const cards = [
    { label: "Total Clients", value: stats.clientCount.toString(), icon: Users, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Total Quotes", value: stats.quoteCount.toString(), icon: FileText, bg: "bg-indigo-50", text: "text-indigo-600" },
    { label: "Avg Quote Value", value: formatCurrency(stats.avgQuote), icon: TrendingUp, bg: "bg-violet-50", text: "text-violet-600" },
    { label: "Revenue (Accepted)", value: formatCurrency(stats.revenue), icon: DollarSign, bg: "bg-emerald-50", text: "text-emerald-600" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, Frank.</p>
        </div>
        <Link href="/quote/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Quote
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">{label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${text}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="section-title">Recent Quotes</h2>
          <Link href="/history" className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm mb-4">No quotes yet.</p>
            <Link href="/quote/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create your first quote
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((q) => (
              <div key={q.id} className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{q.client.name}</p>
                  <p className="text-xs text-slate-400">{q.client.location}</p>
                </div>
                <div className="hidden sm:block w-36">
                  <p className="text-xs text-slate-600 font-medium">
                    {SERVICE_LABELS[q.serviceType] || q.serviceType}
                  </p>
                </div>
                <div className="text-sm font-semibold text-slate-900 w-20 text-right">
                  {q.finalPrice
                    ? formatCurrency(q.finalPrice)
                    : q.recommendedPrice
                    ? formatCurrency(q.recommendedPrice)
                    : "—"}
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_STYLES[q.status] || STATUS_STYLES.draft
                  }`}
                >
                  {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                </span>
                <div className="hidden md:block text-xs text-slate-400 w-24 text-right">
                  {formatDate(q.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
