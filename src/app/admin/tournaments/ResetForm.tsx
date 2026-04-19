"use client";
import { resetTournament } from "@/actions/tournament";
import { SubmitButton } from "@/components/SubmitButton";

export function ResetForm() {
  return (
    <form action={resetTournament}>
      <SubmitButton
        loadingText="処理中..."
        className="bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition-colors shadow-sm"
        onClick={(e) => {
          if (!confirm("本当に大会をリセットしますか？ 現在のスコアはすべてアーカイブされ、ゼロからスタートします。")) {
            e.preventDefault();
          }
        }}
      >
        現在の大会を終了して新しく開始
      </SubmitButton>
    </form>
  );
}
