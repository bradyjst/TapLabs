import "./StatsPanel.css";

type Props = {
	alignmentSD: number;
	unstableRate: number;
	meanOffset: number;
};

export default function StatsPanel({
	alignmentSD,
	unstableRate,
	meanOffset,
}: Props) {
	const driftLabel =
		Math.abs(meanOffset) < 2 ? "Centered" : meanOffset < 0 ? "Early" : "Late";

	const driftClass =
		Math.abs(meanOffset) < 2 ? "neutral" : meanOffset < 0 ? "early" : "late";

	return (
		<div className="stats-panel">
			<StatRow label="Timing Spread" value={`${alignmentSD.toFixed(2)} ms`} />
			<StatRow label="Unstable Rate" value={unstableRate.toFixed(0)} />
			<StatRow
				label="Mean Offset"
				value={`${meanOffset.toFixed(2)} ms`}
				highlight={driftClass}
			/>
			<StatRow label="Drift" value={driftLabel} highlight={driftClass} />
		</div>
	);
}

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
