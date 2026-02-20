import { useEffect, useRef } from "react";
import { submitSession } from "../lib/submitSession";
import type { Drill } from "../types";
import type { TapEngine } from "../engine/useTapEngine";

type HitWindows = {
	PERFECT: number;
	GOOD: number;
	MEH: number;
};

type Props = {
	drill: Drill;
	engine: TapEngine;
	userId?: string;

	msPerGrid: number;
	upcomingNotesRef: React.RefObject<number[]>;
	isRunning: boolean;
	registerHit: (offset: number, grade: 300 | 100 | 50) => void;
	registerMiss: () => void;
	getGrade: (offset: number) => 300 | 100 | 50 | null;
	windows: HitWindows;

	sessionEndRef?: React.RefObject<number>;
	stop?: () => void;
	externalTapRef?: React.MutableRefObject<() => void>;
};

type ActiveNote = {
	id: number;
	scheduledTime: number;
	spawnTime: number;
};

export default function VisualizerCanvas({
	drill,
	engine,
	userId,
	msPerGrid,
	upcomingNotesRef,
	isRunning,
	registerHit,
	registerMiss,
	sessionEndRef,

	getGrade,
	windows,
	externalTapRef,
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);

	// 🔥 prevents double submit
	const submittedRef = useRef(false);

	// 🔥 LIVE ENGINE REF (avoids stale stats)
	const engineRef = useRef(engine);
	useEffect(() => {
		engineRef.current = engine;
	}, [engine]);

	// 🔥 SUBMIT WHEN SESSION ENDS (natural OR early stop)
	useEffect(() => {
		if (!isRunning && !submittedRef.current) {
			submittedRef.current = true;

			if (!userId) return;

			const live = engineRef.current.live;

			console.log("Submitting:", {
				h300: live.hit300Ref.current,
				h100: live.hit100Ref.current,
				h50: live.hit50Ref.current,
				miss: live.missRef.current,
			});

			submitSession({
				userId,
				drillId: drill.id,
				bpm: drill.bpm,
				h300: live.hit300Ref.current,
				h100: live.hit100Ref.current,
				h50: live.hit50Ref.current,
				miss: live.missRef.current,
				meanOffset: live.meanOffsetRef.current,
				unstableRate: live.unstableRateRef.current,
			});
		}
	}, [isRunning, userId, drill]);

	// 🔁 reset submit flag on new session
	useEffect(() => {
		if (isRunning) {
			submittedRef.current = false;
		}
	}, [isRunning]);

	useEffect(() => {
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext("2d")!;
		const travelTime = msPerGrid * 4;

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
			const grade = getGrade(offset);

			if (grade !== null) {
				registerHit(offset, grade);
				activeNotes.splice(closestIndex, 1);
			}
		};

		if (externalTapRef) externalTapRef.current = handleTap;

		const keyHandler = (e: KeyboardEvent) => {
			if (e.code === "KeyZ" || e.code === "KeyX") handleTap();
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

			ctx.fillStyle = "#0f172a";
			ctx.fillRect(0, 0, width, height);

			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
			ctx.stroke();

			const endTime = sessionEndRef?.current ?? 0;
			if (isRunning && endTime) {
				const remainingMs = Math.max(0, endTime - now);
				const remainingSec = (remainingMs / 1000).toFixed(1);

				ctx.fillStyle = "rgba(255,255,255,0.8)";
				ctx.font = "16px system-ui";
				ctx.fillText(`Time Left: ${remainingSec}s`, width - 140, 30);
			}

			if (isRunning) {
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
					if (now - note.scheduledTime > windows.MEH) {
						registerMiss();
						return false;
					}

					const progress = (now - note.spawnTime) / travelTime;
					if (progress < 0) return true;
					if (progress >= 1.2) return false;

					const x = startX + progress * (centerX - startX);

					ctx.fillStyle = "#22d3ee";
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
	}, [
		msPerGrid,
		upcomingNotesRef,
		isRunning,
		registerHit,
		registerMiss,
		getGrade,
		windows,
		externalTapRef,
		sessionEndRef,
	]);

	return <canvas ref={canvasRef} style={{ width: "100%", height: "250px" }} />;
}
