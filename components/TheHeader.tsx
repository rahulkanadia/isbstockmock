"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Swords, LogOut, Disc, Share2, UserCircle, X } from "lucide-react";
import ShareMenu from "./ShareMenu";

export default function TheHeader({ user, rival, gap, session, onMockLogin, isLoggedIn }: any) {
  const [scrolled, setScrolled] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      onMockLogin();
    } else {
      signIn("discord");
    }
  };

  const sliderPos = Math.min(Math.max(50 + (gap * 2.5), 5), 95); 

  return (
    <motion.header 
      ref={headerRef}
      initial={{ height: "7rem" }}
      animate={{ height: scrolled ? "5rem" : "7rem" }}
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 md:px-8 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm"
    >
      <div className="relative z-10 w-full max-w-[1800px] mx-auto h-full flex items-center justify-between">

        <div className="flex flex-col justify-center">
          <h1 className={cn("font-black tracking-tighter text-ink uppercase transition-all", scrolled ? "text-2xl" : "text-3xl md:text-4xl")}>
            ISB Stock Mock <span className="text-discord">2026</span>
          </h1>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center w-[50%] max-w-[600px]">
           <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 w-full flex flex-col gap-3 transition-transform hover:-translate-y-0.5 relative group z-20 shadow-sm">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 w-[35%]">
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden text-2xl">
                         {user?.isIndex ? (user.username.includes("Nifty") ? "🇮🇳" : "😶‍🌫️") : (user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-gray-400"/>)}
                      </div>
                      <span className="text-sm font-black text-gray-700 uppercase truncate">
                          {user?.isIndex ? user.username.split(' ')[0] : `@${user?.username}`}
                      </span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[30%]">
                      <div className="flex items-center gap-1">
                          <Swords size={14} className={cn(gap < 0 ? "text-danger" : "text-success")} />
                          <span className={cn("font-mono font-black text-xl leading-none", gap >= 0 ? "text-success" : "text-danger")}>
                              {gap > 0 ? "+" : ""}{gap.toFixed(2)}%
                          </span>
                      </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 w-[35%]">
                      <span className="text-sm font-black text-gray-700 uppercase truncate text-right">
                          {rival?.isIndex ? rival.username.split(' ')[0] : `@${rival?.username}`}
                      </span>
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden text-2xl">
                         {rival?.isIndex ? (rival.username.includes("Nifty") ? "🇮🇳" : "😶‍🌫️") : (rival?.image ? <img src={rival.image} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-gray-400"/>)}
                      </div>
                  </div>
              </div>

              <div className="w-full h-3 bg-gray-100 rounded-full relative shadow-inner overflow-visible">
                 <div className="absolute inset-0 rounded-full bg-gradient-to-r from-danger/20 via-gray-200 to-success/20" />
                 <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-400 z-0" />
                 <motion.div 
                   className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full shadow-md z-10", gap >= 0 ? "border-success" : "border-danger")}
                   animate={{ left: `${sliderPos}%` }} 
                 />
              </div>

              {/* TEARDROP NOTCH RESTORED */}
              {isLoggedIn && (
                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-12 h-6 bg-white border-b border-x border-gray-200 rounded-b-full flex items-center justify-center -mt-[1px] z-10 shadow-sm">
                    <ShareMenu targetRef={headerRef} fileName="rivalry_status.png" onOpenChange={setIsShareOpen} icon={
                      <div className={cn("p-1 rounded-full transition-all cursor-pointer", isShareOpen ? "bg-danger text-white" : "bg-gray-100 text-gray-400")} onClick={() => setIsShareOpen(!isShareOpen)}>
                        {isShareOpen ? <X size={12} /> : <Share2 size={12} />}
                      </div>
                    } />
                </div>
              )}
           </div>
        </div>

        <div className="flex flex-col items-end justify-center h-full min-w-[200px]">
          <AnimatePresence mode="wait">
              {session ? (
                 <motion.button key="in" onClick={() => (window.location.hostname.includes('localhost') ? onMockLogin() : signOut())} className="flex items-center gap-2 text-xs font-black uppercase text-discord">
                   Sign Out <LogOut size={12} />
                 </motion.button>
              ) : (
                <motion.div key="out" className="flex flex-col items-end gap-2">
                    <button onClick={handleLogin} className="flex items-center gap-2 bg-discord text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase shadow-float">
                        <Disc size={16} /> connect your discord avatar
                    </button>
                    <div className="text-[9px] font-bold uppercase text-gray-400 opacity-60">Login to feature your pick</div>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}