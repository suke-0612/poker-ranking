"use client";
import { resetTournament } from "@/actions/tournament";

export function ResetForm() {
  return (
    <form action={resetTournament}>
      <button
        type="submit"
        className="bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition-colors shadow-sm"
        onClick={(e) => {
          if (!confirm("Are you sure you want to reset the tournament? This will archive all current scores and start from scratch.")) {
            e.preventDefault();
          }
        }}
      >
        End Current & Start New Tournament
      </button>
    </form>
  );
}
