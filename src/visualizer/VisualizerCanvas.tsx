import { useEffect, useRef } from "react";
import { submitSession } from "../lib/submitSession";
import {
	analyzeSession,
	type SessionAnalytics,
} from "../analytics/sessionAnalyzer";
import type { Drill } from "../types/types";
import type { TapEngine } from "../engine/useTapEngine";

type HitWindows = {
	PERFECT: number;
	GOOD: number;
	MEH: number;
};

type NoteSide = "left" | "right" | "either";

type Props = {
	drill: Drill;
	engine: TapEngine;
	userId?: string;
	msPerGrid: number;
	isRunning: boolean;
	getGrade: (offset: number) => 300 | 100 | 50 | null;
	windows: HitWindows;
	onSessionComplete?: (analytics: SessionAnalytics | null) => void;
	sessionEndRef?: React.RefObject<number>;
	stop?: () => void;
	externalTapRef?: React.MutableRefObject<() => void>;
	isPracticeMode: boolean;
	upcomingNotesRef: React.RefObject<
		(number | { time: number; side?: NoteSide })[]
	>;
};

type ActiveNote = {
	id: number;
	scheduledTime: number;
	spawnTime: number;
	side: NoteSide;
	pulseAt?: number;
	consumed?: boolean;
};

export default function VisualizerCanvas({
	drill,
	engine,
	userId,
	msPerGrid,
	upcomingNotesRef,
	isRunning,
	isPracticeMode,
	sessionEndRef,
	stop,
	getGrade,
	windows,
	externalTapRef,
	onSessionComplete,
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const cssSizeRef = useRef({ w: 0, h: 0 });
	const lastHitTimeRef = useRef<number>(0);
	const submittedRef = useRef(false);
	const engineRef = useRef(engine);

	useEffect(() => {
		engineRef.current = engine;
	}, [engine]);

	/* ----------------------------- */
	/* SUBMIT LOGIC                 */
	/* ----------------------------- */

	useEffect(() => {
		if (
			!isRunning &&
			!submittedRef.current &&
			engineRef.current.live.completedRef?.current
		) {
			submittedRef.current = true;

			const effectiveUserId = userId ?? "dev-user-123";
			const live = engineRef.current.live;
			const taps = live.tapEventsRef.current;

			const analytics = analyzeSession(taps);
			onSessionComplete?.(analytics);

			gtag("event", "session_complete", {
				drill: drill.id,
				ur: live.unstableRateRef.current,
				practice: isPracticeMode,
			});

			if (!isPracticeMode) {
				submitSession({
					userId: effectiveUserId,
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
		}
	}, [isRunning, userId, drill, onSessionComplete, isPracticeMode]);

	useEffect(() => {
		if (isRunning) submittedRef.current = false;
	}, [isRunning]);

	/* ----------------------------- */
	/* MAIN CANVAS EFFECT           */
	/* ----------------------------- */

	useEffect(() => {
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext("2d")!;
		const travelTime = msPerGrid * 4;

		let activeNotes: ActiveNote[] = [];
		let noteId = 0;

		/* ---------- Retina Setup ---------- */

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;

			cssSizeRef.current = { w: rect.width, h: rect.height };

			canvas.width = Math.floor(rect.width * dpr);
			canvas.height = Math.floor(rect.height * dpr);

			canvas.style.width = `${rect.width}px`;
			canvas.style.height = `${rect.height}px`;

			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(canvas);
		window.addEventListener("resize", resize);

		/* ---------- Input ---------- */

		const handleTap = (side: "left" | "right") => {
			if (!isRunning) return;
			const now = performance.now();
			if (!activeNotes.length) return;

			let closestIndex = -1;
			let smallestDelta = Infinity;

			activeNotes.forEach((note, i) => {
				if (note.consumed) return;
				const delta = Math.abs(now - note.scheduledTime);
				if (delta < smallestDelta) {
					smallestDelta = delta;
					closestIndex = i;
				}
			});

			if (closestIndex === -1) return;

			const note = activeNotes[closestIndex];
			const offset = now - note.scheduledTime;
			const grade = getGrade(offset);

			if (note.side !== "either" && side !== note.side) {
				engine.registerMiss();
				return;
			}

			if (grade !== null) {
				engine.registerHit(offset, grade, side);

				lastHitTimeRef.current = now;

				activeNotes.splice(closestIndex, 1);
			}
		};

		if (externalTapRef) {
			externalTapRef.current = () => handleTap("left");
		}

		const keyHandler = (e: KeyboardEvent) => {
			if (e.code === "KeyZ") handleTap("left");
			if (e.code === "KeyX") handleTap("right");
		};

		window.addEventListener("keydown", keyHandler);

		/* ---------- Draw Loop ---------- */

		const draw = () => {
			const now = performance.now();
			const { w: width, h: height } = cssSizeRef.current;

			if (!width || !height) {
				rafRef.current = requestAnimationFrame(draw);
				return;
			}

			const centerX = width / 2;
			const centerY = height / 2;
			const startX = width * 0.1;

			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = "#0f172a";
			ctx.fillRect(0, 0, width, height);

			// 🔥 Center Pulse
			const elapsed = now - lastHitTimeRef.current;
			let scale = 1;

			if (elapsed < 120) {
				const t = elapsed / 120;
				const easeOut = 1 - Math.pow(1 - t, 3);
				scale = 1 + 0.25 * (1 - easeOut);
			}

			ctx.save();
			ctx.translate(centerX, centerY);
			ctx.scale(scale, scale);
			ctx.translate(-centerX, -centerY);

			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
			ctx.stroke();

			ctx.restore();

			const endTime = sessionEndRef?.current ?? 0;

			if (isRunning && endTime && now >= endTime) {
				engineRef.current.live.completedRef.current = true;
				stop?.();
			}

			if (isRunning && endTime) {
				const remainingMs = Math.max(0, endTime - now);
				ctx.fillStyle = "rgba(255,255,255,0.8)";
				ctx.font = "16px system-ui";
				ctx.fillText(
					`Time Left: ${(remainingMs / 1000).toFixed(1)}s`,
					width - 140,
					30
				);
			}

			/* ---------- Spawn Notes ---------- */

			if (isRunning) {
				while (
					upcomingNotesRef.current.length > 0 &&
					(typeof upcomingNotesRef.current[0] === "number"
						? upcomingNotesRef.current[0]
						: upcomingNotesRef.current[0].time) -
						travelTime <=
						now
				) {
					const raw = upcomingNotesRef.current.shift()!;
					const scheduledTime = typeof raw === "number" ? raw : raw.time;

					const side: NoteSide =
						typeof raw === "number" ? "either" : raw.side ?? "either";

					activeNotes.push({
						id: noteId++,
						scheduledTime,
						spawnTime: scheduledTime - travelTime,
						side,
					});
				}

				/* ---------- Update & Draw Notes ---------- */

				activeNotes = activeNotes.filter((note) => {
					if (!note.consumed && now - note.scheduledTime > windows.MEH) {
						engine.registerMiss();
						return false;
					}

					if (note.consumed && note.pulseAt) {
						if (now - note.pulseAt > 100) return false;
					}

					const progress = (now - note.spawnTime) / travelTime;
					if (progress < 0 || progress >= 1.2) return progress < 1.2;

					const x = startX + progress * (centerX - startX);

					let scale = 1;

					if (note.pulseAt) {
						const elapsed = now - note.pulseAt;
						if (elapsed < 1) {
							const t = elapsed / 100;
							const easeOut = 1 - Math.pow(1 - t, 3);
							scale = 1 + 0.35 * (1 - easeOut);
						}
					}

					ctx.save();
					ctx.translate(x, centerY);
					ctx.scale(scale, scale);
					ctx.translate(-x, -centerY);

					ctx.fillStyle = "#22d3ee";
					ctx.beginPath();
					ctx.arc(x, centerY, 20, 0, Math.PI * 2);
					ctx.fill();

					ctx.restore();

					return true;
				});
			}

			rafRef.current = requestAnimationFrame(draw);
		};

		rafRef.current = requestAnimationFrame(draw);

		return () => {
			window.removeEventListener("keydown", keyHandler);
			window.removeEventListener("resize", resize);
			ro.disconnect();
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [
		msPerGrid,
		upcomingNotesRef,
		isRunning,
		getGrade,
		windows,
		externalTapRef,
		sessionEndRef,
		stop,
		engine,
	]);

	return (
		<canvas
			ref={canvasRef}
			style={{ width: "100%", height: "250px", display: "block" }}
		/>
	);
}
