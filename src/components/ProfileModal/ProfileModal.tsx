import { useEffect } from "react";
import { Link } from "react-router-dom";
import { signOut } from "../../lib/auth";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../lib/supabase";
import { useProfile } from "../../context/useProfile";
import { useUserStats } from "../../stats/useUserStats";
import "./ProfileModal.css";

interface Props {
	onClose: () => void;
}

export default function ProfileModal({ onClose }: Props) {
	const { user } = useAuth();
	const { isPaid, loading } = useProfile();
	const { stats, loading: statsLoading } = useUserStats();

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onClose]);

	async function startCheckout() {
		try {
			const { data, error } = await supabase.functions.invoke("checkout");

			if (error) {
				console.error("Checkout error:", error);
				return;
			}

			if (data?.url) {
				window.location.href = data.url;
			} else {
				console.error("No checkout URL returned:", data);
			}
		} catch (err) {
			console.error("Unexpected checkout failure:", err);
		}
	}

	async function openCustomerPortal() {
		const { data, error } = await supabase.functions.invoke("customer-portal");

		if (error) {
			console.error("Portal error:", error);
			return;
		}

		window.location.href = data.url;
	}

	if (!user) return null;

	const username = user.email?.split("@")[0];

	return (
		<div className="profile-modal-overlay" onClick={onClose}>
			<div className="profile-container" onClick={(e) => e.stopPropagation()}>
				<div className="profile-header">
					<h2>Profile</h2>

					<button className="profile-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="profile-section">
					<h3>Account</h3>

					<div className="profile-row">
						<span className="label">User</span>
						<span className="value">{username}</span>
					</div>

					<div className="profile-row">
						<span className="label">Email</span>
						<span className="value">{user.email}</span>
					</div>

					{stats?.firstSessionAt && (
						<div className="profile-row">
							<span className="label">Member Since</span>
							<span className="value">
								{new Date(stats.firstSessionAt).toLocaleDateString()}
							</span>
						</div>
					)}
				</div>

				<div className="profile-section">
					<h3>Lifetime Stats</h3>

					{statsLoading ? (
						<p className="stats-loading">Loading stats...</p>
					) : !stats || stats.totalSessions === 0 ? (
						<p className="stats-empty">
							No sessions yet. Start a drill to see your stats here.
						</p>
					) : (
						<>
							<div className="stats-grid">
								<StatCard
									label="Sessions"
									value={stats.totalSessions.toLocaleString()}
								/>
								<StatCard
									label="Total Hits"
									value={stats.totalHits.toLocaleString()}
								/>
								<StatCard label="Best Grade" value={stats.bestGrade} />
								<StatCard
									label="BPM Ceiling"
									value={stats.bpmCeiling ? `${stats.bpmCeiling}` : "—"}
								/>
							</div>

							<div className="profile-row">
								<span className="label">Avg Accuracy</span>
								<span className="value">{stats.avgAccuracy.toFixed(2)}%</span>
							</div>

							<div className="profile-row">
								<span className="label">Best Accuracy</span>
								<span className="value">{stats.bestAccuracy.toFixed(2)}%</span>
							</div>

							<div className="profile-row">
								<span className="label">Avg UR</span>
								<span className="value">{stats.avgUr.toFixed(1)}</span>
							</div>

							<div className="profile-row">
								<span className="label">Best UR</span>
								<span className="value accent">{stats.bestUr.toFixed(1)}</span>
							</div>

							<div className="profile-row">
								<span className="label">Hit Rate</span>
								<span className="value">
									{stats.overallHitRate.toFixed(1)}%
								</span>
							</div>

							{stats.mostPlayedDrill && (
								<div className="profile-row">
									<span className="label">Most Played</span>
									<span className="value">
										{stats.mostPlayedDrill}
										{stats.mostPlayedBpm ? ` @ ${stats.mostPlayedBpm} BPM` : ""}
									</span>
								</div>
							)}

							<div className="hit-breakdown">
								<div className="hit-bar">
									<div
										className="hit-segment perfect"
										style={{
											width: `${(stats.total300 / (stats.totalHits + stats.totalMiss)) * 100}%`,
										}}
										title={`300: ${stats.total300}`}
									/>
									<div
										className="hit-segment good"
										style={{
											width: `${(stats.total100 / (stats.totalHits + stats.totalMiss)) * 100}%`,
										}}
										title={`100: ${stats.total100}`}
									/>
									<div
										className="hit-segment ok"
										style={{
											width: `${(stats.total50 / (stats.totalHits + stats.totalMiss)) * 100}%`,
										}}
										title={`50: ${stats.total50}`}
									/>
									<div
										className="hit-segment miss"
										style={{
											width: `${(stats.totalMiss / (stats.totalHits + stats.totalMiss)) * 100}%`,
										}}
										title={`Miss: ${stats.totalMiss}`}
									/>
								</div>

								<div className="hit-legend">
									<span className="legend-item">
										<span className="legend-dot perfect" />
										300
									</span>
									<span className="legend-item">
										<span className="legend-dot good" />
										100
									</span>
									<span className="legend-item">
										<span className="legend-dot ok" />
										50
									</span>
									<span className="legend-item">
										<span className="legend-dot miss" />
										Miss
									</span>
								</div>
							</div>
						</>
					)}
				</div>

				<div className="profile-section">
					<h3>Membership</h3>

					<div className="profile-row">
						<span className="label">Status</span>

						<span className={`value ${isPaid ? "member" : "free"}`}>
							{loading ? "Loading..." : isPaid ? "Member" : "Free User"}
						</span>
					</div>

					{!loading && !isPaid && (
						<>
							<button onClick={startCheckout} className="upgrade-btn">
								Become a Member
							</button>

							<Link
								to="/membership"
								className="membership-info-link"
								onClick={onClose}
							>
								Learn what's included →
							</Link>
						</>
					)}

					{!loading && isPaid && (
						<button onClick={openCustomerPortal} className="manage-btn">
							Manage Subscription
						</button>
					)}
				</div>

				<div className="profile-section">
					<button className="logout-btn" onClick={signOut}>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="stat-card">
			<span className="stat-card-value">{value}</span>
			<span className="stat-card-label">{label}</span>
		</div>
	);
}
