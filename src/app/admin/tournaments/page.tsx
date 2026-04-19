import { prisma } from "@/lib/prisma";
import { AlertTriangle, History } from "lucide-react";
import { ResetForm } from "./ResetForm";

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { games: true },
      },
    },
  });

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tournaments</h1>
        <p className="text-slate-500">Manage tournament lifecycle and history.</p>
      </div>

      <section className="bg-white p-6 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} />
          Reset Tournament
        </h2>
        <p className="text-slate-600 mb-6 max-w-2xl">
          This will end the current active tournament and start a completely new one. All scores will start from 0. Past tournament data will be archived.
        </p>
        <ResetForm />
      </section>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <History size={20} />
          Tournament History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Started At</th>
                <th className="px-4 py-3 font-medium">Total Games</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tournaments.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-600">#{t.id}</td>
                  <td className="px-4 py-3">
                    {t.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        Archived
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t._count.games}</td>
                </tr>
              ))}
              {tournaments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No tournaments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
