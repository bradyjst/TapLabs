import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { PlayerCard, DEFAULT_COSMETICS } from "../PlayerCard/PlayerCard";
import type { CardCosmetics } from "../PlayerCard/PlayerCard";
import type { UserStats } from "../../stats/useUserStats";
import "./LeaderBoard.css";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type LeaderboardEntry = {
	rank: number;
	user_id: string;
	best_accuracy: number;
	best_ur: number;
	sessions: number;
	player_card: CardCosmetics;
	display_name: string | null;
	email_prefix: string;
	is_paid: boolean;
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function Leaderboard({
	currentUserId,
}: {
	currentUserId: string | null;
}) {
	const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			const { data: sessions } = await supabase
				.from("sessions")
				.select("user_id, accuracy, unstable_rate");

			const { data: profiles } = await supabase
				.from("profiles")
				.select("id, player_card, display_name, is_paid");

			if (cancelled) return;

			setEntries(buildBoard(sessions ?? [], profiles ?? []));
			setLoading(false);
		}

		load();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) {
		return (
			<div className="lb-section">
				<h3 className="lb-title">Leaderboard</h3>
				<div className="lb-loading">Loading...</div>
			</div>
		);
	}

	if (entries.length === 0) {
		return (
			<div className="lb-section">
				<h3 className="lb-title">Leaderboard</h3>
				<div className="lb-empty">No sessions recorded yet.</div>
			</div>
		);
	}

	const visible = expanded ? entries : entries.slice(0, 5);

	return (
		<div className="lb-section">
			<h3 className="lb-title">Leaderboard</h3>

			<div className="lb-list">
				{visible.map((entry) => {
					const isYou = currentUserId === entry.user_id;
					const miniStats = {
						bestUr: entry.best_ur,
						bpmCeiling: null,
						bestAccuracy: entry.best_accuracy,
					} as UserStats;

					return (
						<div
							key={entry.user_id}
							className={`lb-entry ${isYou ? "lb-entry-you" : ""}`}
						>
							<div className="lb-rank">
								{entry.rank <= 3 ? (
									<span className="lb-medal">
										{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
									</span>
								) : (
									<span className="lb-rank-num">#{entry.rank}</span>
								)}
							</div>

							<div className="lb-card-wrapper">
								<PlayerCard
									cosmetics={entry.player_card}
									stats={miniStats}
									fallbackName={
										entry.display_name ?? entry.email_prefix ?? "Player"
									}
									isPaid={entry.is_paid}
								/>
							</div>

							<div className="lb-score">
								<span className="lb-score-value">
									{(entry.best_accuracy * 100).toFixed(2)}%
								</span>
								<span className="lb-score-label">
									{entry.sessions}{" "}
									{entry.sessions === 1 ? "session" : "sessions"}
								</span>
							</div>
						</div>
					);
				})}
			</div>

			{entries.length > 5 && (
				<button
					className="lb-expand-btn"
					onClick={() => setExpanded((v) => !v)}
				>
					{expanded ? "Show less" : `Show all ${entries.length} players`}
				</button>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

type SessionRow = {
	user_id: string;
	accuracy: number;
	unstable_rate: number;
};

type ProfileRow = {
	id: string;
	player_card: CardCosmetics | null;
	display_name: string | null;
	is_paid: boolean;
};

function buildBoard(
	sessions: SessionRow[],
	profiles: ProfileRow[],
): LeaderboardEntry[] {
	const profileMap = new Map<string, ProfileRow>();
	for (const p of profiles) {
		profileMap.set(p.id, p);
	}

	const userMap = new Map<
		string,
		{ best_accuracy: number; best_ur: number; sessions: number }
	>();

	for (const s of sessions) {
		const existing = userMap.get(s.user_id);
		if (!existing) {
			userMap.set(s.user_id, {
				best_accuracy: s.accuracy,
				best_ur: s.unstable_rate,
				sessions: 1,
			});
		} else {
			existing.sessions++;
			if (s.accuracy > existing.best_accuracy) {
				existing.best_accuracy = s.accuracy;
			}
			if (s.unstable_rate < existing.best_ur) {
				existing.best_ur = s.unstable_rate;
			}
		}
	}

	const entries: LeaderboardEntry[] = [];

	for (const [user_id, data] of userMap) {
		const profile = profileMap.get(user_id);

		entries.push({
			rank: 0,
			user_id,
			best_accuracy: data.best_accuracy,
			best_ur: data.best_ur,
			sessions: data.sessions,
			player_card: {
				...DEFAULT_COSMETICS,
				...(profile?.player_card ?? {}),
			},
			display_name: profile?.display_name ?? null,
			email_prefix: user_id.slice(0, 8),
			is_paid: profile?.is_paid ?? false,
		});
	}

	entries.sort((a, b) => b.best_accuracy - a.best_accuracy);
	entries.forEach((e, i) => (e.rank = i + 1));

	return entries;
}
