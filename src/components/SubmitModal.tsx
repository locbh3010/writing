import { useState, useCallback, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import type { StrokesData } from "../types";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  strokes: StrokesData;
}

export default function SubmitModal({
  isOpen,
  onClose,
  strokes,
}: SubmitModalProps) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(strokes);

  // Reset copied state when modal opens
  useEffect(() => {
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
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = json;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [json]);

  if (!isOpen) return null;

  return (
    <div
      id="submit-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800 font-serif">
            Stroke Data
          </h2>
          <button
            id="btn-close-submit"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700
                       transition-colors duration-150 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-stone-500">
            {strokes.length} stroke{strokes.length !== 1 ? "s" : ""} captured.
            Copy the JSON data below.
          </p>

          {/* JSON display */}
          <div className="relative">
            <textarea
              id="submit-json-output"
              readOnly
              value={json}
              className="w-full h-40 px-3 py-2 rounded-lg border border-stone-300 text-xs
                         font-mono bg-stone-50 text-stone-800
                         focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                         resize-none"
            />
          </div>

          {/* Copy button */}
          <button
            id="btn-copy-json"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold
                       transition-colors duration-150 cursor-pointer
                       bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
