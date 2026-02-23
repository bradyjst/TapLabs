import { useEffect, useRef } from "react";
import { getHitWindows } from "../../engine/timingConfig";

type Props = {
	recentOffsetsMsRef: React.RefObject<number[]>;
	od: number;
};

const URBar = ({ recentOffsetsMsRef, od }: Props) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const smoothedMeanRef = useRef(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const maxVisual = 120;

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
		};

		resize();
		window.addEventListener("resize", resize);

		const draw = () => {
			const width = canvas.width;
			const height = canvas.height;
			const centerX = width / 2;

			const offsets = recentOffsetsMsRef.current ?? [];
			const windows = getHitWindows(od);

			// Pull theme colors INSIDE draw (so theme changes apply, and no SSR/module weirdness)
			const rootStyles = getComputedStyle(document.documentElement);
			const perfectColor =
				rootStyles.getPropertyValue("--perfect").trim() || "#3ddc97";
			const goodColor =
				rootStyles.getPropertyValue("--good").trim() || "#ffd166";
			const mehColor = rootStyles.getPropertyValue("--meh").trim() || "#ff5c7a";
			const borderColor =
				rootStyles.getPropertyValue("--border").trim() ||
				"rgba(255,255,255,0.2)";

			const scale = (ms: number) => (ms / maxVisual) * (width / 2);

			// Clear
			ctx.clearRect(0, 0, width, height);

			// Background (subtle vertical gradient)
			{
				const bg = ctx.createLinearGradient(0, 0, 0, height);
				bg.addColorStop(0, "#0b0c10");
				bg.addColorStop(1, "#10121a");
				ctx.fillStyle = bg;
				ctx.fillRect(0, 0, width, height);
			}

			// Subtle grid
			ctx.strokeStyle = "rgba(255,255,255,0.05)";
			ctx.lineWidth = 1;
			for (let ms = -maxVisual; ms <= maxVisual; ms += 30) {
				const x = centerX + scale(ms);
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, height);
				ctx.stroke();
			}

			// Glow windows (MEH -> GOOD -> PERFECT)
			const drawWindow = (ms: number, color: string, alpha: number) => {
				const half = scale(ms);
				const g = ctx.createLinearGradient(
					centerX - half,
					0,
					centerX + half,
					0
				);
				g.addColorStop(0, "transparent");
				g.addColorStop(0.5, color);
				g.addColorStop(1, "transparent");

				ctx.globalAlpha = alpha;
				ctx.fillStyle = g;
				ctx.fillRect(centerX - half, 0, half * 2, height);
				ctx.globalAlpha = 1;
			};

			drawWindow(windows.MEH, mehColor, 0.08);
			drawWindow(windows.GOOD, goodColor, 0.1);
			drawWindow(windows.PERFECT, perfectColor, 0.12);

			// Center line (clean + slightly glowing)
			ctx.save();
			ctx.strokeStyle = borderColor;
			ctx.lineWidth = 2;
			ctx.shadowColor = "rgba(255,255,255,0.15)";
			ctx.shadowBlur = 6;
			ctx.beginPath();
			ctx.moveTo(centerX, 0);
			ctx.lineTo(centerX, height);
			ctx.stroke();
			ctx.restore();

			// Hits (newest brightest)
			for (let i = 0; i < offsets.length; i++) {
				const offset = offsets[i];
				const abs = Math.abs(offset);
				const x = centerX + scale(offset);

				// Correct grading logic:
				// inside PERFECT => perfectColor
				// else if inside GOOD => goodColor
				// else if inside MEH => mehColor
				// else => mehColor (or you can make it darker)
				let color = mehColor;
				if (abs <= windows.PERFECT) color = perfectColor;
				else if (abs <= windows.GOOD) color = goodColor;
				else if (abs <= windows.MEH) color = mehColor;

				const alpha = offsets.length > 0 ? 1 - i / offsets.length : 1;

				ctx.save();
				ctx.globalAlpha = alpha;
				ctx.strokeStyle = color;
				ctx.lineWidth = 3;
				ctx.shadowColor = color;
				ctx.shadowBlur = 10;

				ctx.beginPath();
				ctx.moveTo(x, height * 0.2);
				ctx.lineTo(x, height * 0.8);
				ctx.stroke();

				ctx.restore();
			}

			// Mean line (smoothed)
			if (offsets.length > 0) {
				const rawMean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
				smoothedMeanRef.current += (rawMean - smoothedMeanRef.current) * 0.12;

				const meanX = centerX + scale(smoothedMeanRef.current);

				ctx.save();
				ctx.strokeStyle = "#00bfff";
				ctx.lineWidth = 3;
				ctx.shadowColor = "#00bfff";
				ctx.shadowBlur = 12;
				ctx.beginPath();
				ctx.moveTo(meanX, 0);
				ctx.lineTo(meanX, height);
				ctx.stroke();
				ctx.restore();
			}

			rafRef.current = requestAnimationFrame(draw);
		};

		rafRef.current = requestAnimationFrame(draw);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			window.removeEventListener("resize", resize);
		};
	}, [recentOffsetsMsRef, od]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: "100%",
				height: "80px",
				borderRadius: "10px",
				border: "1px solid var(--border)",
				display: "block",
			}}
		/>
	);
};

export default URBar;
