import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./StatsPanel.css";
import type { SessionAnalytics } from "../analytics/sessionAnalyzer";
import { analyzeSession } from "../coach/coachEngine";
import CoachTips from "../coach/CoachTips";
import HistogramChart from "../components/Charts/HistogramChart";
import DriftCurveChart from "../components/Charts/DriftCurveChart";

type Props = {
	data: SessionAnalytics | null;
	isPaid?: boolean;
	onClose: () => void;
	hidePremium: boolean;
};

export default function StatsPanel({
	data,
	isPaid = false,
	onClose,
	hidePremium,
}: Props) {
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onClose]);

	const coachTips = useMemo(() => {
		if (!data) return [];
		return analyzeSession(data);
	}, [data]);

	if (!data) return null;

	const {
		meanOffset,
		unstableRate,
		stdDev,
		earlyPercent,
		latePercent,
		leftMean,
		rightMean,
		imbalancePercent,
		gallopingRisk,
		consistencyScore,
		totalTaps,
	} = data;

	const driftLabel =
		Math.abs(meanOffset) < 2 ? "Centered" : meanOffset < 0 ? "Early" : "Late";

	const driftClass =
		Math.abs(meanOffset) < 2 ? "neutral" : meanOffset < 0 ? "early" : "late";

	return (
		<div className="stats-modal-overlay" onClick={onClose}>
			<div className="stats-panel" onClick={(e) => e.stopPropagation()}>
				<div className="stats-header">
					<h2>Session Stats</h2>
					<button className="stats-close" onClick={onClose}>
						✕
					</button>
				</div>

				{/* FREE SECTION */}

				<div className="stats-section free">
					<h3>Session Summary</h3>

					<StatRow label="Total Hits" value={totalTaps} />

					<StatRow label="Timing Spread" value={`${stdDev.toFixed(2)} ms`} />

					<StatRow label="Unstable Rate" value={unstableRate.toFixed(0)} />

					<StatRow
						label="Mean Offset"
						value={`${meanOffset.toFixed(2)} ms`}
						highlight={driftClass}
					/>

					<StatRow label="Drift" value={driftLabel} highlight={driftClass} />

					<StatRow
						label="Early / Late"
						value={`${(earlyPercent * 100).toFixed(0)}% / ${(
							latePercent * 100
						).toFixed(0)}%`}
					/>

					<StatRow label="Left Mean" value={`${leftMean.toFixed(2)} ms`} />

					<StatRow label="Right Mean" value={`${rightMean.toFixed(2)} ms`} />

					<StatRow
						label="Imbalance"
						value={`${imbalancePercent.toFixed(1)}%`}
					/>
				</div>

				{/* ADVANCED + COACHING (hidden if free user opted out) */}
				{(isPaid || !hidePremium) && (
					<>
						<div
							className={`stats-section advanced ${!isPaid ? "locked" : ""}`}
						>
							<h3>Advanced Diagnostics {isPaid ? "" : " 🔒"}</h3>

							{isPaid ? (
								<>
									<h4>Timing Distribution</h4>

									<HistogramChart histogram={data.histogram} />

									<h4>Drift Over Session</h4>

									<DriftCurveChart driftCurve={data.driftCurve} />

									<StatRow
										label="Consistency Score"
										value={consistencyScore.toFixed(0)}
										highlight={getConsistencyClass(consistencyScore)}
									/>

									<StatRow
										label="Galloping Risk"
										value={`${gallopingRisk.toFixed(0)}%`}
										highlight={getRiskClass(gallopingRisk)}
									/>
								</>
							) : (
								<p className="locked-text">
									Unlock deep rhythm diagnostics and performance curves.
								</p>
							)}
						</div>

						{isPaid ? (
							<div className="stats-section">
								<CoachTips tips={coachTips} title="Session Coaching" />
							</div>
						) : (
							<div className="coach-locked">
								<span className="coach-locked-icon">🎯</span>
								<h3>Coaching</h3>
								<p>Get personalized tips after every session.</p>
								<Link to="/membership" className="coach-locked-link">
									View Membership
								</Link>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);

	/* ------------------ */
	/* Stat Row Component */
	/* ------------------ */

	function StatRow({
		label,
		value,
		highlight,
	}: {
		label: string;
		value: string | number;
		highlight?: string;
	}) {
		return (
			<div className="stat-row">
				<span className="label">{label}</span>
				<span className={`value ${highlight ?? ""}`}>{value}</span>
			</div>
		);
	}

	/* ------------------ */
	/* Helpers */
	/* ------------------ */

	function getConsistencyClass(score: number) {
		if (score > 75) return "good";
		if (score > 50) return "medium";
		return "bad";
	}

	function getRiskClass(risk: number) {
		if (risk < 30) return "good";
		if (risk < 60) return "medium";
		return "bad";
	}
}
