import { useState, useCallback, useEffect, useMemo } from "react";
import { X, Copy, Check, FileCode } from "lucide-react";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedPaths: string[];
}

export default function SubmitModal({
  isOpen,
  onClose,
  completedPaths,
}: SubmitModalProps) {
  const [copied, setCopied] = useState(false);

  // Convert points to SVG Paths and merge with completed perfect paths
  const svgPaths = useMemo(() => {
    // HanziWriter coordinate space is 1024x1024. Our canvas is 500x500 with padding 20.
    const scale = (500 - 2 * 20) / 1024;
    const transform = `translate(20, 480) scale(${scale}, ${-scale})`;
    
    const perfectPaths = completedPaths.map(
      d => `  <g transform="${transform}">\n    <path d="${d}" fill="#1c1917" />\n  </g>`
    );

    return perfectPaths.join("\n");
  }, [completedPaths]);

  // Reset copied state when modal opens
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setCopied(false);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(svgPaths);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = svgPaths;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [svgPaths]);

  if (!isOpen) return null;

  return (
    <div
      id="submit-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileCode size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800 font-serif">
                Vector Export
              </h2>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                SVG Elements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-200 text-stone-400 hover:text-stone-600 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500 font-medium">
              Generated <span className="text-emerald-600 font-bold">{completedPaths.length}</span> individual paths for your artwork.
            </p>
          </div>

          {/* SVG Path display */}
          <div className="relative group">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold bg-stone-800 text-white px-2 py-1 rounded">SVG</span>
            </div>
            <textarea
              readOnly
              value={svgPaths}
              className="w-full h-64 px-4 py-4 rounded-2xl border-2 border-stone-100 text-xs
                         font-mono bg-stone-50 text-stone-600 leading-relaxed
                         focus:outline-none focus:border-emerald-200
                         resize-none transition-all shadow-inner"
              placeholder="No paths generated yet..."
            />
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={!svgPaths}
            className={`
              w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold
              transition-all duration-300 cursor-pointer shadow-lg
              ${copied 
                ? "bg-emerald-500 text-white shadow-emerald-200" 
                : "bg-stone-900 text-white hover:bg-black shadow-stone-200 hover:-translate-y-0.5 active:translate-y-0"}
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
          >
            {copied ? (
              <>
                <Check size={18} strokeWidth={3} />
                Copied Path Data!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy SVG Paths to Clipboard
              </>
            )}
          </button>
        </div>
        
        <div className="p-4 bg-stone-50 text-center border-t border-stone-100">
          <p className="text-[10px] text-stone-400 font-medium">
            Paste this data into any SVG &lt;svg viewBox="0 0 500 500"&gt; tag to render your strokes.
          </p>
        </div>
      </div>
    </div>
  );
}
