"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isDev = process.env.NODE_ENV === "development";
  const isAdminRoute = pathname?.startsWith("/admin");

  const handleLogin = () => {
    signIn("discord", { callbackUrl: "/dashboard" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-24 bg-[#FAF9F6]/90 backdrop-blur-sm border-b border-zinc-200/50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        <Link href="/" className="flex flex-col justify-center group">
          <div className="font-bold text-xl tracking-tight text-zinc-900 group-hover:opacity-80 transition-opacity">
            ISB Stock Mock <span className="text-purple-600">2026</span>
          </div>
          <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase mt-0.5">
            Monthly Competition
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              {/* ADMIN BUTTON LOGIC */}
              {isAdminRoute ? (
                <Link href="/dashboard">
                  <button className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                    Dashboard
                  </button>
                </Link>
              ) : (
                (isDev || (session.user as any)?.isAdmin) && (
                  <Link href="/admin">
                    <button className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors border border-transparent hover:border-zinc-200 rounded-lg">
                      Admin
                    </button>
                  </Link>
                )
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-5 py-2 text-sm font-bold bg-white text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="px-6 py-2.5 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Login with Discord
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
