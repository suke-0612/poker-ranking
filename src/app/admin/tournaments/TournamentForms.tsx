"use client";

import { createTournament, closeTournament, setFeaturedTournament } from "@/actions/tournament";
import { SubmitButton } from "@/components/SubmitButton";
import { toast } from "sonner";
import { useRef } from "react";
import { Star } from "lucide-react";

export function CreateTournamentForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleCreate = async (formData: FormData) => {
    try {
      await createTournament(formData);
      toast.success("新しい大会を開始しました");
      formRef.current?.reset();
    } catch (error) {
      toast.error("大会の作成に失敗しました");
    }
  };

  return (
    <form ref={formRef} action={handleCreate} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        name="name"
        placeholder="大会名（任意）例: 第3回 おとも杯..."
        className="flex-1 max-w-sm px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      <SubmitButton
        loadingText="作成中..."
        className="bg-slate-900 text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
      >
        新しい大会を開始
      </SubmitButton>
    </form>
  );
}

export function SetFeaturedButton({ id, isFeatured }: { id: number; isFeatured: boolean }) {
  const handleSetFeatured = async () => {
    try {
      await setFeaturedTournament(id);
      toast.success("表示する大会を設定しました");
    } catch (error) {
      toast.error("設定に失敗しました");
    }
  };

  return (
    <form action={handleSetFeatured}>
      <SubmitButton
        loadingText="..."
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
          isFeatured
            ? "bg-amber-100 text-amber-700 border border-amber-200"
            : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
        }`}
      >
        <Star size={14} className={isFeatured ? "fill-current" : ""} />
        {isFeatured ? "表示中" : "ルートに表示"}
      </SubmitButton>
    </form>
  );
}

export function CloseTournamentButton({ id }: { id: number }) {
  const handleClose = async () => {
    if (confirm("この大会を終了しますか？")) {
      try {
        await closeTournament(id);
        toast.success("大会を終了しました");
      } catch (error) {
        toast.error("大会の終了に失敗しました");
      }
    }
  };

  return (
    <form action={handleClose}>
      <SubmitButton
        loadingText="処理中..."
        className="text-sm px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
      >
        終了
      </SubmitButton>
    </form>
  );
}