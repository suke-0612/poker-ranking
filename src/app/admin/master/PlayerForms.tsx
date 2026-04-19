"use client";

import { addUser, toggleUserActive } from "@/actions/master";
import { SubmitButton } from "@/components/SubmitButton";
import { toast } from "sonner";
import { useRef } from "react";
import { Trophy } from "lucide-react";

export function AddUserForm({ tournamentId }: { tournamentId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleAdd = async (formData: FormData) => {
    try {
      await addUser(formData);
      toast.success("プレイヤーを追加しました");
      formRef.current?.reset();
    } catch (error) {
      toast.error("プレイヤーの追加に失敗しました");
    }
  };

  return (
    <form ref={formRef} action={handleAdd} className="flex gap-3 mb-8">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input
        type="text"
        name="username"
        placeholder="新しいプレイヤー名..."
        className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
        required
      />
      <SubmitButton
        loadingText="処理中..."
        className="bg-slate-900 text-white px-5 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
      >
        追加
      </SubmitButton>
    </form>
  );
}

export function ToggleUserActiveForm({ 
  userId, 
  isActive 
}: { 
  userId: number; 
  isActive: boolean;
}) {
  const handleToggle = async () => {
    try {
      await toggleUserActive(userId, !isActive);
      toast.success(isActive ? "無効化しました" : "有効化しました");
    } catch (error) {
      toast.error("ステータスの更新に失敗しました");
    }
  };

  return (
    <form action={handleToggle}>
      <SubmitButton
        loadingText="..."
        className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
          isActive 
            ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
            : "bg-green-100 text-green-700 hover:bg-green-200"
        }`}
      >
        {isActive ? "無効化" : "有効化"}
      </SubmitButton>
    </form>
  );
}
