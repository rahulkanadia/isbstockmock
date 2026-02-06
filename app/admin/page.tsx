import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/lib/accessControl";
import { Header } from "@/app/components/Header";
import { SystemHealth } from "@/app/admin/sections/SystemHealth";
import { AuditLogs } from "@/app/admin/sections/AuditLogs";
import { UserTable } from "@/app/admin/sections/UserTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch (e) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-12">
      <Header />
      
      {/* pt-28 ensures header doesn't hide content */}
      <main className="max-w-[1400px] mx-auto px-6 pt-28 space-y-8">
        
        {/* ROW 1: METRICS & LOGS (Grid Layout) */}
        {/* 1/3 System Health, 2/3 Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[320px]">
          <div className="lg:col-span-1 h-full">
            <SystemHealth />
          </div>
          <div className="lg:col-span-2 h-full">
            <AuditLogs />
          </div>
        </div>

        {/* ROW 2: USER TABLE */}
        <section className="min-h-[500px]">
          <UserTable />
        </section>

      </main>
    </div>
  );
}
