import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers"; // <--- Import the file you just created

export const metadata: Metadata = {
  title: "ISB Stock Mock 2026",
  description: "Monthly stock trading competition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Note: We removed the Geist font reference as requested earlier */}
      <body className="font-sans antialiased bg-[#FAF9F6] text-zinc-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}