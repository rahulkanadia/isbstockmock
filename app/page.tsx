import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Header } from "@/app/components/Header";
import { PublicLeaderboard } from "@/app/components/PublicLeaderboard";

export default async function Home() {
  const session = await getServerSession(authOptions as any);
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#Fdfdfa] text-zinc-900 font-sans selection:bg-purple-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-6 h-full min-h-[calc(100vh-1rem)] flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full lg:h-[80vh]">
          
          {/* TILE 1: HERO (Top Left) */}
          <div className="lg:col-span-8 lg:row-span-8 bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-zinc-200 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Season 2026 Live
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-zinc-900 mb-6">
                One Stock. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  One Month.
                </span>
              </h1>
              
              <p className="text-lg text-zinc-500 max-w-md leading-relaxed mb-8">
                The unofficial ISB trading arena. No money involved. Just pure P&L bragging rights.
              </p>
            </div>
          </div>

          {/* TILE 2: LIVE LEADERBOARD (Right Column) */}
          <div className="lg:col-span-4 lg:row-span-12 bg-zinc-900 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden relative text-white">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
            
            <div className="flex justify-between items-baseline mb-6 mt-2">
              <h3 className="font-bold text-lg tracking-wide">Leaderboard</h3>
              <span className="text-xs font-mono text-zinc-500">JAN '26</span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2">
               <PublicLeaderboard darkTheme={true} />
            </div>
          </div>

          {/* TILE 3: INSTRUCTIONS (Bottom Left) */}
          <div className="lg:col-span-8 lg:row-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StepCard num="01" title="Pick" desc="Choose one stock from NSE/BSE. Lock it in." />
            <StepCard num="02" title="Wait" desc="Market moves daily. Watch your rank shift." />
            <StepCard num="03" title="Win" desc="Highest P&L at month-end takes the crown." />
          </div>

        </div>
      </main>
    </div>
  );
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="text-4xl font-black text-zinc-100">{num}</div>
      <div>
        <h4 className="font-bold text-zinc-900 text-lg mb-1">{title}</h4>
        <p className="text-sm text-zinc-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}