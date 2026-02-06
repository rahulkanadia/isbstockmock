"use client";
import { PrismaClient } from "@prisma/client/";
import { revalidatePath } from "next/cache";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowLeft, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

async function toggleUserExclusion(userId: string, currentState: boolean) {
  "use server";
  const prisma = new PrismaClient();
  await prisma.user.update({
    where: { id: userId },
    data: { isExcluded: !currentState },
  });
  revalidatePath("/admin");
  revalidatePath("/");
}
export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'|'neutral'}>({ msg: "System Ready", type: "neutral" });
  const router = useRouter();

  const triggerUpdate = async () => {
    setLoading(true);
    setStatus({ msg: "Connecting to Exchange...", type: "neutral" });
    
    try {
      const res = await fetch('/api/cron/prices');
      const data = await res.json();
      
      if (data.success) {
         setStatus({ msg: `Success: ${data.message}`, type: "success" });
         router.refresh(); // Refresh server components to show new prices
      } else {
         setStatus({ msg: `Error: ${data.error}`, type: "error" });
      }
    } catch (e) {
      setStatus({ msg: "Network/Timeout Error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eggshell p-8 text-ink">
       <div className="mx-auto max-w-4xl">
          
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Link href="/" className="rounded-full bg-white p-3 shadow-soft-sm hover:shadow-soft-md transition-all">
                   <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-black tracking-tight">Admin Console</h1>
             </div>
             <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft-sm">
                <ShieldAlert size={16} className="text-discord" />
                <span className="text-xs font-bold uppercase text-gray-400">Restricted Access</span>
             </div>
          </div>

          {/* Control Center */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Card 1: Price Trigger */}
             <div className="rounded-3xl bg-white p-8 shadow-float">
                <h2 className="text-xl font-bold mb-2">Market Data Engine</h2>
                <p className="text-sm text-gray-500 mb-8">
                   Forces a fetch of real-time data from Yahoo Finance. Updates Season High/Low and Monthly Anchors.
                </p>

                <div className="flex flex-col gap-4">
                   <div className={cn(
                      "flex items-center gap-3 rounded-xl p-4 text-sm font-medium transition-colors",
                      status.type === 'success' ? "bg-success/10 text-success" :
                      status.type === 'error' ? "bg-danger/10 text-danger" :
                      "bg-gray-50 text-gray-500"
                   )}>
                      {status.type === 'success' ? <CheckCircle size={18}/> : <Clock size={18}/>}
                      {status.msg}
                   </div>

                   <button 
                     onClick={triggerUpdate}
                     disabled={loading}
                     className={cn(
                        "flex w-full items-center justify-center gap-3 rounded-xl py-4 text-sm font-bold text-white transition-all active:scale-95",
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-discord hover:bg-discord-dark shadow-soft-md hover:shadow-soft-xl"
                     )}
                   >
                     <RefreshCw size={20} className={cn(loading ? "animate-spin" : "")} />
                     {loading ? "UPDATING MARKET DATA..." : "TRIGGER PRICE UPDATE NOW"}
                   </button>
                </div>
             </div>

             {/* Card 2: Quick Stats (Placeholder for future Roster Management) */}
            <div className="rounded-3xl bg-white p-8 shadow-soft-md">
               <h2 className="text-xl font-bold mb-6">Roster Management</h2>
               {/* You need to fetch 'users' in the component or pass them if using server component. 
                  Since this is a Client Component ('use client'), we can't fetch direct Prisma here.
                  Fix: Convert AdminPage to Server Component or fetch users via useEffect.
                  Given the architecture, it's easier to make AdminPage a Server Component and put the 
                  interactive buttons in Client Islands.
               */}
               <p className="text-sm text-gray-500">
                  (To manage users, we need to refactor this page to Server Side. 
                  For now, use Prisma Studio: npx prisma studio)
               </p>
            </div>

          </div>
       </div>
    </div>
  );
}