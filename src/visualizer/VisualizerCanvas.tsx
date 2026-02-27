import { useEffect, useRef } from "react";
import { submitSession } from "../lib/submitSession";
import {
	analyzeSession,
	type SessionAnalytics,
} from "../analytics/sessionAnalyzer";
import type { Drill } from "../types/types";
import type { TapEngine } from "../engine/useTapEngine";
import "./VisualizerCanvas.css";

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
	visualStyle: string;
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
};

type FloatingFace = {
	id: number;
	grade: 300 | 100 | 50;
	spawnTime: number;
	vx: number;
	vy: number;
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
	visualStyle,
	stop,
	getGrade,
	windows,
	externalTapRef,
	onSessionComplete,
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const cssSizeRef = useRef({ w: 0, h: 0 });

	const submittedRef = useRef(false);
	const engineRef = useRef(engine);

	const lastHitTimeRef = useRef<number>(0);

	const floatingFacesRef = useRef<FloatingFace[]>([]);
	const faceIdRef = useRef(0);

	/* ---------- THEME CACHE ---------- */

	const themeRef = useRef({
		bg: "",
		accent: "",
		accentSoft: "",
		noteColor: "",
		approachColor: "",
		textPrimary: "",
		textMuted: "",
		perfect: "",
		early: "",
		late: "",
	});

	useEffect(() => {
		const updateTheme = () => {
			const styles = getComputedStyle(document.documentElement);

			themeRef.current = {
				bg: styles.getPropertyValue("--bg").trim(),
				accent: styles.getPropertyValue("--accent").trim(),
				accentSoft: styles.getPropertyValue("--accent-soft").trim(),
				noteColor: styles.getPropertyValue("--note-color").trim(),
				approachColor: styles.getPropertyValue("--approach-color").trim(),
				textPrimary: styles.getPropertyValue("--text-primary").trim(),
				textMuted: styles.getPropertyValue("--text-muted").trim(),
				perfect: styles.getPropertyValue("--perfect").trim(),
				early: styles.getPropertyValue("--early").trim(),
				late: styles.getPropertyValue("--late").trim(),
			};
		};

		updateTheme();

		const observer = new MutationObserver(updateTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["style"],
		});

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		engineRef.current = engine;
	}, [engine]);

	/* ---------- SUBMIT LOGIC ---------- */

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

	/* ---------- MAIN EFFECT ---------- */

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let activeNotes: ActiveNote[] = [];
		let noteId = 0;

		const styles = getComputedStyle(document.documentElement);
		const travelMultiplier =
			parseFloat(styles.getPropertyValue("--note-travel-multiplier")) || 8;

		const travelTime = msPerGrid * travelMultiplier;

		/* ---------- Retina ---------- */

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

				const spreadDeg = 130;
				const spreadRad = (spreadDeg * Math.PI) / 180;
				const halfSpread = spreadRad / 2;

				const angle = -Math.PI / 2 + (Math.random() * spreadRad - halfSpread);

				const speed = 90 + Math.random() * 80;

				floatingFacesRef.current.push({
					id: faceIdRef.current++,
					grade,
					spawnTime: now,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
				});

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

		/* ---------- Draw ---------- */

		const draw = () => {
			const now = performance.now();
			const { w: width, h: height } = cssSizeRef.current;

			if (!width || !height) {
				rafRef.current = requestAnimationFrame(draw);
				return;
			}

			const {
				accent,
				accentSoft,
				noteColor,
				approachColor,
				textPrimary,
				textMuted,
				perfect,
				early,
				late,
			} = themeRef.current;

			const centerX = width / 2;
			const centerY = height / 2;
			const startX = width * 0.1;

			ctx.clearRect(0, 0, width, height);

			/* ---------- Countdown ---------- */

			const endTime = sessionEndRef?.current ?? 0;

			if (isRunning && endTime) {
				const remainingMs = Math.max(0, endTime - now);

				ctx.save();
				ctx.fillStyle = textMuted;
				ctx.font = "bold 14px system-ui";
				ctx.textAlign = "right";
				ctx.textBaseline = "top";
				ctx.fillText(`${(remainingMs / 1000).toFixed(1)}s`, width - 16, 16);
				ctx.restore();

				if (remainingMs <= 0) {
					engineRef.current.live.completedRef.current = true;
					stop?.();
				}
			}

			/* ---------- Center Circle ---------- */

			const pulseElapsed = now - lastHitTimeRef.current;

			let pulseScale = 1;

			if (pulseElapsed < 120) {
				const t = pulseElapsed / 120;
				const easeOut = 1 - Math.pow(1 - t, 3);
				pulseScale = 1 + 0.25 * (1 - easeOut);
			}

			ctx.save();

			ctx.translate(centerX, centerY);
			ctx.scale(pulseScale, pulseScale);
			ctx.translate(-centerX, -centerY);

			ctx.strokeStyle = accent;
			ctx.lineWidth = 3;

			ctx.beginPath();
			ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
			ctx.stroke();

			ctx.restore();

			/* ---------- Floating Faces ---------- */

			const faceDuration = 600;

			floatingFacesRef.current = floatingFacesRef.current.filter((face) => {
				const elapsed = now - face.spawnTime;
				if (elapsed > faceDuration) return false;

				const t = elapsed / 1000;

				const x = centerX + face.vx * t;
				const y = centerY - 60 + face.vy * t;

				const opacity = 1 - elapsed / faceDuration;

				let text = ":)";
				let color = perfect;

				if (face.grade === 100) {
					text = ":|";
					color = early;
				} else if (face.grade === 50) {
					text = ":(";
					color = late;
				}

				ctx.save();

				ctx.globalAlpha = opacity;
				ctx.fillStyle = color;
				ctx.font = "bold 26px system-ui";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(text, x, y);

				ctx.restore();

				return true;
			});

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

				activeNotes = activeNotes.filter((note) => {
					if (now - note.scheduledTime > windows.MEH) {
						engine.registerMiss();
						return false;
					}

					const progress = (now - note.spawnTime) / travelTime;

					if (progress < 0 || progress >= 1.2) return progress < 1.2;

					const x = startX + progress * (centerX - startX);
					const radius = 22;

					if (visualStyle === "approach") {
						const total = note.scheduledTime - note.spawnTime;
						const remaining = note.scheduledTime - now;
						const t = 1 - remaining / total;
						const clamped = Math.max(0, Math.min(1, t));
						const approachScale = 2 - clamped;

						ctx.save();
						ctx.translate(x, centerY);
						ctx.scale(approachScale, approachScale);
						ctx.translate(-x, -centerY);

						ctx.strokeStyle = approachColor;
						ctx.lineWidth = 3;

						ctx.beginPath();
						ctx.arc(x, centerY, radius, 0, Math.PI * 2);
						ctx.stroke();

						ctx.restore();
					}

					ctx.save();
					ctx.translate(x, centerY);

					ctx.fillStyle = accentSoft;

					ctx.beginPath();
					ctx.arc(0, 0, radius, 0, Math.PI * 2);
					ctx.fill();

					ctx.strokeStyle = noteColor;

					ctx.lineWidth = 4;

					ctx.beginPath();
					ctx.arc(0, 0, radius, 0, Math.PI * 2);
					ctx.stroke();

					ctx.fillStyle = textPrimary;

					ctx.font = "bold 14px system-ui";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";

					const notesPerBar = drill.bars[0].notes.length || 1;

					ctx.fillText(String((note.id % notesPerBar) + 1), 0, 0);

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
		drill.bars,
		visualStyle,
	]);

	return (
		<div className="visualizer-wrapper">
			<canvas ref={canvasRef} className="visualizer-canvas" />
		</div>
	);
}
