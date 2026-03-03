import type { CoachTip } from "./coachEngine";
import "./CoachTips.css";

interface CoachTipsProps {
	tips: CoachTip[];
	title?: string;
}

export default function CoachTips({ tips, title = "Coach" }: CoachTipsProps) {
	if (tips.length === 0) return null;

	return (
		<div className="coach-section">
			<h3 className="coach-title">🎯 {title}</h3>
			<div className="coach-tips">
				{tips.map((tip) => (
					<div key={tip.id} className={`coach-tip severity-${tip.severity}`}>
						<div className="coach-tip-header">
							<span className="coach-tip-icon">
								{tip.severity === "action"
									? "⚡"
									: tip.severity === "warning"
										? "⚠️"
										: "💡"}
							</span>
							<span className="coach-tip-title">{tip.title}</span>
						</div>
						<p className="coach-tip-msg">{tip.message}</p>
						{tip.drill && (
							<span className="coach-tip-drill">Try: {tip.drill}</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
