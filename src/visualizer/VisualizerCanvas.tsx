import { useEffect, useRef } from "react";
import { HIT_WINDOWS } from "../engine/timingConfig";

type Props = {
	msPerGrid: number; // still used to calculate travelTime
	sessionStartRef: React.RefObject<number>;
	upcomingNotesRef: React.RefObject<number[]>;
	isRunning: boolean;
	registerHit: (offset: number, grade: 300 | 100 | 50) => void;
	registerMiss: () => void;
};

type ActiveNote = {
	id: number;
	scheduledTime: number;
	spawnTime: number;
};

export default function VisualizerCanvas({
	msPerGrid,
	upcomingNotesRef,
	isRunning,
	registerHit,
	registerMiss,
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext("2d")!;

		const travelTime = msPerGrid * 4; // visual preempt distance

		let activeNotes: ActiveNote[] = [];
		let noteId = 0;

		const handleTap = () => {
			if (!isRunning) return;

			const now = performance.now();
			if (activeNotes.length === 0) return;

			let closestIndex = -1;
			let smallestDelta = Infinity;

			activeNotes.forEach((note, index) => {
				const delta = Math.abs(now - note.scheduledTime);
				if (delta < smallestDelta) {
					smallestDelta = delta;
					closestIndex = index;
				}
			});

			if (closestIndex === -1) return;

			const note = activeNotes[closestIndex];
			const offset = now - note.scheduledTime;
			const abs = Math.abs(offset);

			let grade: 300 | 100 | 50 | null = null;

			if (abs <= HIT_WINDOWS.PERFECT) grade = 300;
			else if (abs <= HIT_WINDOWS.GOOD) grade = 100;
			else if (abs <= HIT_WINDOWS.MEH) grade = 50;

			if (grade !== null) {
				registerHit(offset, grade);
				activeNotes.splice(closestIndex, 1);
			}
		};

		const keyHandler = (e: KeyboardEvent) => {
			if (e.code === "KeyZ" || e.code === "KeyX") {
				handleTap();
			}
		};

		window.addEventListener("keydown", keyHandler);

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
		};

		resize();
		window.addEventListener("resize", resize);

		const draw = () => {
			const now = performance.now();

			const width = canvas.width;
			const height = canvas.height;
			const centerX = width / 2;
			const centerY = height / 2;
			const startX = width * 0.1;

			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = "#111";
			ctx.fillRect(0, 0, width, height);

			// Circle of truth
			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
			ctx.stroke();

			if (isRunning) {
				// 🔥 Spawn based on timestamp queue
				while (
					upcomingNotesRef.current.length > 0 &&
					upcomingNotesRef.current[0] - travelTime <= now
				) {
					const scheduledTime = upcomingNotesRef.current.shift()!;

					activeNotes.push({
						id: noteId++,
						scheduledTime,
						spawnTime: scheduledTime - travelTime,
					});
				}

				activeNotes = activeNotes.filter((note) => {
					// Miss detection
					if (now - note.scheduledTime > HIT_WINDOWS.MEH) {
						registerMiss();
						return false;
					}

					const progress = (now - note.spawnTime) / travelTime;

					if (progress < 0) return true;
					if (progress >= 1.2) return false;

					const x = startX + progress * (centerX - startX);

					ctx.fillStyle = "#3ddc97";
					ctx.beginPath();
					ctx.arc(x, centerY, 20, 0, Math.PI * 2);
					ctx.fill();

					return true;
				});
			}

			rafRef.current = requestAnimationFrame(draw);
		};

		rafRef.current = requestAnimationFrame(draw);

		return () => {
			window.removeEventListener("keydown", keyHandler);
			window.removeEventListener("resize", resize);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [msPerGrid, upcomingNotesRef, isRunning, registerHit, registerMiss]);

	return <canvas ref={canvasRef} style={{ width: "100%", height: "250px" }} />;
}
