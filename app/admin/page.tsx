"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowLeft, ShieldAlert, CheckCircle, Clock, Users, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminPage() {
   const { data: session } = useSession();

   if (!session?.user?.isAdmin) {
   return <div className="p-20 font-black">Unauthorized</div>;
   }

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'|'neutral'}>({ 
    msg: "Engine Idle", 
    type: "neutral" 
  });
  const router = useRouter();

  const triggerUpdate = async () => {
    setLoading(true);
    setStatus({ msg: "Initiating Data Pipeline...", type: "neutral" });

    try {
      const res = await fetch('/api/cron/prices');
      const data = await res.json();

      if (data.success) {
         setStatus({ msg: `Successfully Updated ${data.message}`, type: "success" });
         router.refresh(); 
      } else {
         setStatus({ msg: `Pipeline Error: ${data.error}`, type: "error" });
      }
    } catch (e) {
      setStatus({ msg: "Connection Timeout", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-eggshell p-8 text-ink sm:p-16">
       <div className="mx-auto max-w-6xl">
          
          {/* Admin Navigation */}
          <div className="mb-16 flex items-center justify-between">
             <div className="flex items-center gap-8">
                <Link href="/" className="group flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-soft hover:shadow-float transition-all border border-gray-100">
                   <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Admin Console</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-discord mt-2">Internal Operations v3.0</p>
                </div>
             </div>
             
             <div className="flex items-center gap-3 rounded-lg bg-ink px-5 py-2.5 shadow-float border border-ink">
                <ShieldAlert size={16} className="text-discord" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Root Access Established</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             
             {/* Control 1: Market Engine */}
             <div className="flex flex-col rounded-xl bg-white p-10 shadow-soft border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={18} className="text-discord" />
                  <h2 className="text-sm font-black uppercase tracking-widest">Market Data Engine</h2>
                </div>
                
                <p className="text-xs text-gray-500 mb-10 leading-relaxed font-medium">
                   Manually force a global re-fetch of Yahoo Finance data. This updates current prices, recalculates all leaderboard returns, and refreshes session highs/lows for the candlestick graphs.
                </p>

                <div className="mt-auto space-y-4">
                   <div className={cn(
                      "flex items-center gap-3 rounded-lg p-5 text-[10px] font-black uppercase tracking-wider transition-all",
                      status.type === 'success' ? "bg-success/10 text-success border border-success/20" :
                      status.type === 'error' ? "bg-danger/10 text-danger border border-danger/20" : 
                      "bg-gray-50 text-gray-400 border border-gray-100"
                   )}>
                      {status.type === 'success' ? <CheckCircle size={16}/> : <Clock size={16}/>}
                      {status.msg}
                   </div>

                   <button 
                     onClick={triggerUpdate}
                     disabled={loading}
                     className={cn(
                        "flex w-full items-center justify-center gap-4 rounded-lg py-5 text-xs font-black text-white transition-all active:scale-[0.97] uppercase tracking-widest",
                        loading ? "bg-gray-300 cursor-not-allowed" : "bg-discord hover:bg-discord-dark shadow-float"
                     )}
                   >
                     <RefreshCw size={18} className={cn(loading ? "animate-spin" : "")} />
                     {loading ? "Processing..." : "Trigger Global Re-Price"}
                   </button>
                </div>
             </div>

             {/* Control 2: Roster Health */}
             <div className="flex flex-col rounded-xl bg-ink p-10 shadow-float border border-ink">
                <div className="flex items-center gap-3 mb-6">
                  <Users size={18} className="text-gray-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Roster Management</h2>
                </div>
                
                <p className="text-xs text-gray-400 mb-8 leading-relaxed">
                   User exclusion and manual symbol overrides are currently restricted to the Prisma ORM layer for security. 
                </p>

                <div className="mt-auto">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-6">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Quick Command</div>
                    <code className="text-xs font-mono text-discord">npx prisma studio</code>
                    <p className="text-[10px] text-gray-600 mt-4 leading-normal italic">
                      Run this in your terminal to open the database GUI for ban management or manual trade adjustments.
                    </p>
                  </div>
                </div>
             </div>

          </div>
          
          {/* Footer Branding */}
          <div className="mt-20 text-center border-t border-gray-100 pt-10">
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">ISB Financial Lab &copy; 2026</span>
          </div>
       </div>
    </main>
  );
}