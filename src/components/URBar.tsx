import { useEffect, useRef } from "react";
import { HIT_WINDOWS } from "../engine/timingConfig";

type Props = {
	recentOffsetsMsRef: React.RefObject<number[]>;
};

const URBar = ({ recentOffsetsMsRef }: Props) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext("2d")!;

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
		};

		resize();
		window.addEventListener("resize", resize);

		const maxVisual = 120; // visual zoom range

		const draw = () => {
			const width = canvas.width;
			const height = canvas.height;
			const centerX = width / 2;

			const offsets = [...recentOffsetsMsRef.current];

			ctx.clearRect(0, 0, width, height);

			// Background
			ctx.fillStyle = "#111";
			ctx.fillRect(0, 0, width, height);

			const scale = (ms: number) => (ms / maxVisual) * (width / 2);

			// ----- Hit Windows -----

			// MEH (largest)
			ctx.fillStyle = "#333";
			ctx.fillRect(
				centerX - scale(HIT_WINDOWS.MEH),
				0,
				scale(HIT_WINDOWS.MEH) * 2,
				height
			);

			// GOOD
			ctx.fillStyle = "#555";
			ctx.fillRect(
				centerX - scale(HIT_WINDOWS.GOOD),
				0,
				scale(HIT_WINDOWS.GOOD) * 2,
				height
			);

			// PERFECT (smallest)
			ctx.fillStyle = "#777";
			ctx.fillRect(
				centerX - scale(HIT_WINDOWS.PERFECT),
				0,
				scale(HIT_WINDOWS.PERFECT) * 2,
				height
			);

			// Center line
			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(centerX, 0);
			ctx.lineTo(centerX, height);
			ctx.stroke();

			// ----- Draw Hits -----

			offsets.forEach((offset, index) => {
				const x = centerX + scale(offset);
				const abs = Math.abs(offset);

				let color = "#3ddc97"; // PERFECT default

				if (abs > HIT_WINDOWS.PERFECT) color = "#f4d35e"; // GOOD
				if (abs > HIT_WINDOWS.GOOD) color = "#ff8c42"; // MEH
				if (abs > HIT_WINDOWS.MEH) color = "#ff4d6d"; // miss

				// Fade older hits
				const alpha = offsets.length > 0 ? (index + 1) / offsets.length : 1;

				ctx.globalAlpha = alpha;

				ctx.strokeStyle = color;
				ctx.lineWidth = 2;

				ctx.beginPath();
				ctx.moveTo(x, height * 0.25);
				ctx.lineTo(x, height * 0.75);
				ctx.stroke();
			});

			ctx.globalAlpha = 1;

			// ----- Draw Mean (Bias Line) -----
			if (offsets.length > 0) {
				const mean = offsets.reduce((a, b) => a + b, 0) / offsets.length;

				const meanX = centerX + scale(mean);

				ctx.strokeStyle = "#00bfff";
				ctx.lineWidth = 2;

				ctx.beginPath();
				ctx.moveTo(meanX, 0);
				ctx.lineTo(meanX, height);
				ctx.stroke();
			}

			rafRef.current = requestAnimationFrame(draw);
		};

		rafRef.current = requestAnimationFrame(draw);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			window.removeEventListener("resize", resize);
		};
	}, [recentOffsetsMsRef]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: "100%",
				height: "80px",
				borderRadius: "8px",
				border: "1px solid #333",
			}}
		/>
	);
};

export default URBar;
