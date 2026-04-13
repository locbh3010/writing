import { useRef, useState, useCallback, useEffect } from "react";
import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/getSvgPathFromStroke";
import { drawRiceGrid } from "../utils/drawRiceGrid";
import type { StrokesData } from "../types";
import { X, Play } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREVIEW_SIZE = 500;

const STROKE_OPTIONS = {
  size: 8,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t: number) => t,
  start: { taper: 0, cap: true },
  end: { taper: 0, cap: true },
} as const;

export default function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Draw rice grid when opened
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRiceGrid(ctx, canvas.width, canvas.height);
  }, [isOpen]);

  const handleRender = useCallback(() => {
    setError(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let parsed: StrokesData;
    try {
      parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) throw new Error("Data must be an array");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid JSON"
      );
      return;
    }

    // Redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRiceGrid(ctx, canvas.width, canvas.height);

    parsed.forEach((stroke) => {
      const outline = getStroke(stroke, STROKE_OPTIONS);
      const path = getSvgPathFromStroke(outline);
      if (!path) return;
      const p2d = new Path2D(path);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill(p2d);
    });
  }, [json]);

  if (!isOpen) return null;

  return (
    <div
      id="preview-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto
                    animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800 font-serif">
            Stroke Preview
          </h2>
          <button
            id="btn-close-preview"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700
                       transition-colors duration-150 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Textarea */}
          <div>
            <label
              htmlFor="preview-json-input"
              className="block text-sm font-medium text-stone-600 mb-1.5"
            >
              Paste JSON stroke data
            </label>
            <textarea
              id="preview-json-input"
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder='[[[100,200,0.5],[102,198,0.6],...],...]'
              className="w-full h-32 px-3 py-2 rounded-lg border border-stone-300 text-sm
                         font-mono bg-stone-50 text-stone-800 placeholder:text-stone-400
                         focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400
                         resize-none transition-shadow duration-150"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          {/* Render button */}
          <button
            id="btn-render-preview"
            onClick={handleRender}
            disabled={!json.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold
                       bg-violet-600 text-white hover:bg-violet-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors duration-150 cursor-pointer"
          >
            <Play size={16} />
            Render Preview
          </button>

          {/* Preview Canvas */}
          <div className="flex justify-center">
            <div className="rounded-xl overflow-hidden shadow ring-1 ring-stone-200 bg-white">
              <canvas
                id="preview-canvas"
                ref={canvasRef}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                className="block max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
