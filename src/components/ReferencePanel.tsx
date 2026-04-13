export default function ReferencePanel() {
	return (
		<div className="flex flex-col items-center gap-3">
			<h2 className="text-sm font-medium text-stone-500 tracking-wide uppercase">
				Reference Character
			</h2>
			<div className="rounded-xl overflow-hidden shadow-lg ring-1 ring-stone-300/50">
				<img
					src="https://i.pinimg.com/736x/03/bd/0a/03bd0a8b9931f423936a14e941f8413a.jpg"
					alt="Reference character for handwriting practice"
					className="block w-full max-w-[500px] h-auto"
					loading="lazy"
				/>
			</div>
		</div>
	);
}
