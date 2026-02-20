import { supabase } from "./supabase";

export async function getBestGrades(userId: string) {
	const { data, error } = await supabase
		.from("sessions")
		.select("drill_id, grade")
		.eq("user_id", userId)
		.order("accuracy", { ascending: false });

	if (error) {
		console.error(error);
		return {};
	}

	console.log("Best grade query:", data);

	const best: Record<string, string> = {};

	for (const row of data) {
		if (!best[row.drill_id]) {
			best[row.drill_id] = row.grade;
		}
	}

	return best;
}