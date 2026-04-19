"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Tournament {
  id: number;
  name: string | null;
}

export function TournamentSelector({
  tournaments,
  selectedId,
}: {
  tournaments: Tournament[];
  selectedId: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (tournaments.length === 0) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tournamentId", e.target.value);
    // gameId は大会をまたいで無効なので削除
    params.delete("gameId");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-slate-600 whitespace-nowrap">大会を選択:</label>
      <select
        value={selectedId ?? ""}
        onChange={handleChange}
        className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
      >
        {tournaments.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name || `大会 #${t.id}`}
          </option>
        ))}
      </select>
    </div>
  );
}
