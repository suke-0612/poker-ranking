"use client";

import { updatePrizes } from "@/actions/master";
import { SubmitButton } from "@/components/SubmitButton";
import { toast } from "sonner";

export function PrizeForm({ 
  tournamentId, 
  prizes 
}: { 
  tournamentId: number; 
  prizes: { rank: number; description: string }[];
}) {
  const handleUpdate = async (formData: FormData) => {
    try {
      await updatePrizes(formData);
      toast.success("景品情報を保存しました");
    } catch (error) {
      toast.error("景品の保存に失敗しました");
    }
  };

  return (
    <form action={handleUpdate} className="space-y-4">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="prizeCount" value={prizes.length} />
      {prizes.map((prize) => (
        <div key={prize.rank} className="flex items-center gap-4">
          <label className="w-16 font-bold text-slate-500 text-right">
            {prize.rank}位
          </label>
          <input
            type="text"
            name={`prize_${prize.rank}`}
            defaultValue={prize.description}
            placeholder={`${prize.rank}位の景品...`}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      ))}

      <div className="pt-4 border-t mt-6 text-right">
        <SubmitButton
          loadingText="保存中..."
          className="bg-amber-500 text-white px-6 py-2 rounded-md font-medium hover:bg-amber-600 transition-colors"
        >
          景品を保存
        </SubmitButton>
      </div>
    </form>
  );
}
