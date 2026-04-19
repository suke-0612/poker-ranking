"use client";

import useSWR from "swr";
import { useState, useEffect, useRef } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getOrdinalSuffix = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const apiUrl = `/api/ranking`;

  const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
    refreshInterval: 15000,
  });

  const ranking = data?.ranking || [];
  const totalParticipants = data?.totalParticipants || 0;
  const activeTournaments: { id: number; name: string | null }[] =
    data?.activeTournaments || [];
  const currentTournament = data?.tournament;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || ranking.length <= 1) return;

    let animationId: number;
    let lastTime = 0;
    const speed = 50; // pixels per second
    let paused = false;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!paused && container) {
        container.scrollTop += speed * delta;

        // Check if reached bottom
        if (
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 5
        ) {
          paused = true;
          // Wait at the bottom
          setTimeout(() => {
            if (container) {
              container.scrollTo({ top: 0, behavior: "smooth" });
              // Wait for return to top
              setTimeout(() => {
                paused = false;
                lastTime = 0;
              }, 4000);
            }
          }, 3000);
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [ranking]);

  if (error) return <div className="p-8 text-destructive text-center font-bold">Failed to load ranking</div>;
  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading ranking...</div>;


  return (
    <div className="h-screen text-slate-50 flex flex-col items-center p-8 overflow-hidden bg-white">
      <div className="w-full max-w-6xl flex flex-col h-full space-y-8">
        <div className="text-center">
          <h1 className="text-xl md:text-3xl font-bold text-slate-900">
            {currentTournament?.name || "POKER TOURNAMENT RANKING"}
          </h1>
        </div>



        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pb-24 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {ranking.map((row: any, index: number) => (
              <div key={index} className="flex items-center gap-2 md:gap-4">
                <div className="w-24 md:w-48 shrink-0 flex justify-end items-center px-2">
                  {row.prize && (
                    <div
                      title={row.prize}
                      className="text-sm md:text-2xl font-black text-white bg-gradient-to-br from-slate-600 to-slate-800 border-2 border-slate-500/50 px-3 py-2 md:px-6 md:py-4 rounded-xl text-center max-w-full shadow-2xl tracking-tight leading-tight"
                    >
                      {row.prize}
                    </div>
                  )}
                </div>

                {/* Card */}
                <div className="flex-1 flex items-stretch rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800 transition-transform hover:scale-[1.01]">
                  {/* Left side: Rank (Larger) */}
                  <div
                    className={`w-1/5 p-6 md:p-10 flex flex-col justify-center items-center border-r border-slate-700/50 overflow-hidden ${
                      row.rank === 1
                        ? "bg-yellow-500/20 text-yellow-400"
                        : row.rank === 2
                        ? "bg-slate-300/20 text-slate-200"
                        : row.rank === 3
                        ? "bg-amber-700/30 text-amber-500"
                        : "bg-slate-700/50 text-slate-300"
                    }`}
                  >
                    <span className="text-5xl md:text-8xl ml-4 font-rammetto flex items-baseline">
                      {row.rank}
                      <span className="text-xl md:text-3xl  md:ml-2 opacity-80 tracking-normal">
                        {getOrdinalSuffix(row.rank)}
                      </span>
                    </span>
                  </div>

                  {/* Right side: Name and Score (Larger) */}
                  <div className="w-4/5 p-6 md:p-10 flex flex-col justify-center">
                    <span className="text-lg md:text-3xl font-bold text-slate-300 truncate w-full pl-2 md:pl-4 mb-2">
                      {row.username}
                    </span>
                    <span className="text-5xl md:text-8xl font-black text-amber-400 text-right w-full tracking-tighter leading-none">
                      {row.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {ranking.length === 0 && (
              <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 italic">
                No scores recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* 参加人数表示 */}
        {totalParticipants > 0 && (
          <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-5 border border-slate-800 z-10">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1.5">
                Total
              </span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.1em] leading-none">
                Entries
              </span>
            </div>
            <div className="w-px h-10 bg-slate-700/50" />
            <span className="text-4xl font-black tabular-nums leading-none text-white">
              {totalParticipants}
            </span>
          </div>
        )}
    </div>
  );
}
