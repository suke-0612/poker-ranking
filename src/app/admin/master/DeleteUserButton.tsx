"use client";

import { SubmitButton } from "@/components/SubmitButton";
import { toast } from "sonner";

export function DeleteUserButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const handleDelete = async () => {
    if (confirm("このプレイヤーを削除しますか？\nこの操作は元に戻せません。")) {
      try {
        await onDelete();
        toast.success("プレイヤーを削除しました");
      } catch (error) {
        toast.error("削除に失敗しました");
      }
    }
  };

  return (
    <form action={handleDelete}>
      <SubmitButton
        loadingText="..."
        className="text-sm px-3 py-1.5 rounded-md transition-colors bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
      >
        削除
      </SubmitButton>
    </form>
  );
}
