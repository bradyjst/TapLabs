export function calcAccuracy(
	h300: number,
	h100: number,
	h50: number,
	miss: number
) {
	const total = h300 + h100 + h50 + miss;
	if (total === 0) return 0;

	return (
		(300 * h300 + 100 * h100 + 50 * h50) /
		(300 * total)
	);
}

export function getGrade(acc: number) {
	if (acc >= 1) return "SS";
	if (acc >= 0.95) return "S";
	if (acc >= 0.90) return "A";
	if (acc >= 0.80) return "B";
	if (acc >= 0.70) return "C";
	return "D";
}