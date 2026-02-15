import { useEffect, useRef } from "react";

type Props = {
	msPerGrid: number;
	lastOffsetRef: React.RefObject<number | null>;
	sessionStartRef: React.RefObject<number>;
	isRunning: boolean;
};

type ActiveNote = {
	spawnTime: number;
};

const DEFAULT_PATTERN = [1, 1, 1, 1, 1, 0, 0, 0];

export default function VisualizerCanvas({
	msPerGrid,
	lastOffsetRef,
	sessionStartRef,
	isRunning,
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext("2d")!;

		const travelGrids = 4;
		const travelTime = msPerGrid * travelGrids;

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
		};

		resize();
		window.addEventListener("resize", resize);

		let activeNotes: ActiveNote[] = [];
		let lastGridIndex = -1;

		const draw = () => {
			const styles = getComputedStyle(document.documentElement);
			const surface = styles.getPropertyValue("--surface").trim();
			const accent = styles.getPropertyValue("--accent").trim();
			const early = styles.getPropertyValue("--early").trim();
			const late = styles.getPropertyValue("--late").trim();
			const perfect = styles.getPropertyValue("--perfect").trim();

			const width = canvas.width;
			const height = canvas.height;
			const centerX = width / 2;
			const centerY = height / 2;
			const startX = width * 0.1;

			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = surface;
			ctx.fillRect(0, 0, width, height);

			// Always draw center circle
			ctx.lineWidth = 3;
			ctx.strokeStyle = accent;
			ctx.beginPath();
			ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
			ctx.stroke();

			if (isRunning) {
				const now = performance.now();
				const elapsedSinceStart = now - sessionStartRef.current;
				const gridIndex = Math.floor(elapsedSinceStart / msPerGrid);

				// Spawn notes
				if (gridIndex !== lastGridIndex) {
					lastGridIndex = gridIndex;

					const patternIndex = gridIndex % DEFAULT_PATTERN.length;

					if (DEFAULT_PATTERN[patternIndex] === 1) {
						activeNotes.push({
							spawnTime: now,
						});
					}
				}

				// Draw notes
				activeNotes = activeNotes.filter((note) => {
					const elapsed = now - note.spawnTime;
					const progress = elapsed / travelTime;

					if (progress >= 1) return false;

					const x = startX + progress * (centerX - startX);

					ctx.fillStyle = accent;
					ctx.beginPath();
					ctx.arc(x, centerY, 20, 0, Math.PI * 2);
					ctx.fill();

					return true;
				});

				// Hit feedback
				const offset = lastOffsetRef.current;
				if (offset != null) {
					const absOffset = Math.abs(offset);
					let color = perfect;

					if (absOffset > msPerGrid * 0.15) {
						color = offset < 0 ? early : late;
					}

					ctx.globalAlpha = 0.4;
					ctx.fillStyle = color;
					ctx.beginPath();
					ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
					ctx.fill();
					ctx.globalAlpha = 1;
				}
			}

			rafRef.current = requestAnimationFrame(draw);
		};

		rafRef.current = requestAnimationFrame(draw);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			window.removeEventListener("resize", resize);
		};
	}, [msPerGrid, lastOffsetRef, sessionStartRef, isRunning]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: "100%",
				height: "250px",
				borderRadius: "12px",
				border: "1px solid var(--border)",
			}}
		/>
	);
}
