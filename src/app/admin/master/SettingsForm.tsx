"use client";

import { updateTournamentSettings } from "@/actions/master";
import { SubmitButton } from "@/components/SubmitButton";
import { toast } from "sonner";
import { Settings } from "lucide-react";

export function SettingsForm({
  tournamentId,
  playerCount,
}: {
  tournamentId: number;
  playerCount: number;
}) {
  const handleUpdate = async (formData: FormData) => {
    try {
      await updateTournamentSettings(formData);
      toast.success("大会の設定を更新しました");
    } catch (error) {
      toast.error("設定の更新に失敗しました");
    }
  };

  return (
    <form action={handleUpdate} className="flex flex-wrap items-end gap-4 p-4 bg-white border rounded-lg shadow-sm">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          ランキング表示人数
        </label>
        <input
          type="number"
          name="playerCount"
          defaultValue={playerCount}
          min={1}
          max={100}
          className="w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <SubmitButton
        loadingText="更新中..."
        className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
      >
        <Settings size={16} />
        設定を保存
      </SubmitButton>
    </form>
  );
}
