import { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { Play, RotateCcw, Info } from "lucide-react";

interface HanziWriterRefProps {
  character: string;
  size?: number;
}

export default function HanziWriterRef({ character, size = 300 }: HanziWriterRefProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    writerRef.current = HanziWriter.create(containerRef.current, character, {
      width: size,
      height: size,
      padding: 20,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 200,
      strokeColor: "#1a1a1a",
      outlineColor: "#e5e5e5",
      showOutline: true,
    });

    return () => {
      // HanziWriter doesn't have a formal destroy, but clearing the ref is good practice
      writerRef.current = null;
    };
  }, [character, size]);

  const handleAnimate = () => {
    if (!writerRef.current || isAnimating) return;
    setIsAnimating(true);
    writerRef.current.animateCharacter({
      onComplete: () => setIsAnimating(false),
    });
  };

  const handleReset = () => {
    if (!writerRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (writerRef.current as any).cancelAnimations();
    writerRef.current.showCharacter();
    setIsAnimating(false);
  };

  const handleShowOutline = () => {
    if (!writerRef.current) return;
    writerRef.current.loopCharacterAnimation();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-2xl shadow-xl ring-1 ring-stone-200">
      {/* Target Character Container */}
      <div 
        ref={containerRef} 
        className="bg-stone-50 rounded-xl overflow-hidden border border-stone-100 flex items-center justify-center"
        style={{ width: size, height: size }}
      />

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleAnimate}
          disabled={isAnimating}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm font-medium"
        >
          <Play size={16} fill="currentColor" />
          Animate
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-all font-medium"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          onClick={handleShowOutline}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all font-medium"
          title="Loop Animation"
        >
          <Info size={16} />
          Loop
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">
          Stroke Order Reference
        </p>
      </div>
    </div>
  );
}
