import { useState } from "react";
import { Link } from "react-router-dom";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";
import { useAuth } from "../../context/useAuth";
import { useProfile } from "./useProfile";
import { useUserStats } from "../../stats/useUserStats";
import type { UserStats } from "../../stats/useUserStats";
import "./Profile.css";

export default function Profile() {
	const { user } = useAuth();
	const {
		profile,
		isPaid,
		loading: profileLoading,
		updateOsuProfile,
	} = useProfile();
	const { stats, loading: statsLoading } = useUserStats();

	if (!user) {
		return (
			<div className="profile-page">
				<div className="profile-page-inner">
					<Link to="/" className="profile-back-link">
						← Back to TapLabs
					</Link>
					<div className="profile-empty-state">
						<h1>Sign in to view your profile</h1>
						<p>Your stats, charts, and progress will appear here.</p>
						<Link to="/" className="profile-cta-btn">
							Go to TapLabs
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const loading = profileLoading || statsLoading;
	const username = user.email?.split("@")[0];

	return (
		<div className="profile-page">
			<div className="profile-page-inner">
				<Link to="/" className="profile-back-link">
					← Back to TapLabs
				</Link>

				<div className="profile-page-header">
					<div className="profile-identity">
						<h1>{username}</h1>
						<span className="profile-email">{user.email}</span>
						{stats?.firstSessionAt && (
							<span className="profile-joined">
								Joined {new Date(stats.firstSessionAt).toLocaleDateString()}
							</span>
						)}
					</div>

					<div className="profile-badges">
						<span className={`badge ${isPaid ? "member" : "free"}`}>
							{profileLoading ? "..." : isPaid ? "Member" : "Free"}
						</span>
					</div>
				</div>

				<OsuProfileSection
					url={profile?.osu_profile_url ?? null}
					onSave={updateOsuProfile}
				/>

				{loading ? (
					<div className="profile-loading">Loading your stats...</div>
				) : !stats || stats.totalSessions === 0 ? (
					<div className="profile-empty-state">
						<h2>No sessions yet</h2>
						<p>
							Complete some drills and your performance data will appear here.
						</p>
						<Link to="/" className="profile-cta-btn">
							Start Training
						</Link>
					</div>
				) : (
					<>
						<StatsOverview stats={stats} />
						<ChartsSection stats={stats} />
						<HitBreakdown stats={stats} />
						<DrillBreakdowns stats={stats} />
					</>
				)}
			</div>
		</div>
	);
}

/* ======================== */
/* osu! Profile Section     */
/* ======================== */

function OsuProfileSection({
	url,
	onSave,
}: {
	url: string | null;
	onSave: (url: string | null) => Promise<boolean>;
}) {
	const [editing, setEditing] = useState(false);
	const [input, setInput] = useState(url ?? "");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function validateOsuUrl(value: string): boolean {
		if (!value.trim()) return true;
		return /^https:\/\/osu\.ppy\.sh\/users\/\d+/.test(value.trim());
	}

	async function handleSave() {
		const trimmed = input.trim();

		if (trimmed && !validateOsuUrl(trimmed)) {
			setError(
				"Please enter a valid osu! profile URL (e.g. https://osu.ppy.sh/users/12345)",
			);
			return;
		}

		setSaving(true);
		setError(null);

		const success = await onSave(trimmed || null);

		setSaving(false);

		if (success) {
			setEditing(false);
		} else {
			setError("Failed to save. Please try again.");
		}
	}

	if (!editing) {
		return (
			<div className="profile-section-card osu-section">
				<div className="section-card-header">
					<h2>osu! Profile</h2>
					<button
						className="section-edit-btn"
						onClick={() => {
							setInput(url ?? "");
							setEditing(true);
						}}
					>
						{url ? "Edit" : "Link Profile"}
					</button>
				</div>

				{url ? (
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="osu-link"
					>
						{url}
					</a>
				) : (
					<p className="osu-empty">
						Link your osu! profile to participate in contests and verify your
						identity.
					</p>
				)}
			</div>
		);
	}

	return (
		<div className="profile-section-card osu-section">
			<div className="section-card-header">
				<h2>osu! Profile</h2>
			</div>

			<div className="osu-edit-form">
				<input
					type="url"
					className="osu-input"
					placeholder="https://osu.ppy.sh/users/12345"
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
						setError(null);
					}}
					autoFocus
				/>

				{error && <p className="osu-error">{error}</p>}

				<div className="osu-edit-actions">
					<button
						className="osu-save-btn"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? "Saving..." : "Save"}
					</button>
					<button
						className="osu-cancel-btn"
						onClick={() => {
							setEditing(false);
							setError(null);
						}}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}

/* ======================== */
/* Stats Overview Cards     */
/* ======================== */

function StatsOverview({ stats }: { stats: UserStats }) {
	return (
		<div className="profile-section-card">
			<h2>Overview</h2>

			<div className="overview-grid">
				<OverviewCard
					label="Sessions"
					value={stats.totalSessions.toLocaleString()}
				/>
				<OverviewCard
					label="Total Hits"
					value={stats.totalHits.toLocaleString()}
				/>
				<OverviewCard label="Best Grade" value={stats.bestGrade} />
				<OverviewCard
					label="BPM Ceiling"
					value={stats.bpmCeiling ? `${stats.bpmCeiling}` : "—"}
					accent
				/>
				<OverviewCard
					label="Avg Accuracy"
					value={`${stats.avgAccuracy.toFixed(2)}%`}
				/>
				<OverviewCard
					label="Best Accuracy"
					value={`${stats.bestAccuracy.toFixed(2)}%`}
				/>
				<OverviewCard label="Avg UR" value={stats.avgUr.toFixed(1)} />
				<OverviewCard label="Best UR" value={stats.bestUr.toFixed(1)} accent />
				<OverviewCard
					label="Hit Rate"
					value={`${stats.overallHitRate.toFixed(1)}%`}
				/>
				<OverviewCard
					label="Most Played"
					value={stats.mostPlayedDrill ? `${stats.mostPlayedDrill}` : "—"}
				/>
			</div>
		</div>
	);
}

function OverviewCard({
	label,
	value,
	accent,
}: {
	label: string;
	value: string;
	accent?: boolean;
}) {
	return (
		<div className="overview-card">
			<span className={`overview-card-value ${accent ? "accent" : ""}`}>
				{value}
			</span>
			<span className="overview-card-label">{label}</span>
		</div>
	);
}

/* ======================== */
/* Charts Section           */
/* ======================== */

function ChartsSection({ stats }: { stats: UserStats }) {
	if (stats.recentTrend.length < 2) return null;

	const trend = stats.recentTrend;

	return (
		<div className="profile-section-card">
			<h2>Progress</h2>

			<div className="charts-grid">
				<div className="chart-container">
					<h3>Accuracy Over Time</h3>
					<div className="chart-wrapper">
						<ResponsiveContainer width="100%" height={220}>
							<LineChart data={trend}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
								<XAxis
									dataKey="date"
									tickFormatter={(d) => formatDate(d)}
									stroke="var(--text-muted)"
									fontSize={11}
								/>
								<YAxis
									domain={["auto", "auto"]}
									stroke="var(--text-muted)"
									fontSize={11}
									tickFormatter={(v) => `${v}%`}
								/>
								<Tooltip
									contentStyle={{
										background: "var(--surface)",
										border: "1px solid var(--border)",
										borderRadius: 8,
										fontSize: 12,
									}}
									formatter={(v: number | undefined) => [
										v !== undefined ? `${v.toFixed(2)}%` : "",
										"Accuracy",
									]}
									labelFormatter={(d) => formatDate(d)}
								/>
								<Line
									type="monotone"
									dataKey="avgAccuracy"
									stroke="var(--accent)"
									strokeWidth={2}
									dot={{ fill: "var(--accent)", r: 3 }}
									activeDot={{ r: 5 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="chart-container">
					<h3>Unstable Rate Over Time</h3>
					<div className="chart-wrapper">
						<ResponsiveContainer width="100%" height={220}>
							<LineChart data={trend}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
								<XAxis
									dataKey="date"
									tickFormatter={(d) => formatDate(d)}
									stroke="var(--text-muted)"
									fontSize={11}
								/>
								<YAxis
									domain={["auto", "auto"]}
									stroke="var(--text-muted)"
									fontSize={11}
								/>
								<Tooltip
									contentStyle={{
										background: "var(--surface)",
										border: "1px solid var(--border)",
										borderRadius: 8,
										fontSize: 12,
									}}
									formatter={(v: number | undefined) => [
										v !== undefined ? v.toFixed(1) : "",
										"UR",
									]}
									labelFormatter={(d) => formatDate(d)}
								/>
								<Line
									type="monotone"
									dataKey="avgUr"
									stroke="#4ade80"
									strokeWidth={2}
									dot={{ fill: "#4ade80", r: 3 }}
									activeDot={{ r: 5 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="chart-container">
					<h3>Sessions Per Day</h3>
					<div className="chart-wrapper">
						<ResponsiveContainer width="100%" height={220}>
							<BarChart data={trend}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
								<XAxis
									dataKey="date"
									tickFormatter={(d) => formatDate(d)}
									stroke="var(--text-muted)"
									fontSize={11}
								/>
								<YAxis
									stroke="var(--text-muted)"
									fontSize={11}
									allowDecimals={false}
								/>
								<Tooltip
									contentStyle={{
										background: "var(--surface)",
										border: "1px solid var(--border)",
										borderRadius: 8,
										fontSize: 12,
									}}
									formatter={(v: number | undefined) => [v ?? 0, "Sessions"]}
									labelFormatter={(d) => formatDate(d)}
								/>
								<Bar
									dataKey="sessions"
									fill="var(--accent)"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ======================== */
/* Hit Breakdown            */
/* ======================== */

function HitBreakdown({ stats }: { stats: UserStats }) {
	const total = stats.totalHits + stats.totalMiss;
	if (total === 0) return null;

	const segments = [
		{ label: "300", count: stats.total300, cls: "perfect" },
		{ label: "100", count: stats.total100, cls: "good" },
		{ label: "50", count: stats.total50, cls: "ok" },
		{ label: "Miss", count: stats.totalMiss, cls: "miss" },
	];

	return (
		<div className="profile-section-card">
			<h2>Hit Distribution</h2>

			<div className="hit-bar-large">
				{segments.map((seg) => (
					<div
						key={seg.cls}
						className={`hit-seg-large ${seg.cls}`}
						style={{ width: `${(seg.count / total) * 100}%` }}
						title={`${seg.label}: ${seg.count.toLocaleString()}`}
					/>
				))}
			</div>

			<div className="hit-stats-row">
				{segments.map((seg) => (
					<div key={seg.cls} className="hit-stat-item">
						<span className={`hit-stat-dot ${seg.cls}`} />
						<span className="hit-stat-label">{seg.label}</span>
						<span className="hit-stat-value">{seg.count.toLocaleString()}</span>
						<span className="hit-stat-pct">
							{((seg.count / total) * 100).toFixed(1)}%
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

/* ======================== */
/* Drill Breakdowns Table   */
/* ======================== */

function DrillBreakdowns({ stats }: { stats: UserStats }) {
	const drills = stats.drillBreakdowns.slice(0, 15);

	if (drills.length === 0) return null;

	return (
		<div className="profile-section-card">
			<h2>Top Drills</h2>

			<div className="drill-table-wrapper">
				<table className="drill-table">
					<thead>
						<tr>
							<th>Drill</th>
							<th>BPM</th>
							<th>Sessions</th>
							<th>Avg Acc</th>
							<th>Avg UR</th>
							<th>Best UR</th>
							<th>Grade</th>
						</tr>
					</thead>
					<tbody>
						{drills.map((d) => (
							<tr key={d.drillId}>
								<td className="drill-name">{d.burstType}</td>
								<td>{d.bpm}</td>
								<td>{d.sessions}</td>
								<td>{d.avgAccuracy.toFixed(1)}%</td>
								<td>{d.avgUr.toFixed(1)}</td>
								<td className="accent">{d.bestUr.toFixed(1)}</td>
								<td>{d.bestGrade}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

/* ======================== */
/* Helpers                  */
/* ======================== */

function formatDate(dateStr: string): string {
	const d = new Date(dateStr);
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
