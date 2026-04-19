import { prisma } from "@/lib/prisma";
import { addUser, toggleUserActive, updatePrizes } from "@/actions/master";

export default async function MasterPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const activeTournament = await prisma.tournament.findFirst({
    where: { isActive: true },
    include: { prizes: true },
  });

  const prizes = Array.from({ length: 10 }, (_, i) => {
    const rank = i + 1;
    const existing = activeTournament?.prizes.find((p) => p.rank === rank);
    return { rank, description: existing?.description || "" };
  });

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Master Data</h1>
        <p className="text-slate-500">Manage players and tournament prizes here.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <section className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Players</h2>
          
          <form action={addUser} className="flex gap-3 mb-8">
            <input
              type="text"
              name="username"
              placeholder="New player name..."
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
            <button
              type="submit"
              className="bg-slate-900 text-white px-5 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
            >
              Add
            </button>
          </form>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`} />
                  <span className={`font-medium ${!user.isActive && "text-slate-400 line-through"}`}>
                    {user.username}
                  </span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await toggleUserActive(user.id, !user.isActive);
                  }}
                >
                  <button
                    type="submit"
                    className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                      user.isActive ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {user.isActive ? "Disable" : "Enable"}
                  </button>
                </form>
              </div>
            ))}
            {users.length === 0 && <p className="text-slate-500 text-center py-4">No players found.</p>}
          </div>
        </section>

        {/* Prize Management */}
        <section className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Prizes (Active Tournament)</h2>
          
          {!activeTournament ? (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-md">
              No active tournament found. Please create one in the Tournaments tab first.
            </div>
          ) : (
            <form action={updatePrizes} className="space-y-4">
              {prizes.map((prize) => (
                <div key={prize.rank} className="flex items-center gap-4">
                  <label className="w-16 font-bold text-slate-500 text-right">
                    {prize.rank}位
                  </label>
                  <input
                    type="text"
                    name={`prize_${prize.rank}`}
                    defaultValue={prize.description}
                    placeholder={`Prize for rank ${prize.rank}...`}
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              ))}
              
              <div className="pt-4 border-t mt-6 text-right">
                <button
                  type="submit"
                  className="bg-amber-500 text-white px-6 py-2 rounded-md font-medium hover:bg-amber-600 transition-colors"
                >
                  Save Prizes
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
