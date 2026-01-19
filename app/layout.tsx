import "./globals.css";
import { ReactNode } from "react";
import { Header } from "./components/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
