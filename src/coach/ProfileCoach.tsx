import { useMemo } from "react";
import { Link } from "react-router-dom";
import { analyzeProfile } from "../../coaching/coachEngine";
import type { UserStats } from "../../stats/useUserStats";
import CoachTips from "../CoachTips/CoachTips";
import "../CoachTips/CoachTips.css";

interface ProfileCoachProps {
	stats: UserStats | null;
	isPaid: boolean;
}

export default function ProfileCoach({ stats, isPaid }: ProfileCoachProps) {
	const tips = useMemo(() => {
		if (!stats) return [];

		return analyzeProfile({
			totalSessions: stats.totalSessions,
			avgAccuracy: stats.avgAccuracy,
			avgUr: stats.avgUr,
			bestUr: stats.bestUr,
			bpmCeiling: stats.bpmCeiling,
			drillBreakdowns: stats.drillBreakdowns,
		});
	}, [stats]);

	if (!isPaid) {
		return (
			<div className="coach-locked">
				<span className="coach-locked-icon">🎯</span>
				<h3>Coach</h3>
				<p>
					Personalized practice recommendations based on your history.
				</p>
				<Link to="/membership" className="coach-locked-link">
					View Membership
				</Link>
			</div>
		);
	}

	if (!stats || tips.length === 0) return null;

	return <CoachTips tips={tips} title="Coach" />;
}
