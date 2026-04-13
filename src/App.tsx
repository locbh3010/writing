import { useState, useCallback } from "react";
import WritingCanvas from "./components/WritingCanvas";
import ReferencePanel from "./components/ReferencePanel";
import PreviewModal from "./components/PreviewModal";

export default function App() {
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = useCallback(() => setPreviewOpen(true), []);
  const closePreview = useCallback(() => setPreviewOpen(false), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 font-sans">
      {/* Header */}
      <header className="py-6 text-center select-none">
        <h1 className="text-3xl font-bold text-stone-800 tracking-tight font-serif">
          書道
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Handwriting Practice · 書き取り練習
        </p>
      </header>

      {/* Main grid — 2-col on desktop, stacked on mobile */}
      <main className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left / Top — Reference */}
          <section id="reference-section" className="flex justify-center">
            <ReferencePanel />
          </section>

          {/* Right / Bottom — Canvas */}
          <section id="canvas-section" className="flex justify-center">
            <WritingCanvas onOpenPreview={openPreview} />
          </section>
        </div>
      </main>

      {/* Preview Modal */}
      <PreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
}
