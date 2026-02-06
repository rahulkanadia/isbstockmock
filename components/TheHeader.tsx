"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

interface TheHeaderProps {
  showMyPick: boolean;
  setShowMyPick: (val: boolean) => void;
  // NEW PROPS FOR RIVALRY
  myStats?: { username: string; return: number; avatar: string | null } | null;
  rivalStats?: { username: string; return: number; avatar: string | null } | null;
}

export default function TheHeader({ showMyPick, setShowMyPick, myStats, rivalStats }: TheHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // @ts-ignore
  const isAdmin = session?.user?.isAdmin;

  const handleAdminClick = () => {
    if (isAdmin) router.push("/admin");
  };

  // RIVALRY CALC
  const hasRivalry = myStats && rivalStats;
  const gap = hasRivalry ? myStats.return - rivalStats.return : 0;
  const isAhead = gap >= 0;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out border-b border-transparent",
        scrolled
          ? "h-16 bg-eggshell/80 backdrop-blur-md border-gray-200 shadow-soft-sm"
          : "h-24 bg-eggshell"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8 relative">
        
        {/* LEFT: Branding */}
        <div 
          onClick={handleAdminClick}
          className={cn(
            "font-black tracking-tighter transition-all duration-300 select-none",
            scrolled ? "text-xl" : "text-3xl",
            isAdmin ? "cursor-pointer hover:text-discord hover:translate-y-1" : ""
          )}
        >
          {isAdmin ? "ADMIN CONSOLE" : "ISB STOCK MOCK 2026"}
        </div>

        {/* CENTER: RIVALRY BAR (Desktop Only) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {hasRivalry && (
                <div className="group flex cursor-default items-center gap-4 rounded-full border border-white/50 bg-white/50 px-6 py-2 shadow-soft-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:shadow-soft-md">
                    
                    {/* ME */}
                    <div className="flex items-center gap-2 opacity-50 transition-opacity group-hover:opacity-100">
                        <div className="relative h-6 w-6 overflow-hidden rounded-full bg-gray-200">
                             {myStats.avatar && <Image src={myStats.avatar} fill alt="Me" className="object-cover"/>}
                        </div>
                        <span className="text-xs font-bold text-gray-500">Me</span>
                    </div>

                    {/* THE GAP */}
                    <div className="flex min-w-[80px] flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">GAP</span>
                        <span className={cn("text-lg font-black leading-none tracking-tight", isAhead ? "text-success" : "text-danger")}>
                            {gap > 0 ? "+" : ""}{gap.toFixed(2)}%
                        </span>
                    </div>

                    {/* RIVAL */}
                    <div className="flex items-center gap-2 opacity-50 transition-opacity group-hover:opacity-100">
                        <span className="text-xs font-bold text-gray-500 truncate max-w-[80px]">{rivalStats.username}</span>
                         <div className="relative h-6 w-6 overflow-hidden rounded-full bg-gray-200">
                             {rivalStats.avatar ? (
                                 <Image src={rivalStats.avatar} fill alt="Rival" className="object-cover"/>
                             ) : (
                                 <div className="flex h-full w-full items-center justify-center bg-discord text-[8px] font-bold text-white">ISB</div>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT: Controls */}
        <div className="flex flex-col items-end gap-1">
          {session ? (
            <>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1 shadow-soft-sm">
                    {session.user?.image ? (
                        <Image src={session.user.image} alt="User" width={24} height={24} className="rounded-full" />
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-discord/20" />
                    )}
                    <span className="text-sm font-bold text-ink">{session.user?.name}</span>
                    <button onClick={() => signOut()} className="ml-1 text-gray-400 hover:text-danger"><LogOut size={14}/></button>
                 </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-discord">
                <input 
                  type="checkbox" 
                  checked={showMyPick}
                  onChange={(e) => setShowMyPick(e.target.checked)}
                  className="accent-discord h-3 w-3"
                />
                Feature my stock pick
              </label>
            </>
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="rounded-lg bg-discord px-4 py-2 text-sm font-bold text-white shadow-soft-md transition-transform hover:scale-105 active:scale-95"
            >
              Connect my Discord avatar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}