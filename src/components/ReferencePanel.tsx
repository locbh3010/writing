import HanziWriterRef from "./HanziWriterRef";

const PRACTICE_CHARACTERS = ["永", "和", "書", "道", "愛", "福", "龍", "春"];

interface ReferencePanelProps {
  selectedChar: string;
  onSelectChar: (char: string) => void;
}

export default function ReferencePanel({ selectedChar, onSelectChar }: ReferencePanelProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      <div className="w-full">
        <h2 className="text-sm font-semibold text-stone-400 tracking-[0.2em] uppercase mb-4 text-center">
          Reference Character
        </h2>
        <HanziWriterRef character={selectedChar} size={320} />
      </div>

      <div className="w-full bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-stone-200/60 shadow-sm">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
          Select Character to Practice
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {PRACTICE_CHARACTERS.map((char) => (
            <button
              key={char}
              onClick={() => onSelectChar(char)}
              className={`
                h-12 w-12 rounded-xl flex items-center justify-center text-xl font-serif transition-all
                ${
                  selectedChar === char
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                }
              `}
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
