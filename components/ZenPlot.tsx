"use client";
import ZenAsset from "./ZenAsset";

export default function ZenPlot({ month, plotIndex, gardenData, setGardenData, selectedTool }: any) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'eraser') {
      // Remove elements near the click
      setGardenData(gardenData.filter((el: any) => {
        const dx = (el.x % 280) - x;
        const dy = el.y - y;
        return Math.sqrt(dx*dx + dy*dy) > 20;
      }));
      return;
    }

    const newElement = {
      id: Date.now(),
      type: selectedTool,
      x: x + (plotIndex * 280), // Global X coordinate across cards
      y: y,
    };
    setGardenData([...gardenData, newElement]);
  };

  return (
    <div 
      onClick={handleClick}
      className="min-w-[280px] h-[220px] rounded-2xl bg-[#f5f5f0] relative overflow-hidden cursor-crosshair border-2 border-dashed border-gray-200 group/zen"
      style={{ 
        backgroundImage: 'radial-gradient(#e5e5e0 1px, transparent 1px)',
        backgroundSize: '10px 10px'
      }}
    >
      {/* Garden Elements for this plot */}
      {gardenData.filter((el: any) => Math.floor(el.x / 280) === plotIndex).map((el: any) => (
        <div 
          key={el.id}
          className="absolute pointer-events-none"
          style={{ 
            left: el.x % 280, 
            top: el.y,
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <ZenAsset type={el.type} />
        </div>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-10 group-hover/zen:opacity-20 transition-opacity">
         <span className="font-black text-6xl uppercase">{month}</span>
      </div>
    </div>
  );
}