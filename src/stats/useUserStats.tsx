import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabase";

type Session = {
	drill_id: string;
	bpm: number;
	hit_300: number;
	hit_100: number;
	hit_50: number;
	miss: number;
	accuracy: number;
	unstable_rate: number;
	grade: string;
	created_at: string;
};

type DrillBreakdown = {
	drillId: string;
	burstType: string;
	bpm: number;
	sessions: number;
	avgAccuracy: number;
	avgUr: number;
	bestUr: number;
	bestGrade: string;
};

export type UserStats = {
	totalSessions: number;
	totalHits: number;
	total300: number;
	total100: number;
	total50: number;
	totalMiss: number;
	overallHitRate: number;
	avgAccuracy: number;
	bestAccuracy: number;
	avgUr: number;
	bestUr: number;
	bestGrade: string;
	mostPlayedDrill: string | null;
	mostPlayedBpm: number | null;
	bpmCeiling: number | null;
	firstSessionAt: string | null;
	lastSessionAt: string | null;
	recentTrend: {
		date: string;
		avgAccuracy: number;
		avgUr: number;
		sessions: number;
	}[];
	drillBreakdowns: DrillBreakdown[];
};

const GRADE_RANK: Record<string, number> = {
	SS: 6,
	S: 5,
	A: 4,
	B: 3,
	C: 2,
	D: 1,
};

function bestGrade(a: string, b: string): string {
	return (GRADE_RANK[a] ?? 0) >= (GRADE_RANK[b] ?? 0) ? a : b;
}

function parseBurstType(drillId: string): { burstType: string; bpm: number } {
	// drill IDs are like "burst5_180"
	const match = drillId.match(/^burst(\d+)_(\d+)$/);
	if (!match) return { burstType: drillId, bpm: 0 };
	return { burstType: `${match[1]} Burst`, bpm: Number(match[2]) };
}

function computeStats(sessions: Session[]): UserStats {
	if (sessions.length === 0) {
		return {
			totalSessions: 0,
			totalHits: 0,
			total300: 0,
			total100: 0,
			total50: 0,
			totalMiss: 0,
			overallHitRate: 0,
			avgAccuracy: 0,
			bestAccuracy: 0,
			avgUr: 0,
			bestUr: 0,
			bestGrade: "-",
			mostPlayedDrill: null,
			mostPlayedBpm: null,
			bpmCeiling: null,
			firstSessionAt: null,
			lastSessionAt: null,
			recentTrend: [],
			drillBreakdowns: [],
		};
	}

	let total300 = 0;
	let total100 = 0;
	let total50 = 0;
	let totalMiss = 0;
	let sumAccuracy = 0;
	let bestAccuracyVal = 0;
	let sumUr = 0;
	let bestUrVal = Infinity;
	let topGrade = "D";

	// For most played drill
	const drillCounts = new Map<string, number>();
	// For BPM ceiling
	const bpmAccuracies = new Map<number, number[]>();
	// For drill breakdowns
	const drillMap = new Map<
		string,
		{
			sessions: number;
			sumAccuracy: number;
			sumUr: number;
			bestUr: number;
			bestGrade: string;
		}
	>();

	// For daily trend
	const dailyMap = new Map<
		string,
		{ sumAccuracy: number; sumUr: number; count: number }
	>();

	for (const s of sessions) {
		total300 += s.hit_300;
		total100 += s.hit_100;
		total50 += s.hit_50;
		totalMiss += s.miss;
		sumAccuracy += s.accuracy;
		sumUr += s.unstable_rate;

		if (s.accuracy > bestAccuracyVal) bestAccuracyVal = s.accuracy;
		if (s.unstable_rate < bestUrVal) bestUrVal = s.unstable_rate;
		topGrade = bestGrade(topGrade, s.grade);

		// Drill counts
		const { burstType } = parseBurstType(s.drill_id);
		drillCounts.set(burstType, (drillCounts.get(burstType) ?? 0) + 1);

		// BPM ceiling tracking
		if (!bpmAccuracies.has(s.bpm)) bpmAccuracies.set(s.bpm, []);
		bpmAccuracies.get(s.bpm)!.push(s.accuracy);

		// Drill breakdown
		if (!drillMap.has(s.drill_id)) {
			drillMap.set(s.drill_id, {
				sessions: 0,
				sumAccuracy: 0,
				sumUr: 0,
				bestUr: Infinity,
				bestGrade: "D",
			});
		}
		const d = drillMap.get(s.drill_id)!;
		d.sessions++;
		d.sumAccuracy += s.accuracy;
		d.sumUr += s.unstable_rate;
		if (s.unstable_rate < d.bestUr) d.bestUr = s.unstable_rate;
		d.bestGrade = bestGrade(d.bestGrade, s.grade);

		// Daily trend
		const day = s.created_at.slice(0, 10);
		if (!dailyMap.has(day)) {
			dailyMap.set(day, { sumAccuracy: 0, sumUr: 0, count: 0 });
		}
		const dt = dailyMap.get(day)!;
		dt.sumAccuracy += s.accuracy;
		dt.sumUr += s.unstable_rate;
		dt.count++;
	}

	const totalHits = total300 + total100 + total50;
	const totalNotes = totalHits + totalMiss;

	// Most played drill type
	let mostPlayedDrill: string | null = null;
	let maxCount = 0;
	for (const [drill, count] of drillCounts) {
		if (count > maxCount) {
			maxCount = count;
			mostPlayedDrill = drill;
		}
	}

	// Most played BPM
	const bpmCounts = new Map<number, number>();
	for (const s of sessions) {
		bpmCounts.set(s.bpm, (bpmCounts.get(s.bpm) ?? 0) + 1);
	}
	let mostPlayedBpm: number | null = null;
	let maxBpmCount = 0;
	for (const [bpm, count] of bpmCounts) {
		if (count > maxBpmCount) {
			maxBpmCount = count;
			mostPlayedBpm = bpm;
		}
	}

	// BPM ceiling: highest BPM where average accuracy >= 95%
	let bpmCeiling: number | null = null;
	const sortedBpms = [...bpmAccuracies.keys()].sort((a, b) => b - a);
	for (const bpm of sortedBpms) {
		const accs = bpmAccuracies.get(bpm)!;
		const avg = accs.reduce((a, b) => a + b, 0) / accs.length;
		if (avg >= 95) {
			bpmCeiling = bpm;
			break;
		}
	}

	// Recent trend (last 30 days, sorted by date)
	const recentTrend = [...dailyMap.entries()]
		.map(([date, d]) => ({
			date,
			avgAccuracy: d.sumAccuracy / d.count,
			avgUr: d.sumUr / d.count,
			sessions: d.count,
		}))
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(-30);

	// Drill breakdowns sorted by session count
	const drillBreakdowns: DrillBreakdown[] = [...drillMap.entries()]
		.map(([drillId, d]) => {
			const { burstType, bpm } = parseBurstType(drillId);
			return {
				drillId,
				burstType,
				bpm,
				sessions: d.sessions,
				avgAccuracy: d.sumAccuracy / d.sessions,
				avgUr: d.sumUr / d.sessions,
				bestUr: d.bestUr,
				bestGrade: d.bestGrade,
			};
		})
		.sort((a, b) => b.sessions - a.sessions);

	const sorted = sessions.sort(
		(a, b) =>
			new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
	);

	return {
		totalSessions: sessions.length,
		totalHits,
		total300,
		total100,
		total50,
		totalMiss,
		overallHitRate: totalNotes > 0 ? (totalHits / totalNotes) * 100 : 0,
		avgAccuracy: sumAccuracy / sessions.length,
		bestAccuracy: bestAccuracyVal,
		avgUr: sumUr / sessions.length,
		bestUr: bestUrVal === Infinity ? 0 : bestUrVal,
		bestGrade: topGrade,
		mostPlayedDrill,
		mostPlayedBpm,
		bpmCeiling,
		firstSessionAt: sorted[0]?.created_at ?? null,
		lastSessionAt: sorted[sorted.length - 1]?.created_at ?? null,
		recentTrend,
		drillBreakdowns,
	};
}

export function useUserStats() {
	const { user } = useAuth();
	const [stats, setStats] = useState<UserStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user) return;

		let cancelled = false;

		async function fetchStats() {
			setLoading(true);
			setError(null);

			const { data, error: fetchError } = await supabase
				.from("sessions")
				.select(
					"drill_id, bpm, hit_300, hit_100, hit_50, miss, accuracy, unstable_rate, grade, created_at",
				)
				.eq("user_id", user!.id)
				.order("created_at", { ascending: true });

			if (cancelled) return;

			if (fetchError) {
				console.error("Failed to load user stats:", fetchError);
				setError(fetchError.message);
				setLoading(false);
				return;
			}

			setStats(computeStats(data ?? []));
			setLoading(false);
		}

		fetchStats();

		return () => {
			cancelled = true;
		};
	}, [user]);

	if (!user) {
		return { stats: null, loading: false, error: null };
	}

	return { stats, loading, error };
}
