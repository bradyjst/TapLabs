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

type LeaderboardRow = {
	user_id: string;
	best_accuracy: number;
	best_ur: number;
	sessions: number;
	player_card: CardCosmetics | null;
	display_name: string | null;
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
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			const { data, error: rpcError } = await supabase.rpc("get_leaderboard", {
				lim: 10,
			});

			if (cancelled) return;

			if (rpcError) {
				console.error("Leaderboard fetch failed:", rpcError);
				setError("Failed to load leaderboard.");
				setLoading(false);
				return;
			}

			if (data) {
				setEntries(
					(data as LeaderboardRow[]).map((row, i) => ({
						rank: i + 1,
						user_id: row.user_id,
						best_accuracy: row.best_accuracy,
						best_ur: row.best_ur,
						sessions: row.sessions,
						player_card: {
							...DEFAULT_COSMETICS,
							...(row.player_card ?? {}),
						},
						display_name:
							row.display_name ??
							(row.player_card as CardCosmetics | null)?.displayName ??
							null,
						email_prefix: row.user_id.slice(0, 8),
						is_paid: row.is_paid,
					})),
				);
			}

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

	if (error) {
		return (
			<div className="lb-section">
				<h3 className="lb-title">Leaderboard</h3>
				<div className="lb-empty">{error}</div>
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

	return (
		<div className="lb-section">
			<h3 className="lb-title">Leaderboard</h3>

			<div className="lb-list">
				{entries.map((entry) => {
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
		</div>
	);
}
