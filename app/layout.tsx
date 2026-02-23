// [1]
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
// Why: Next.js 15 optimizes external fonts automatically at build time.
// How: We initialize the fonts and bind them to CSS variables for Tailwind 4.
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});
// [11]
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains", 
});
// Why: The RootLayout is a mandatory Server Component that wraps all pages.
// How: It injects global contexts (like NextAuth via Providers) down to Client Components.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
// [21]
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
// [31]