import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";

type DriftSegment = {
	segment: number;
	mean: number;
};

type Props = {
	driftCurve: DriftSegment[];
};

export default function DriftCurveChart({ driftCurve }: Props) {
	return (
		<div style={{ width: "100%", height: 250 }}>
			<ResponsiveContainer>
				<LineChart data={driftCurve}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="segment" />
					<YAxis />
					<Tooltip
						formatter={(value: number | undefined) =>
							value !== undefined ? `${value.toFixed(2)} ms` : ""
						}
					/>
					<Line
						type="monotone"
						dataKey="mean"
						stroke="#4ade80"
						strokeWidth={2}
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
