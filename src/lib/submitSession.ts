import { supabase } from "./supabase";
import { calcAccuracy, getGrade } from "./score";

export async function submitSession(data: {
	userId: string;
	drillId: string;
	bpm: number;
	h300: number;
	h100: number;
	h50: number;
	miss: number;
	meanOffset: number;
	unstableRate: number;
}) {
	const accuracy = calcAccuracy(
		data.h300,
		data.h100,
		data.h50,
		data.miss
	);

	const grade = getGrade(accuracy);

	const { error } = await supabase.from("sessions").insert([
		{
			user_id: data.userId,
			drill_id: data.drillId,
			bpm: data.bpm,
			h_300: data.h300,
			h_100: data.h100,
			h_50: data.h50,
			miss: data.miss,
			accuracy,
			mean_offset: data.meanOffset,
			unstable_rate: data.unstableRate,
			grade,
		},
	]);

	if (error) {
	console.error("SESSION INSERT FAILED:", error);
	alert(JSON.stringify(error, null, 2));
} else {
	console.log("Session inserted successfully");
}
}