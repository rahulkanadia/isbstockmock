import { requireAdmin } from "@/app/lib/accessControl";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4 flex justify-between">
        <div className="font-semibold">
          Admin Console
        </div>
        <nav className="space-x-4 text-sm">
          <Link href="/admin">Dashboard</Link>
        </nav>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
