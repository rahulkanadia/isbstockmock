
"use client";
import { useState, useEffect, useRef } from "react";
import { Swords, X, Share2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";
import { CLASH_PROMPTS, POLLINATIONS_MODELS } from "@/lib/prompts";

export default function RivalryBox({ leftActor, rightActor, activeUser, isShareOpen, setIsShareOpen }: any) {
  const rivalryRef = useRef<HTMLDivElement>(null);
  
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const gap = (leftActor?.seasonReturn || 0) - (rightActor?.seasonReturn || 0);

  const formatReturn = (val: number) => {
    if (val === 0) return "0.0%";
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  const leftRetDisplay = formatReturn(leftActor?.seasonReturn || 0);
  const rightRetDisplay = formatReturn(rightActor?.seasonReturn || 0);

  // Fetch the image dynamically on mount or when users change
  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      setIsLoading(true);
      
      // Randomly select a prompt and model
      const randomPrompt = CLASH_PROMPTS[Math.floor(Math.random() * CLASH_PROMPTS.length)];
      const randomModel = POLLINATIONS_MODELS[Math.floor(Math.random() * POLLINATIONS_MODELS.length)];
      
      // Inject the usernames into the prompt
      const finalPrompt = randomPrompt
        .replace('{user1}', leftActor?.username || 'player1')
        .replace('{user2}', rightActor?.username || 'player2');

      const url = `https://gen.pollinations.ai/image/${encodeURIComponent(finalPrompt)}?model=${randomModel}&width=800&height=500&nologo=true`;
      
      try {
        const apiKey = process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'image/jpeg, image/png'
          }
        });

        if (!res.ok) throw new Error("Image generation failed");
        
        const blob = await res.blob();
        if (isMounted) {
          // Convert the raw data into a local URL the browser can display
          const objectUrl = URL.createObjectURL(blob);
          setImageBlobUrl(objectUrl);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load Rivalry image:", err);
        if (isMounted) setIsLoading(false); // Fails gracefully to a dark background
      }
    };

    fetchImage();

    // Cleanup function to prevent memory leaks from object URLs
    return () => {
      isMounted = false;
      if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl);
    };
  }, [leftActor?.username, rightActor?.username]); // Re-run if players change

  const leftHealth = gap >= 0 ? 100 : Math.max(10, 100 - Math.abs(gap) * 2);
  const rightHealth = gap <= 0 ? 100 : Math.max(10, 100 - gap * 2);

  return (
    <div ref={rivalryRef} className="w-full h-full relative group data-[capture=true]:pb-0 overflow-visible">
      
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-ink bg-ink">
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ink text-white/50 gap-3">
            <Loader2 className="animate-spin text-white/60" size={24} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Summoning Fighters...</span>
          </div>
        )}

        {/* Unified Clash Background Image */}
        {imageBlobUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-50 animate-in fade-in duration-1000" 
            style={{ backgroundImage: `url(${imageBlobUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-ink/30" />

        {/* Top UI Overlay */}
        <div className="absolute inset-x-0 top-0 z-30 p-5 flex items-start justify-between pointer-events-none">
            
            {/* Left Player */}
            <div className="flex flex-col items-start gap-1 w-[35%] min-w-0 text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 leading-none drop-shadow-md">PLAYER</span>
                <h4 className="font-black text-base uppercase tracking-tighter text-white leading-none drop-shadow-md truncate w-full">
                  @{leftActor?.username}
                </h4>
                
                <div className="w-full h-2.5 bg-ink/80 rounded-full mt-1 border border-white/20 overflow-hidden shadow-inner">
                   <div className="h-full bg-blue-500 transition-all duration-500 ease-out rounded-r-full" style={{ width: `${leftHealth}%` }} />
                </div>
            </div>

            {/* Center Gap Stats */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40 bg-ink/90 px-3 py-1.5 rounded-full border border-white/20 shadow-xl min-w-[90px] justify-center backdrop-blur-sm">
                <Swords size={12} className="text-white/60 shrink-0" />
                <span className={cn("font-black font-mono text-base leading-none drop-shadow-md", gap >= 0 ? "text-success" : "text-danger")}>
                    {formatReturn(gap)}
                </span>
                <Swords size={12} className="text-white/60 shrink-0 transform scale-x-[-1]" />
            </div>

            {/* Right Opponent */}
            <div className="flex flex-col items-end gap-1 w-[35%] min-w-0 text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 leading-none drop-shadow-md">OPPONENT</span>
                <h4 className="font-black text-base uppercase tracking-tighter text-white leading-none drop-shadow-md truncate w-full">
                  @{rightActor?.username}
                </h4>

                <div className="w-full h-2.5 bg-ink/80 rounded-full mt-1 border border-white/20 overflow-hidden shadow-inner flex justify-end">
                   <div className="h-full bg-red-500 transition-all duration-500 ease-out rounded-l-full" style={{ width: `${rightHealth}%` }} />
                </div>
            </div>
        </div>

        {/* Bottom Row Return Circles */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 py-5 flex items-end justify-between pointer-events-none">
            
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600 border-[3px] border-red-950 shadow-xl shrink-0">
                <span className="font-black font-mono text-base tracking-tighter text-white drop-shadow-md">
                  {leftRetDisplay}
                </span>
            </div>

            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-600 border-[3px] border-blue-950 shadow-xl shrink-0">
                <span className="font-black font-mono text-base tracking-tighter text-white drop-shadow-md">
                  {rightRetDisplay}
                </span>
            </div>
        </div>
      </div>

      {/* Center Bottom Share Menu */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-[100] group-data-[capture=true]:hidden">
          <div className="h-8 px-4 bg-ink border border-gray-600 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
              <ShareMenu targetRef={rivalryRef} fileName="rivalry_card.jpg" onOpenChange={setIsShareOpen} icon={
                <div className={cn("flex items-center gap-2 cursor-pointer transition-colors", isShareOpen ? "text-danger" : "text-white hover:text-gray-300")} onClick={() => setIsShareOpen(!isShareOpen)}>
                  {isShareOpen ? <X size={14} strokeWidth={3} /> : <><Share2 size={12} /> <span className="text-[9px] font-black uppercase tracking-widest">Share</span></>}
                </div>
              } />
          </div>
      </div>
    </div>
  );
}

