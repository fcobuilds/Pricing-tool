import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Users, Plus, ArrowRight } from "lucide-react";
import ImportClients from "@/components/clients/ImportClients";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { quotes: true } } },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-slate-500 text-sm mt-0.5">{clients.length} total client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportClients />
          <Link href="/quote/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Quote
          </Link>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No clients yet. Add your first client when creating a quote.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Name", "Location", "Type", "Tech Level", "Quotes", "Added", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                    {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">{c.location}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.clientType === "smb" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {c.clientType === "smb" ? "Business" : "Residential"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-600 capitalize">{c.techLevel}</td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-semibold text-slate-900">{c._count.quotes}</span>
                    <span className="text-slate-400 text-xs ml-1">quotes</span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-400">{formatDate(c.createdAt)}</td>
                  <td className="px-6 py-3.5">
                    <Link href={`/clients/${c.id}`} className="text-blue-600 hover:text-blue-700">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
