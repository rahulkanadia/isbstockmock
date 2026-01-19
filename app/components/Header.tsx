"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-zinc-800 px-6 py-4 flex justify-between">
      <h1 className="text-lg font-semibold">
        Stock Pick League 🇮🇳
      </h1>

      {session ? (
        <Button variant="secondary" onClick={() => signOut()}>
          Logout
        </Button>
      ) : (
        <Button onClick={() => signIn("discord")}>
          Login with Discord
        </Button>
      )}
    </header>
  );
}
