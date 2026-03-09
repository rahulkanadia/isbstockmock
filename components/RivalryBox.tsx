"use client";
import { useState, useEffect, useRef } from "react";
import { Swords, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";
import { CLASH_PROMPTS, GENERATIVE_SERVICES } from "@/lib/prompts";

export default function RivalryBox({ leftActor, rightActor, activeUser, isShareOpen, setIsShareOpen }: any) {
  // Attached to the outermost wrapper so nothing gets clipped
  const rivalryRef = useRef<HTMLDivElement>(null);
  
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const gap = (leftActor?.seasonReturn || 0) - (rightActor?.seasonReturn || 0);

  const formatReturn = (val: number) => {
    if (val === 0) return "0.0%";
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      setIsLoading(true);
      setHasFailed(false);
      
      let pool: { service: any, model: string }[] = [];
      GENERATIVE_SERVICES.forEach(service => {
        service.models.forEach(model => {
          pool.push({ service, model });
        });
      });
      pool = pool.sort(() => Math.random() - 0.5);

      const randomPrompt = CLASH_PROMPTS[Math.floor(Math.random() * CLASH_PROMPTS.length)];
      const finalPrompt = randomPrompt
        .replace('{user1}', leftActor?.username || 'player1')
        .replace('{user2}', rightActor?.username || 'player2');

      let success = false;

      for (const { service, model } of pool) {
        if (!isMounted) break;
        try {
          const url = service.buildUrl(finalPrompt, model);
          const headers: any = { 'Accept': 'image/jpeg, image/png' };
          
          if (service.name === "pollinations" && process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY) {
            headers['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY}`;
          }

          const res = await fetch(url, { method: 'GET', headers });
          if (!res.ok) throw new Error(`${service.name} - ${model} failed`);
          
          const blob = await res.blob();
          if (isMounted) {
            const objectUrl = URL.createObjectURL(blob);
            setImageBlobUrl(objectUrl);
            setIsLoading(false);
            success = true;
            break; 
          }
        } catch (err) {
          continue;
        }
      }

      if (!success && isMounted) {
        setIsLoading(false);
        setHasFailed(true);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl);
    };
  }, [leftActor?.username, rightActor?.username, retryTrigger]);

  const handleDownloadRawImage = () => {
    if (!imageBlobUrl) return;
    const a = document.createElement("a");
    a.href = imageBlobUrl;
    a.download = `rivalry-${leftActor?.username || 'p1'}-vs-${rightActor?.username || 'p2'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const leftHealth = gap >= 0 ? 100 : Math.max(10, 100 - Math.abs(gap) * 2);
  const rightHealth = gap <= 0 ? 100 : Math.max(10, 100 - gap * 2);

  const leftPick = leftActor?.isIndex ? "INDEX" : (leftActor?.pick?.symbol?.split('.')[0] || "---");
  const rightPick = rightActor?.isIndex ? "INDEX" : (rightActor?.pick?.symbol?.split('.')[0] || "---");

  const safeShadow = { textShadow: '0px 2px 4px rgba(0,0,0,0.9)' };

  return (
    // OUTERMOST WRAPPER: Acts as the camera frame. Overflow is visible so popups work!
    <div ref={rivalryRef} className="w-full h-full relative overflow-visible group">
      
      {/* INNER CARD: Contains the rounded corners and overflow hidden. 
          Strips them away when the outer wrapper gets data-capture="true" 
      */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-ink bg-ink z-0 group-data-[capture=true]:rounded-none group-data-[capture=true]:border-none group-data-[capture=true]:shadow-none">
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ink text-white/50 gap-3">
            <Loader2 className="animate-spin text-white/60" size={24} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Summoning Fighters...</span>
          </div>
        )}

        {/* Background Image */}
        {imageBlobUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${imageBlobUrl})` }}
          />
        )}

        {/* Top UI Overlay */}
        <div className="absolute inset-x-0 top-0 z-30 p-5 flex items-start justify-between pointer-events-none">
            
            {/* Left Player */}
            <div className="flex flex-col items-start gap-1 w-[38%] min-w-0 text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 leading-none" style={safeShadow}>PLAYER</span>
                <h4 className="font-black text-base uppercase tracking-tighter text-white leading-none truncate w-full" style={safeShadow}>
                  @{leftActor?.username}
                </h4>
                
                <div className="w-full h-4 bg-black/50 rounded-full mt-1 border border-white/20 overflow-hidden shadow-inner flex items-center justify-start relative px-2">
                   <div className="absolute inset-y-0 left-0 bg-green-700/80 transition-all duration-500 ease-out rounded-r-full" style={{ width: `${leftHealth}%` }} />
                   <span className="relative z-10 font-mono font-bold text-[9px] text-white tracking-widest truncate" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.9)' }}>
                      {leftPick}
                   </span>
                </div>
            </div>

            {/* Center Gap Stats */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40 bg-black/80 px-3 py-1.5 rounded-full border border-white/20 shadow-xl min-w-[90px] justify-center pointer-events-auto">
                <Swords size={12} className="text-white/60 shrink-0" />
                <span className={cn("font-black font-mono text-base leading-none", gap >= 0 ? "text-success" : "text-danger")} style={safeShadow}>
                    {formatReturn(gap)}
                </span>
                <Swords size={12} className="text-white/60 shrink-0 transform scale-x-[-1]" />
            </div>

            {/* Right Opponent */}
            <div className="flex flex-col items-end gap-1 w-[38%] min-w-0 text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70 leading-none" style={safeShadow}>OPPONENT</span>
                <h4 className="font-black text-base uppercase tracking-tighter text-white leading-none truncate w-full" style={safeShadow}>
                  @{rightActor?.username}
                </h4>

                <div className="w-full h-4 bg-black/50 rounded-full mt-1 border border-white/20 overflow-hidden shadow-inner flex items-center justify-end relative px-2">
                   <div className="absolute inset-y-0 right-0 bg-red-600/80 transition-all duration-500 ease-out rounded-l-full" style={{ width: `${rightHealth}%` }} />
                   <span className="relative z-10 font-mono font-bold text-[9px] text-white tracking-widest truncate" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.9)' }}>
                      {rightPick}
                   </span>
                </div>
            </div>
        </div>

        {/* Capture Watermark (ONLY visible in the final exported image) */}
        <div className="hidden group-data-[capture=true]:flex absolute inset-x-0 bottom-6 items-center justify-center z-50 pointer-events-none">
            <span className="text-[11px] font-mono font-bold text-white tracking-[0.2em] opacity-90" style={safeShadow}>
                ISBSTOCKMOCK.VERCEL.APP
            </span>
        </div>
      </div>

      {/* INTERACTIVE BOTTOM BAND - Now a sibling of the inner card. No overflow clipping! */}
      <div className="absolute inset-x-0 bottom-0 h-8 flex justify-between items-end z-[100] pointer-events-none group-data-[capture=true]:hidden">
          
          {/* Part 1: Share (Button only, no text) */}
          <div className="pointer-events-auto h-8 bg-black/80 rounded-tr-lg border-t border-r border-white/10 flex items-center justify-center px-3 shadow-lg" style={{ borderBottomLeftRadius: '1rem' }}>
              <ShareMenu targetRef={rivalryRef} fileName="rivalry_card.jpg" />
          </div>

          {/* Part 3: Download Background */}
          <div 
             onClick={handleDownloadRawImage}
             className="pointer-events-auto h-8 px-3 bg-black/80 rounded-tl-lg border-t border-l border-white/10 hover:bg-black transition-colors flex items-center justify-center cursor-pointer shadow-lg"
             style={{ borderBottomRightRadius: '1rem' }}
          >
              <span className="text-[9px] font-black uppercase tracking-widest text-white/70 mt-[1px]">
                  click here to download the background
              </span>
          </div>
      </div>

      {/* Outside Left: Reload Background Link */}
      <div className="absolute -bottom-6 left-2 z-[100] group-data-[capture=true]:hidden">
          <button 
            disabled={!hasFailed || isLoading}
            onClick={() => setRetryTrigger(prev => prev + 1)}
            className={cn(
              "text-[9px] font-black uppercase tracking-widest transition-all outline-none",
              hasFailed 
                ? "text-danger hover:underline cursor-pointer drop-shadow-sm" 
                : "text-gray-500 cursor-not-allowed opacity-50 line-through"
            )}
          >
            reload background on fail
          </button>
      </div>

      {/* Outside Right: Pick your opponent */}
      <div className="absolute -bottom-6 right-2 z-[100] group-data-[capture=true]:hidden">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#5865F2] drop-shadow-sm">
            pick your opponent from roster --&gt;
          </span>
      </div>
    </div>
  );
}