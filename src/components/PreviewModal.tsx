import { X, Play, Code } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { drawRiceGrid } from "../utils/drawRiceGrid";

interface PreviewModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const PREVIEW_SIZE = 500;

export default function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [svgString, setSvgString] = useState("");
	const [renderSvg, setRenderSvg] = useState("");

	console.log("log");

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
		setRenderSvg(svgString);
	}, [svgString]);

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
					<h2 className="text-lg font-semibold text-stone-800 font-serif flex items-center gap-2">
						<Code size={20} className="text-violet-600" />
						SVG Preview
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
							Paste SVG paths from Vector Export
						</label>
						<textarea
							id="preview-svg-input"
							value={svgString}
							onChange={(e) => setSvgString(e.target.value)}
							placeholder='<g transform="translate(20, 480) scale(...)"><path d="..." /></g>'
							className="w-full h-32 px-3 py-2 rounded-lg border border-stone-300 text-sm
                         font-mono bg-stone-50 text-stone-800 placeholder:text-stone-400
                         focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400
                         resize-none transition-shadow duration-150"
						/>
					</div>

					{/* Render button */}
					<button
						id="btn-render-preview"
						onClick={handleRender}
						disabled={!svgString.trim()}
						className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold
                       bg-violet-600 text-white hover:bg-violet-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors duration-150 cursor-pointer"
					>
						<Play size={16} />
						Render Preview
					</button>

					{/* Preview SVG Canvas Wrapper */}
					<div className="flex justify-center">
						<div
							className="rounded-xl overflow-hidden shadow ring-1 ring-stone-200 bg-white relative"
							style={{
								width: PREVIEW_SIZE,
								height: PREVIEW_SIZE,
							}}
						>
							<canvas
								ref={canvasRef}
								width={PREVIEW_SIZE}
								height={PREVIEW_SIZE}
								className="absolute inset-0 pointer-events-none"
							/>
							<svg
								viewBox={`0 0 ${PREVIEW_SIZE} ${PREVIEW_SIZE}`}
								width={PREVIEW_SIZE}
								height={PREVIEW_SIZE}
								className="absolute inset-0 z-10"
								dangerouslySetInnerHTML={{ __html: renderSvg }}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
