import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

type Props = {
	histogram: Record<string, number>;
};

export default function HistogramChart({ histogram }: Props) {
	const data = Object.entries(histogram)
		.map(([bin, count]) => ({
			bin: Number(bin),
			count,
		}))
		.sort((a, b) => a.bin - b.bin);

	return (
		<div style={{ width: "100%", height: 250 }}>
			<ResponsiveContainer>
				<BarChart data={data}>
					<XAxis dataKey="bin" tickFormatter={(v) => `${v}ms`} />
					<YAxis />
					<Tooltip />
					<Bar dataKey="count" fill="#22d3ee" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
