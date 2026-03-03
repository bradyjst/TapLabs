import type { SessionAnalytics } from "../analytics/sessionAnalyzer";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export type CoachTip = {
	id: string;
	severity: "info" | "warning" | "action";
	title: string;
	message: string;
	drill?: string; // suggested drill ID if relevant
};

export type DrillBreakdown = {
	drillId: string;
	burstType: string;
	bpm: number;
	sessions: number;
	avgAccuracy: number;
	avgUr: number;
	bestUr: number;
	bestGrade: string;
};

export type ProfileCoachInput = {
	totalSessions: number;
	avgAccuracy: number;
	avgUr: number;
	bestUr: number;
	bpmCeiling: number | null;
	drillBreakdowns: DrillBreakdown[];
};

/* ------------------------------------------------------------------ */
/*  SESSION COACHING                                                   */
/* ------------------------------------------------------------------ */

export function analyzeSession(data: SessionAnalytics): CoachTip[] {
	const tips: CoachTip[] = [];

	// Hand imbalance
	if (data.imbalancePercent > 15) {
		const weak = Math.abs(data.leftMean) > Math.abs(data.rightMean) ? "left" : "right";
		tips.push({
			id: "hand-imbalance",
			severity: "action",
			title: "Hand Imbalance Detected",
			message: `Your ${weak} hand is ${data.imbalancePercent.toFixed(0)}% less accurate. Try trill and doubles drills with mirror hands enabled to even things out.`,
			drill: "trill8_150",
		});
	} else if (data.imbalancePercent > 8) {
		const weak = Math.abs(data.leftMean) > Math.abs(data.rightMean) ? "left" : "right";
		tips.push({
			id: "hand-imbalance-mild",
			severity: "info",
			title: "Slight Hand Imbalance",
			message: `Your ${weak} hand is slightly weaker (${data.imbalancePercent.toFixed(0)}% imbalance). Not critical, but trill practice will help.`,
		});
	}

	// Drift direction
	if (Math.abs(data.meanOffset) > 8) {
		const direction = data.meanOffset < 0 ? "early" : "late";
		tips.push({
			id: "drift-severe",
			severity: "warning",
			title: `Drifting ${direction === "early" ? "Early" : "Late"}`,
			message: direction === "early"
				? `Your mean offset is ${data.meanOffset.toFixed(1)}ms early. You're anticipating notes. Try focusing on the audio cue rather than guessing the rhythm.`
				: `Your mean offset is ${data.meanOffset.toFixed(1)}ms late. You're reacting instead of feeling the beat. Try tapping slightly ahead of when you think the note lands.`,
		});
	} else if (Math.abs(data.meanOffset) > 4) {
		const direction = data.meanOffset < 0 ? "early" : "late";
		tips.push({
			id: "drift-mild",
			severity: "info",
			title: `Slightly ${direction === "early" ? "Early" : "Late"}`,
			message: `Your timing is ${Math.abs(data.meanOffset).toFixed(1)}ms ${direction} on average. Close to centered — keep refining.`,
		});
	}

	// Galloping
	if (data.gallopingRisk > 60) {
		tips.push({
			id: "galloping-high",
			severity: "action",
			title: "Galloping Pattern",
			message: "Your taps have an uneven long-short rhythm instead of even spacing. Slow down 10-20 BPM and focus on keeping every gap identical. Stream drills help build even alternation.",
			drill: "burst16_150",
		});
	} else if (data.gallopingRisk > 35) {
		tips.push({
			id: "galloping-mild",
			severity: "info",
			title: "Slight Galloping",
			message: "Some unevenness in your tap spacing. Try counting evenly in your head or tapping along to a metronome at a slower tempo.",
		});
	}

	// Consistency
	if (data.consistencyScore < 30) {
		tips.push({
			id: "consistency-low",
			severity: "action",
			title: "Inconsistent Timing",
			message: "Your timing varies a lot between taps. Drop the BPM by 20 and focus on hitting a steady rhythm before pushing speed.",
		});
	} else if (data.consistencyScore < 55) {
		tips.push({
			id: "consistency-med",
			severity: "info",
			title: "Room for Consistency",
			message: `Consistency score: ${data.consistencyScore.toFixed(0)}. You're getting there — try to maintain the same timing quality through the whole drill, not just the start.`,
		});
	}

	// High UR
	if (data.unstableRate > 180) {
		tips.push({
			id: "ur-high",
			severity: "action",
			title: "High Unstable Rate",
			message: "Your UR is above 180, which means your taps are spread out from the beat. Lower the BPM until you can consistently stay under 140 UR, then work back up.",
		});
	} else if (data.unstableRate > 140) {
		tips.push({
			id: "ur-moderate",
			severity: "info",
			title: "UR Could Be Tighter",
			message: `UR of ${data.unstableRate.toFixed(0)} is decent but there's room to tighten up. Short burst drills at this BPM will help — they train precision without endurance pressure.`,
			drill: "burst3_150",
		});
	}

	// Fatigue
	if (data.fatigueCurve.length >= 3) {
		const firstThird = data.fatigueCurve.slice(0, Math.ceil(data.fatigueCurve.length / 3));
		const lastThird = data.fatigueCurve.slice(-Math.ceil(data.fatigueCurve.length / 3));

		const earlyAvg = firstThird.reduce((sum, d) => sum + d.stdDev, 0) / firstThird.length;
		const lateAvg = lastThird.reduce((sum, d) => sum + d.stdDev, 0) / lastThird.length;

		if (lateAvg > earlyAvg * 1.4) {
			tips.push({
				id: "fatigue",
				severity: "warning",
				title: "Fatigue Drop-Off",
				message: "Your accuracy drops significantly toward the end of the drill. Your technique breaks down under sustained load. Try deathstream drills to build stamina, or take shorter breaks between attempts.",
				drill: "burst16_170",
			});
		}
	}

	// Strongly early/late split
	if (data.earlyPercent > 0.75) {
		tips.push({
			id: "mostly-early",
			severity: "info",
			title: "Mostly Early Hits",
			message: `${(data.earlyPercent * 100).toFixed(0)}% of your taps are early. Try relaxing your timing slightly — you might be tensing up and rushing.`,
		});
	} else if (data.latePercent > 0.75) {
		tips.push({
			id: "mostly-late",
			severity: "info",
			title: "Mostly Late Hits",
			message: `${(data.latePercent * 100).toFixed(0)}% of your taps are late. Try to internalize the rhythm before starting — listen to a few beats before you begin tapping.`,
		});
	}

	// Hand stddev difference
	const handStdDiff = Math.abs(data.leftStdDev - data.rightStdDev);
	if (handStdDiff > 6) {
		const inconsistentHand = data.leftStdDev > data.rightStdDev ? "left" : "right";
		tips.push({
			id: "hand-consistency",
			severity: "info",
			title: `${inconsistentHand === "left" ? "Left" : "Right"} Hand Less Consistent`,
			message: `Your ${inconsistentHand} hand has more timing variance. It's not just offset — the spread is wider. Isolated hand practice or slower trills will help stabilize it.`,
		});
	}

	// Good session!
	if (tips.length === 0) {
		tips.push({
			id: "good-session",
			severity: "info",
			title: "Solid Session",
			message: "No major issues detected. Your timing, balance, and consistency all look good. Push the BPM up or try a longer drill to keep progressing.",
		});
	}

	return tips;
}

/* ------------------------------------------------------------------ */
/*  PROFILE COACHING                                                   */
/* ------------------------------------------------------------------ */

export function analyzeProfile(input: ProfileCoachInput): CoachTip[] {
	const tips: CoachTip[] = [];
	const { drillBreakdowns, totalSessions, avgAccuracy, avgUr, bpmCeiling } = input;

	if (totalSessions < 5) {
		tips.push({
			id: "not-enough-data",
			severity: "info",
			title: "Keep Playing",
			message: "Complete a few more sessions so the coach has enough data to give meaningful recommendations.",
		});
		return tips;
	}

	// Variety check
	const burstTypes = new Set(drillBreakdowns.map((d) => d.burstType));
	if (burstTypes.size <= 2 && drillBreakdowns.length >= 5) {
		tips.push({
			id: "low-variety",
			severity: "action",
			title: "Branch Out",
			message: "You're mostly playing the same drill types. Try trills, doubles, or longer streams to develop different skills. Variety prevents plateaus.",
		});
	}

	// BPM range check
	const bpms = drillBreakdowns.map((d) => d.bpm);
	const minBpm = Math.min(...bpms);
	const maxBpm = Math.max(...bpms);
	if (maxBpm - minBpm < 20 && drillBreakdowns.length >= 5) {
		tips.push({
			id: "narrow-bpm",
			severity: "info",
			title: "Expand Your BPM Range",
			message: `You're mostly playing between ${minBpm}–${maxBpm} BPM. Try some slower drills for precision work and faster ones to push your ceiling.`,
		});
	}

	// Weak drill types
	const byType = new Map<string, { totalAcc: number; count: number }>();
	for (const d of drillBreakdowns) {
		const existing = byType.get(d.burstType);
		if (existing) {
			existing.totalAcc += d.avgAccuracy;
			existing.count++;
		} else {
			byType.set(d.burstType, { totalAcc: d.avgAccuracy, count: 1 });
		}
	}

	let weakest: { type: string; acc: number } | null = null;
	let strongest: { type: string; acc: number } | null = null;

	for (const [type, data] of byType) {
		const avg = data.totalAcc / data.count;
		if (!weakest || avg < weakest.acc) weakest = { type, acc: avg };
		if (!strongest || avg > strongest.acc) strongest = { type, acc: avg };
	}

	if (weakest && strongest && burstTypes.size >= 3) {
		const gap = strongest.acc - weakest.acc;
		if (gap > 0.05) {
			tips.push({
				id: "weak-drill-type",
				severity: "action",
				title: `Weak Spot: ${weakest.type}`,
				message: `Your ${weakest.type} drills average ${(weakest.acc * 100).toFixed(1)}% accuracy vs ${(strongest.acc * 100).toFixed(1)}% on ${strongest.type}. Spending more time on ${weakest.type} will raise your overall skill floor.`,
			});
		}
	}

	// Accuracy vs UR mismatch
	if (avgAccuracy > 0.92 && avgUr > 150) {
		tips.push({
			id: "acc-ur-mismatch",
			severity: "info",
			title: "Accuracy is High but UR is Loose",
			message: "You're hitting notes in the window, but your timing spread is wide. Focus on precision — try to tighten your UR below 130 without losing accuracy.",
		});
	}

	// Short burst comfort zone
	const shortBursts = drillBreakdowns.filter((d) => {
		const num = parseInt(d.burstType);
		return !isNaN(num) && num <= 5;
	});
	const longBursts = drillBreakdowns.filter((d) => {
		const num = parseInt(d.burstType);
		return !isNaN(num) && num >= 12;
	});

	if (shortBursts.length >= 3 && longBursts.length === 0) {
		tips.push({
			id: "no-streams",
			severity: "action",
			title: "Try Longer Streams",
			message: "You're comfortable with short bursts but haven't attempted streams (12+ notes). Streams build stamina and expose technique problems that short bursts hide.",
			drill: "burst16_150",
		});
	}

	if (shortBursts.length >= 2 && longBursts.length >= 2) {
		const shortAvgAcc = shortBursts.reduce((s, d) => s + d.avgAccuracy, 0) / shortBursts.length;
		const longAvgAcc = longBursts.reduce((s, d) => s + d.avgAccuracy, 0) / longBursts.length;

		if (shortAvgAcc - longAvgAcc > 0.08) {
			tips.push({
				id: "stamina-gap",
				severity: "warning",
				title: "Stamina Gap",
				message: `Your short burst accuracy is ${(shortAvgAcc * 100).toFixed(1)}% but drops to ${(longAvgAcc * 100).toFixed(1)}% on streams. Your technique breaks down over sustained notes. Practice longer drills at a lower BPM to build endurance.`,
			});
		}
	}

	// BPM ceiling stagnation
	if (bpmCeiling && bpmCeiling < 170 && totalSessions > 20) {
		tips.push({
			id: "ceiling-low",
			severity: "info",
			title: "Push Your Speed",
			message: `Your BPM ceiling is ${bpmCeiling}. After ${totalSessions} sessions, consider pushing into higher BPMs even if accuracy drops initially. Short burst drills at 10-20 BPM above your ceiling will help you adapt.`,
		});
	}

	// Good overall
	if (tips.length === 0) {
		tips.push({
			id: "profile-good",
			severity: "info",
			title: "Looking Good Overall",
			message: "Your stats are balanced and progressing well. Keep varying your drills and pushing BPM when you feel comfortable.",
		});
	}

	return tips;
}
