import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
} from "react";
import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/getSvgPathFromStroke";
import { drawRiceGrid } from "../utils/drawRiceGrid";
import type { StrokesData, Stroke } from "../types";
import SubmitModal from "./SubmitModal";
import {
  Undo2,
  Trash2,
  Send,
  Download,
  Eye,
} from "lucide-react";

interface WritingCanvasProps {
  onOpenPreview: () => void;
}

const CANVAS_SIZE = 500;

const STROKE_OPTIONS = {
  size: 8,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t: number) => t,
  start: { taper: 0, cap: true },
  end: { taper: 0, cap: true },
} as const;

export default function WritingCanvas({ onOpenPreview }: WritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<StrokesData>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const isDrawing = useRef(false);

  // ── Redraw everything ──────────────────────────────────────────────
  const redraw = useCallback(
    (
      allStrokes: StrokesData,
      activeStroke: Stroke | null,
      canvas?: HTMLCanvasElement | null
    ) => {
      const cvs = canvas ?? canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, cvs.width, cvs.height);
      drawRiceGrid(ctx, cvs.width, cvs.height);

      const renderStroke = (s: Stroke) => {
        const outline = getStroke(s, STROKE_OPTIONS);
        const path = getSvgPathFromStroke(outline);
        if (!path) return;
        const p2d = new Path2D(path);
        ctx.fillStyle = "#1a1a1a";
        ctx.fill(p2d);
      };

      allStrokes.forEach(renderStroke);
      if (activeStroke) renderStroke(activeStroke);
    },
    []
  );

  // Initial draw
  useEffect(() => {
    redraw(strokes, currentStroke);
  }, [redraw, strokes, currentStroke]);

  // ── Pointer handlers ───────────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      isDrawing.current = true;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const pressure = e.pressure || 0.5;

      setCurrentStroke([[x, y, pressure]]);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const pressure = e.pressure || 0.5;

      setCurrentStroke((prev) =>
        prev ? [...prev, [x, y, pressure]] : [[x, y, pressure]]
      );
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    setCurrentStroke((prev) => {
      if (prev && prev.length > 1) {
        setStrokes((s) => [...s, prev]);
      }
      return null;
    });
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        setStrokes((s) => s.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    setStrokes((s) => s.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitOpen(true);
  }, []);

  const handleExportJPG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an offscreen canvas with white background
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    // Draw only strokes (no grid)
    strokes.forEach((s) => {
      const outline = getStroke(s, STROKE_OPTIONS);
      const path = getSvgPathFromStroke(outline);
      if (!path) return;
      const p2d = new Path2D(path);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill(p2d);
    });

    const link = document.createElement("a");
    link.download = `handwriting-${Date.now()}.jpg`;
    link.href = offscreen.toDataURL("image/jpeg", 0.95);
    link.click();
  }, [strokes]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-stone-300/50 bg-white">
        <canvas
          id="writing-canvas"
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block cursor-crosshair max-w-full h-auto"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          id="btn-undo"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                     bg-stone-100 text-stone-700 hover:bg-stone-200
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-150 cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
          Undo
        </button>

        <button
          id="btn-clear"
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                     bg-red-50 text-red-600 hover:bg-red-100
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-150 cursor-pointer"
        >
          <Trash2 size={16} />
          Clear
        </button>

        <button
          id="btn-submit"
          onClick={handleSubmit}
          disabled={strokes.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                     bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-150 cursor-pointer"
        >
          <Send size={16} />
          Submit
        </button>

        <button
          id="btn-export"
          onClick={handleExportJPG}
          disabled={strokes.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                     bg-sky-50 text-sky-700 hover:bg-sky-100
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-150 cursor-pointer"
        >
          <Download size={16} />
          Export JPG
        </button>

        <button
          id="btn-preview"
          onClick={onOpenPreview}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                     bg-violet-50 text-violet-700 hover:bg-violet-100
                     transition-colors duration-150 cursor-pointer"
        >
          <Eye size={16} />
          Preview
        </button>
      </div>

      {/* Submit Modal */}
      <SubmitModal
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        strokes={strokes}
      />
    </div>
  );
}
