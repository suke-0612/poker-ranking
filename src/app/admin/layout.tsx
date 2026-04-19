import Link from "next/link";
import { Users, Trophy, Flag, Database } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Admin Panel</h2>
          <p className="text-xs text-slate-500 mt-1">Poker Ranking App</p>
        </div>
        <nav className="flex flex-row md:flex-col gap-1 px-4 pb-4 overflow-x-auto">
          <Link
            href="/admin/scores"
            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-slate-800 hover:text-white transition-colors flex-shrink-0"
          >
            <Trophy size={18} />
            <span className="font-medium">Scores</span>
          </Link>
          <Link
            href="/admin/master"
            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-slate-800 hover:text-white transition-colors flex-shrink-0"
          >
            <Users size={18} />
            <span className="font-medium">Master Data</span>
          </Link>
          <Link
            href="/admin/tournaments"
            className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-slate-800 hover:text-white transition-colors flex-shrink-0"
          >
            <Flag size={18} />
            <span className="font-medium">Tournaments</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 mt-4 rounded-md text-amber-500 hover:bg-amber-500/10 transition-colors flex-shrink-0"
          >
            <Database size={18} />
            <span className="font-medium">View Live Ranking</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto text-slate-900">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
