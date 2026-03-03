import { useEffect, useRef } from "react";
import { submitSession } from "../lib/submitSession";
import {
	analyzeSession,
	type SessionAnalytics,
} from "../analytics/sessionAnalyzer";
import type { Drill } from "../types/types";
import type { TapEngine } from "../engine/useTapEngine";
import "./VisualizerCanvas.css";

type HitWindows = { PERFECT: number; GOOD: number; MEH: number };
type NoteSide = "left" | "right" | "either";

type Props = {
	drill: Drill;
	engine: TapEngine;
	userId?: string;
	msPerGrid: number;
	isRunning: boolean;
	offsetMs: number;
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
	/** Swap L/R assignments in dual mode */
	mirrorHands?: boolean;
	/** KeyboardEvent.code for left tap (default "KeyZ") */
	keyLeft?: string;
	/** KeyboardEvent.code for right tap (default "KeyX") */
	keyRight?: string;
};

type ActiveNote = {
	id: number;
	scheduledTime: number;
	spawnTime: number;
	side: NoteSide;
	/** Resolved hand for dual mode — "either" gets assigned at spawn */
	resolvedHand: "left" | "right";
};
type FloatingFace = {
	id: number;
	grade: 300 | 100 | 50 | 0;
	spawnTime: number;
	vx: number;
	vy: number;
	/** Which side the face floats from in dual mode */
	hand: "left" | "right";
	/** Override origin position (for osu mode) */
	originX?: number;
	originY?: number;
};
type NotePosition = { x: number; y: number };

/* ------------------------------------------------------------------ */
/*  DUAL-MODE DRAW HELPERS                                             */
/* ------------------------------------------------------------------ */

const DUAL_LEFT_COLOR = "#4a9fe8";
const DUAL_RIGHT_COLOR = "#e85a5a";
const DUAL_CIRCLE_RADIUS = 30;

function drawDualCircle(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	color: string,
	label: string,
	pulseScale: number,
	labelColor: string,
) {
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(pulseScale, pulseScale);
	ctx.translate(-x, -y);

	// Glow
	if (pulseScale > 1.01) {
		ctx.shadowColor = color;
		ctx.shadowBlur = 20 * (pulseScale - 1) * 8;
	}

	// Ring
	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.globalAlpha = 0.3 + 0.7 * Math.min(1, (pulseScale - 1) * 8 + 0.3);
	ctx.beginPath();
	ctx.arc(x, y, DUAL_CIRCLE_RADIUS, 0, Math.PI * 2);
	ctx.stroke();

	// Fill on hit
	if (pulseScale > 1.01) {
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.25 * Math.min(1, (pulseScale - 1) * 8);
		ctx.beginPath();
		ctx.arc(x, y, DUAL_CIRCLE_RADIUS, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.shadowBlur = 0;
	ctx.globalAlpha = pulseScale > 1.01 ? 1 : 0.6;
	ctx.fillStyle = pulseScale > 1.01 ? "#ffffff" : labelColor;
	ctx.font = "bold 22px system-ui";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(label, x, y);

	ctx.restore();
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

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
	offsetMs,
	externalTapRef,
	onSessionComplete,
	mirrorHands = false,
	keyLeft = "KeyZ",
	keyRight = "KeyX",
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const cssSizeRef = useRef({ w: 0, h: 0 });
	const submittedRef = useRef(false);
	const engineRef = useRef(engine);
	const lastHitTimeRef = useRef<number>(0);
	const lastLeftHitRef = useRef<number>(0);
	const lastRightHitRef = useRef<number>(0);
	const floatingFacesRef = useRef<FloatingFace[]>([]);
	const faceIdRef = useRef(0);
	const notePositionsRef = useRef<Map<number, NotePosition>>(new Map());
	/** Alternator for resolving "either" notes in dual mode */
	const dualAlternatorRef = useRef<"left" | "right">("left");

	const themeRef = useRef({
		bg: "",
		bgImage: "",
		visualizerOverlay: "",
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
			const s = getComputedStyle(document.documentElement);
			themeRef.current = {
				bg: s.getPropertyValue("--bg").trim(),
				bgImage: s.getPropertyValue("--visualizer-bg-image").trim(),
				visualizerOverlay: s.getPropertyValue("--visualizer-overlay").trim(),
				accent: s.getPropertyValue("--accent").trim(),
				accentSoft: s.getPropertyValue("--accent-soft").trim(),
				noteColor: s.getPropertyValue("--note-color").trim(),
				approachColor: s.getPropertyValue("--approach-color").trim(),
				textPrimary: s.getPropertyValue("--text-primary").trim(),
				textMuted: s.getPropertyValue("--text-muted").trim(),
				perfect: s.getPropertyValue("--perfect").trim(),
				early: s.getPropertyValue("--early").trim(),
				late: s.getPropertyValue("--late").trim(),
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

	useEffect(() => {
		if (
			!isRunning &&
			!submittedRef.current &&
			engineRef.current.live.completedRef?.current
		) {
			submittedRef.current = true;
			const effectiveUserId = userId ?? "dev-user-123";
			const live = engineRef.current.live;
			const analytics = analyzeSession(live.tapEventsRef.current);
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
					visualStyle: visualStyle,
				});
			}
		}
	}, [
		isRunning,
		userId,
		drill,
		onSessionComplete,
		isPracticeMode,
		visualStyle,
	]);

	useEffect(() => {
		if (isRunning) {
			submittedRef.current = false;
			dualAlternatorRef.current = "left";
		}
	}, [isRunning]);

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
		const osuTravelTime = msPerGrid * 6;

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;
			cssSizeRef.current = { w: rect.width, h: rect.height };
			canvas.width = Math.floor(rect.width * dpr);
			canvas.height = Math.floor(rect.height * dpr);
			canvas.style.width = `${rect.width}px`;
			canvas.style.height = `${rect.height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			notePositionsRef.current.clear();
		};

		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(canvas);
		window.addEventListener("resize", resize);

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
			const offset = now - note.scheduledTime - offsetMs;
			const grade = getGrade(offset);

			// In dual mode, check against resolvedHand instead of raw side
			const expectedSide =
				visualStyle === "dual" ? note.resolvedHand : "either";
			if (expectedSide !== "either" && side !== expectedSide) {
				engine.registerMiss();
				spawnMissFace(note.resolvedHand);
				return;
			}

			if (grade !== null) {
				engine.registerHit(offset, grade, side);
				lastHitTimeRef.current = now;
				if (side === "left") lastLeftHitRef.current = now;
				else lastRightHitRef.current = now;

				const spreadRad = (130 * Math.PI) / 180;
				const angle =
					-Math.PI / 2 + (Math.random() * spreadRad - spreadRad / 2);
				const speed = 90 + Math.random() * 80;
				const notePos = notePositionsRef.current.get(note.id);
				floatingFacesRef.current.push({
					id: faceIdRef.current++,
					grade,
					spawnTime: now,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					hand: note.resolvedHand,
					originX: notePos?.x,
					originY: notePos?.y,
				});
				notePositionsRef.current.delete(note.id);
				activeNotes.splice(closestIndex, 1);
			}
		};

		if (externalTapRef) externalTapRef.current = () => handleTap("left");

		const keyHandler = (e: KeyboardEvent) => {
			if (e.code === keyLeft) handleTap("left");
			if (e.code === keyRight) handleTap("right");
		};
		window.addEventListener("keydown", keyHandler);

		const getOsuPosition = (
			id: number,
			notesPerBar: number,
			width: number,
			height: number,
		): NotePosition => {
			if (notePositionsRef.current.has(id))
				return notePositionsRef.current.get(id)!;
			const slot = id % notesPerBar;
			const padding = 60;
			const totalWidth = (notesPerBar - 1) * padding;
			const pos: NotePosition = {
				x: width / 2 - totalWidth / 2 + slot * padding,
				y: height / 2,
			};
			notePositionsRef.current.set(id, pos);
			return pos;
		};

		/** Resolve "either" to a specific hand for dual mode */
		const flipHand = (h: "left" | "right"): "left" | "right" =>
			h === "left" ? "right" : "left";

		const resolveHand = (side: NoteSide): "left" | "right" => {
			let hand: "left" | "right";
			if (side === "left") {
				hand = "left";
				dualAlternatorRef.current = "right";
			} else if (side === "right") {
				hand = "right";
				dualAlternatorRef.current = "left";
			} else {
				hand = dualAlternatorRef.current;
				dualAlternatorRef.current = hand === "left" ? "right" : "left";
			}
			return mirrorHands ? flipHand(hand) : hand;
		};

		/** Spawn a floating miss indicator */
		const spawnMissFace = (
			hand: "left" | "right",
			originX?: number,
			originY?: number,
		) => {
			const now = performance.now();
			const spreadRad = (130 * Math.PI) / 180;
			const angle = -Math.PI / 2 + (Math.random() * spreadRad - spreadRad / 2);
			const speed = 60 + Math.random() * 50;
			floatingFacesRef.current.push({
				id: faceIdRef.current++,
				grade: 0,
				spawnTime: now,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				hand,
				originX,
				originY,
			});
		};

		const draw = () => {
			const now = performance.now();
			const { w: width, h: height } = cssSizeRef.current;
			if (!width || !height) {
				rafRef.current = requestAnimationFrame(draw);
				return;
			}

			const {
				bg,
				bgImage,
				visualizerOverlay,
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

			// Themed background
			ctx.fillStyle = bgImage || bg || "#0f172a";
			ctx.fillRect(0, 0, width, height);
			if (visualizerOverlay) {
				ctx.fillStyle = visualizerOverlay;
				ctx.fillRect(0, 0, width, height);
			}

			// Countdown
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

			const isDual = visualStyle === "dual";

			// ---- TARGET CIRCLES ----
			if (isDual) {
				// Two circles stacked vertically
				const circleGap = Math.min(50, height * 0.18);
				const leftY = centerY - circleGap;
				const rightY = centerY + circleGap;

				const leftElapsed = now - lastLeftHitRef.current;
				let leftPulse = 1;
				if (leftElapsed < 120) {
					const t = leftElapsed / 120;
					leftPulse = 1 + 0.25 * (1 - Math.pow(1 - t, 3));
				}

				const rightElapsed = now - lastRightHitRef.current;
				let rightPulse = 1;
				if (rightElapsed < 120) {
					const t = rightElapsed / 120;
					rightPulse = 1 + 0.25 * (1 - Math.pow(1 - t, 3));
				}

				drawDualCircle(
					ctx,
					centerX,
					leftY,
					DUAL_LEFT_COLOR,
					"L",
					leftPulse,
					textMuted,
				);
				drawDualCircle(
					ctx,
					centerX,
					rightY,
					DUAL_RIGHT_COLOR,
					"R",
					rightPulse,
					textMuted,
				);

				// Horizontal divider
				ctx.save();
				ctx.strokeStyle = textMuted;
				ctx.globalAlpha = 0.15;
				ctx.lineWidth = 1;
				ctx.setLineDash([4, 4]);
				ctx.beginPath();
				ctx.moveTo(centerX - 50, centerY);
				ctx.lineTo(centerX + 50, centerY);
				ctx.stroke();
				ctx.setLineDash([]);
				ctx.restore();
			} else if (visualStyle !== "osu") {
				// Single circle (existing behavior)
				const pulseElapsed = now - lastHitTimeRef.current;
				let pulseScale = 1;
				if (pulseElapsed < 120) {
					const t = pulseElapsed / 120;
					pulseScale = 1 + 0.25 * (1 - (1 - Math.pow(1 - t, 3)));
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
			}

			// ---- FLOATING FACES ----
			floatingFacesRef.current = floatingFacesRef.current.filter((face) => {
				const elapsed = now - face.spawnTime;
				if (elapsed > 600) return false;
				const t = elapsed / 1000;

				// In dual mode, faces float from their respective circle
				// In osu mode, faces float from the note's position
				const faceOriginX = face.originX ?? centerX;
				let faceOriginY = face.originY ?? centerY;
				if (face.originX == null && face.originY == null && isDual) {
					const circleGap = Math.min(50, height * 0.18);
					faceOriginY =
						face.hand === "left" ? centerY - circleGap : centerY + circleGap;
				}

				const x = faceOriginX + face.vx * t;
				const y = faceOriginY - 60 + face.vy * t;
				let text = ":)";
				let color = perfect;
				if (face.grade === 100) {
					text = ":|";
					color = early;
				} else if (face.grade === 50) {
					text = ":(";
					color = late;
				} else if (face.grade === 0) {
					text = "✕";
					color = late;
				}
				ctx.save();
				ctx.globalAlpha = 1 - elapsed / 600;
				ctx.fillStyle = color;
				ctx.font = "bold 26px system-ui";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(text, x, y);
				ctx.restore();
				return true;
			});

			// ---- SPAWN + DRAW NOTES ----
			const effectiveTravelTime =
				visualStyle === "osu" ? osuTravelTime : travelTime;

			if (isRunning) {
				while (
					upcomingNotesRef.current.length > 0 &&
					(typeof upcomingNotesRef.current[0] === "number"
						? upcomingNotesRef.current[0]
						: upcomingNotesRef.current[0].time) -
						effectiveTravelTime <=
						now
				) {
					const raw = upcomingNotesRef.current.shift()!;
					const scheduledTime = typeof raw === "number" ? raw : raw.time;
					const side: NoteSide =
						typeof raw === "number" ? "either" : (raw.side ?? "either");

					activeNotes.push({
						id: noteId++,
						scheduledTime,
						spawnTime: scheduledTime - effectiveTravelTime,
						side,
						resolvedHand: isDual
							? resolveHand(side)
							: side === "either"
								? "left"
								: side,
					});
				}

				const noteRadius = 22;
				const notesPerBar = drill.bars[0].notes.length || 1;

				if (isDual) {
					// ---- DUAL CIRCLE NOTE RENDERING (vertical split) ----
					const circleGap = Math.min(50, height * 0.18);
					const leftTargetY = centerY - circleGap;
					const rightTargetY = centerY + circleGap;

					activeNotes = activeNotes.filter((note) => {
						if (now - note.scheduledTime > windows.MEH) {
							engine.registerMiss();
							spawnMissFace(note.resolvedHand);
							return false;
						}

						const progress = (now - note.spawnTime) / travelTime;
						if (progress < 0 || progress >= 1.2) return progress < 1.2;

						const isLeft = note.resolvedHand === "left";
						const targetY = isLeft ? leftTargetY : rightTargetY;
						const noteColor_ = isLeft ? DUAL_LEFT_COLOR : DUAL_RIGHT_COLOR;

						// Notes travel horizontally toward center, split vertically toward their circle
						const x = startX + progress * (centerX - startX);
						const splitProgress = Math.min(1, progress * 1.5);
						const y =
							centerY + (targetY - centerY) * easeOutCubic(splitProgress);

						// Fade in
						const alpha = Math.min(1, progress * 3);

						ctx.save();
						ctx.globalAlpha = alpha;
						ctx.translate(x, y);

						// Filled circle with hand color
						ctx.fillStyle = noteColor_ + "30";
						ctx.beginPath();
						ctx.arc(0, 0, noteRadius, 0, Math.PI * 2);
						ctx.fill();

						// Border
						ctx.strokeStyle = noteColor_;
						ctx.lineWidth = 3;
						ctx.beginPath();
						ctx.arc(0, 0, noteRadius, 0, Math.PI * 2);
						ctx.stroke();

						// Label
						ctx.fillStyle = noteColor_;
						ctx.font = "bold 13px system-ui";
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.fillText(isLeft ? "L" : "R", 0, 0);

						ctx.restore();
						return true;
					});
				} else if (visualStyle === "osu") {
					activeNotes = activeNotes.filter((note) => {
						if (now - note.scheduledTime > windows.MEH) {
							const missPos = notePositionsRef.current.get(note.id);
							engine.registerMiss();
							spawnMissFace(note.resolvedHand, missPos?.x, missPos?.y);
							notePositionsRef.current.delete(note.id);
							return false;
						}
						const { x, y } = getOsuPosition(
							note.id,
							notesPerBar,
							width,
							height,
						);
						const remaining = note.scheduledTime - now;
						const totalTime = note.scheduledTime - note.spawnTime;
						const t = Math.max(0, Math.min(1, 1 - remaining / totalTime));
						const approachRadius = noteRadius * (1 + 2 * (1 - t));

						ctx.save();
						ctx.strokeStyle = approachColor;
						ctx.lineWidth = 3;
						ctx.globalAlpha = 0.85 * (1 - t * 0.2);
						ctx.beginPath();
						ctx.arc(x, y, approachRadius, 0, Math.PI * 2);
						ctx.stroke();
						ctx.restore();

						ctx.save();
						ctx.fillStyle = accentSoft;
						ctx.beginPath();
						ctx.arc(x, y, noteRadius, 0, Math.PI * 2);
						ctx.fill();
						ctx.strokeStyle = noteColor;
						ctx.lineWidth = 4;
						ctx.beginPath();
						ctx.arc(x, y, noteRadius, 0, Math.PI * 2);
						ctx.stroke();
						ctx.fillStyle = textPrimary;
						ctx.font = "bold 14px system-ui";
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.fillText(String((note.id % notesPerBar) + 1), x, y);
						ctx.restore();
						return true;
					});
				} else {
					activeNotes = activeNotes.filter((note) => {
						if (now - note.scheduledTime > windows.MEH) {
							engine.registerMiss();
							spawnMissFace(note.resolvedHand);
							return false;
						}
						const progress = (now - note.spawnTime) / travelTime;
						if (progress < 0 || progress >= 1.2) return progress < 1.2;
						const x = startX + progress * (centerX - startX);

						ctx.save();
						ctx.translate(x, centerY);
						ctx.fillStyle = accentSoft;
						ctx.beginPath();
						ctx.arc(0, 0, noteRadius, 0, Math.PI * 2);
						ctx.fill();
						ctx.strokeStyle = noteColor;
						ctx.lineWidth = 4;
						ctx.beginPath();
						ctx.arc(0, 0, noteRadius, 0, Math.PI * 2);
						ctx.stroke();
						ctx.fillStyle = textPrimary;
						ctx.font = "bold 14px system-ui";
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.fillText(String((note.id % notesPerBar) + 1), 0, 0);
						ctx.restore();
						return true;
					});
				}
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
		mirrorHands,
		keyLeft,
		keyRight,
		offsetMs,
	]);

	return (
		<div className="visualizer-wrapper">
			<canvas ref={canvasRef} className="visualizer-canvas" />
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  EASING                                                             */
/* ------------------------------------------------------------------ */

function easeOutCubic(t: number): number {
	return 1 - Math.pow(1 - t, 3);
}
