import prisma from "@/app/lib/prisma";

export async function AlertsCard() {
  // Logic remains valid
  const multiPicks = await prisma.pick.groupBy({
    by: ["userId"],
    where: { active: true },
    _count: { userId: true },
    having: { userId: { _count: { gt: 1 } } },
  });

  const missingPrices = 0; // Placeholder for future logic
  const alertCount = multiPicks.length + missingPrices;
  const isCritical = alertCount > 0;

  return (
    <div 
      className={`bg-white rounded-xl p-6 border-l-4 shadow-sm transition-all ${
        isCritical 
          ? "border-l-red-500 border-y border-r border-zinc-200 bg-red-50/10" 
          : "border-l-green-500 border-y border-r border-zinc-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
          System Health
        </h3>
        {isCritical ? (
          <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-1 rounded tracking-wide">
            ACTION NEEDED
          </span>
        ) : (
          <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded tracking-wide">
            ALL GOOD
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Row 1: Always Visible */}
        <div className="flex justify-between items-center text-sm">
           <span className="text-zinc-600">Multi-pick violations</span>
           <span className={`font-mono font-bold ${multiPicks.length > 0 ? "text-red-600" : "text-zinc-400"}`}>
             {multiPicks.length}
           </span>
        </div>

        {/* Row 2: Always Visible */}
        <div className="flex justify-between items-center text-sm">
           <span className="text-zinc-600">Price Sync Failures</span>
           <span className={`font-mono font-bold ${missingPrices > 0 ? "text-red-600" : "text-zinc-400"}`}>
             {missingPrices}
           </span>
        </div>
      </div>
    </div>
  );
}
