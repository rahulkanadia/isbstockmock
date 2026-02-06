"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LogOut, Target } from "lucide-react";

export default function TheHeader({ showMyPick, setShowMyPick, myStats, rivalStats, isMock, onMockLogin }: any) {
  const { data: session } = useSession();
  const activeSession = session || (isMock ? { user: { name: "Local Dev", image: null } } : null);

  const hasRivalry = myStats && rivalStats;
  const gap = hasRivalry ? myStats.return - rivalStats.return : 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full h-20 bg-eggshell/90 backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-8">
        
        {/* Branding */}
        <div className="text-xl font-black tracking-tighter text-ink uppercase">
          ISB Stock Mock <span className="text-discord">2026</span>
        </div>

        {/* Rivalry Pill */}
        {hasRivalry && (
          <div className="hidden lg:flex items-center gap-4 rounded-lg bg-ink px-5 py-2 border border-ink shadow-float">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">vs Rival</span>
            <span className={cn("text-base font-mono font-black", gap >= 0 ? "text-success" : "text-danger")}>
              {gap > 0 ? "+" : ""}{gap.toFixed(2)}%
            </span>
          </div>
        )}

        {/* User Controls */}
        <div className="flex items-center gap-6">
          {activeSession ? (
            <div className="flex items-center gap-5">
              <label className="flex cursor-pointer items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-discord transition-colors">
                <input 
                  type="checkbox" 
                  checked={showMyPick} 
                  onChange={(e) => setShowMyPick(e.target.checked)} 
                  className="accent-discord w-4 h-4 cursor-pointer" 
                />
                <Target size={14} className={showMyPick ? "text-discord" : ""} />
                Feature My Pick
              </label>
              <div className="h-9 w-9 rounded-md bg-discord/10 border border-discord/20 flex items-center justify-center overflow-hidden">
                {activeSession.user?.image ? <img src={activeSession.user.image} alt="U" /> : <div className="text-discord font-bold text-xs">LD</div>}
              </div>
              <button onClick={() => isMock ? window.location.reload() : signOut()} className="text-gray-400 hover:text-danger"><LogOut size={16}/></button>
            </div>
          ) : (
            <button 
              onClick={() => window.location.hostname === 'localhost' ? onMockLogin() : signIn("discord")} 
              className="rounded-lg bg-discord px-5 py-2 text-[11px] font-black text-white shadow-soft hover:shadow-float transition-all uppercase"
            >
              Connect Discord Avatar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}