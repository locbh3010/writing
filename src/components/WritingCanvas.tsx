import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import HanziWriter from "hanzi-writer";
import { drawRiceGrid } from "../utils/drawRiceGrid";
import SubmitModal from "./SubmitModal";
import {
  Undo2,
  Trash2,
  Send,
  Download,
  Eye,
  Play,
} from "lucide-react";

interface WritingCanvasProps {
  onOpenPreview: () => void;
  selectedChar: string;
}

const CANVAS_SIZE = 500;



export default function WritingCanvas({ onOpenPreview, selectedChar }: WritingCanvasProps) {
  const tracingRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  
  const [completedPaths, setCompletedPaths] = useState<string[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);

  const startQuiz = useCallback(async (initialCount = 0) => {
    if (!writerRef.current) return;
    
    writerRef.current.cancelQuiz();
    writerRef.current.hideCharacter();
    
    writerRef.current.quiz({
      onCorrectStroke: async (strokeData) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const charData = await HanziWriter.loadCharacterData(selectedChar) as any;
        const perfectPath = charData?.strokes?.[strokeData.strokeNum];
        if (perfectPath) {
          setCompletedPaths((prev) => {
            // Only add if it's the next stroke (prevents duplicates)
            if (prev.length === strokeData.strokeNum) {
              return [...prev, perfectPath];
            }
            return prev;
          });
        }
      },
    });

    // Fast-forward to the previous state
    for (let i = 0; i < initialCount; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (writerRef.current as any).skipQuizStroke();
    }
  }, [selectedChar]);

  // ── Auto-reset and Start Quiz when character changes ────────────────
  useEffect(() => {
    setCompletedPaths([]);
    if (writerRef.current) {
       startQuiz(0);
    }
  }, [selectedChar, startQuiz]);

  // ── HanziWriter Instance ───────────────────────
  useEffect(() => {
    if (!tracingRef.current) return;
    
    let isMounted = true;
    const initWriter = async () => {
      try {
        await HanziWriter.loadCharacterData(selectedChar);
        if (!isMounted || !tracingRef.current) return;

        tracingRef.current.innerHTML = "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options: any = {
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          padding: 20,
          strokeColor: "#1c1917", 
          outlineColor: "#f5f5f4",
          showOutline: true,
          showCharacter: false, 
          highlightOnMistake: true, 
          highlightColor: "#f43f5e", 
          drawingWidth: 20,
          lenience: 2.0, 
          showHintAfterMisses: 1,
          drawingFadeDuration: 300,
          drawingStokeFadeDuration: 300,
        };
        writerRef.current = HanziWriter.create(tracingRef.current, selectedChar, options);

        // HanziWriter handles the SVG overlay natively.
        startQuiz(completedPaths.length);

      } catch (err) {
        console.error("Failed to load character data:", err);
      }
    };

    initWriter();

    return () => {
      isMounted = false;
      writerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChar, startQuiz]); // Only re-init when selectedChar changes. Wait, if startQuiz changes, it re-inits!
  // We need to remove startQuiz from dependency if it causes double init, but it has selectedChar as dep, so it's fine.

  const handleUndo = () => {
    if (completedPaths.length === 0) return;
    const newCount = completedPaths.length - 1;
    setCompletedPaths((prev) => prev.slice(0, -1));
    startQuiz(newCount);
  };

  const handleClear = () => {
    setCompletedPaths([]);
    startQuiz(0);
  };

  const handleAnimate = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter({
        onComplete: () => {
          startQuiz(completedPaths.length);
        }
      });
    }
  };

  const handleExportJPG = useCallback(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_SIZE; offscreen.height = CANVAS_SIZE;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;
    
    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Grid
    drawRiceGrid(ctx, CANVAS_SIZE, CANVAS_SIZE);

    // Draw completed paths
    const scale = (CANVAS_SIZE - 2 * 20) / 1024;
    ctx.save();
    ctx.translate(20, CANVAS_SIZE - 20);
    ctx.scale(scale, -scale);
    completedPaths.forEach((path) => {
      const p2d = new Path2D(path);
      ctx.fillStyle = "#1c1917";
      ctx.fill(p2d);
    });
    ctx.restore();

    const link = document.createElement("a");
    link.download = `writing-${selectedChar}-${Date.now()}.jpg`;
    link.href = offscreen.toDataURL("image/jpeg", 0.95);
    link.click();
  }, [completedPaths, selectedChar]);

  const gridCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = gridCanvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    drawRiceGrid(ctx, cvs.width, cvs.height);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[500px]">
      {/* Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-stone-200 bg-white group cursor-crosshair">
        {/* Background Grid Layer */}
        <canvas
          ref={gridCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 pointer-events-none"
        />
        {/* HanziWriter Native Interactive Layer */}
        <div 
          ref={tracingRef}
          className="w-full h-full relative z-10"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, touchAction: "none" }}
        />
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
        <button
          onClick={handleUndo}
          disabled={completedPaths.length === 0}
          className="flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider
                     bg-white text-stone-600 hover:bg-stone-50 border border-stone-200
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Undo2 size={18} />
          Undo
        </button>

        <button
          onClick={handleClear}
          className="flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider
                     bg-white text-red-500 hover:bg-red-50 border border-stone-200 transition-all"
        >
          <Trash2 size={18} />
          Clear
        </button>

        <button
          onClick={handleAnimate}
          className="flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider
                     bg-white text-amber-600 hover:bg-amber-50 border border-stone-200 transition-all"
        >
          <Play size={18} />
          Demo
        </button>

        <button
          onClick={onOpenPreview}
          className="flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider
                     bg-white text-violet-600 hover:bg-violet-50 border border-stone-200 transition-all"
        >
          <Eye size={18} />
          View
        </button>

        <button
          onClick={handleExportJPG}
          disabled={completedPaths.length === 0}
          className="flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider
                     bg-white text-sky-600 hover:bg-sky-50 border border-stone-200 transition-all"
        >
          <Download size={18} />
          Save
        </button>

        <button
          onClick={() => setSubmitOpen(true)}
          disabled={completedPaths.length === 0}
          className="flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider
                     bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
        >
          <Send size={18} />
          Data
        </button>
      </div>

      <SubmitModal
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        completedPaths={completedPaths}
      />
    </div>
  );
}
