import { useEffect, useRef } from "react";
import { getHitWindows } from "../engine/timingConfig";

type Props = {
	recentOffsetsMsRef: React.RefObject<number[]>;
	od: number;
};

const rootStyles = getComputedStyle(document.documentElement);

const perfectColor = rootStyles.getPropertyValue("--perfect").trim();
const goodColor = rootStyles.getPropertyValue("--good").trim();
const mehColor = rootStyles.getPropertyValue("--meh").trim();

const URBar = ({ recentOffsetsMsRef, od }: Props) => {
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

		const maxVisual = 120;

		const draw = () => {
			const width = canvas.width;
			const height = canvas.height;
			const centerX = width / 2;

			const offsets = [...recentOffsetsMsRef.current];
			const windows = getHitWindows(od);

			ctx.clearRect(0, 0, width, height);

			// Background
			ctx.fillStyle = "#111";
			ctx.fillRect(0, 0, width, height);

			const scale = (ms: number) => (ms / maxVisual) * (width / 2);

			// ----- Hit Windows -----

			// MEH
			ctx.fillStyle = "#2a2a2a";
			ctx.fillRect(
				centerX - scale(windows.MEH),
				0,
				scale(windows.MEH) * 2,
				height
			);

			// GOOD
			ctx.fillStyle = "#3a3a3a";
			ctx.fillRect(
				centerX - scale(windows.GOOD),
				0,
				scale(windows.GOOD) * 2,
				height
			);

			// PERFECT
			ctx.fillStyle = "#4a4a4a";
			ctx.fillRect(
				centerX - scale(windows.PERFECT),
				0,
				scale(windows.PERFECT) * 2,
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

				let color = perfectColor;

				if (abs > windows.PERFECT) color = perfectColor;
				if (abs > windows.GOOD) color = goodColor;
				if (abs > windows.MEH) color = mehColor;

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

			// ----- Mean Line -----

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
	}, [recentOffsetsMsRef, od]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: "100%",
				height: "80px",
				borderRadius: "8px",
				border: "1px solid var(--border)",
			}}
		/>
	);
};

export default URBar;
