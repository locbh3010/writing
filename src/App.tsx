import { useState, useCallback } from "react";
import WritingCanvas from "./components/WritingCanvas";
import ReferencePanel from "./components/ReferencePanel";
import PreviewModal from "./components/PreviewModal";

export default function App() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedChar, setSelectedChar] = useState("永");

  const openPreview = useCallback(() => setPreviewOpen(true), []);
  const closePreview = useCallback(() => setPreviewOpen(false), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 font-sans">
      {/* Header */}
      <header className="py-8 text-center select-none">
        <h1 className="text-4xl font-bold text-stone-800 tracking-widest font-serif">
          書道
        </h1>
        <p className="mt-2 text-sm text-stone-400 font-medium tracking-widest uppercase">
          Handwriting Practice · 書き取り練習
        </p>
      </header>

      {/* Main grid — 2-col on desktop, stacked on mobile */}
      <main className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left / Top — Reference */}
          <section id="reference-section" className="flex justify-center">
            <ReferencePanel 
              selectedChar={selectedChar} 
              onSelectChar={setSelectedChar} 
            />
          </section>

          {/* Right / Bottom — Canvas */}
          <section id="canvas-section" className="flex justify-center">
            <WritingCanvas 
              onOpenPreview={openPreview} 
              selectedChar={selectedChar}
            />
          </section>
        </div>
      </main>

      {/* Preview Modal */}
      <PreviewModal isOpen={previewOpen} onClose={closePreview} />
    </div>
  );
}
