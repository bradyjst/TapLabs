import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../lib/supabase";

export type Profile = {
	id: string;
	is_paid: boolean;
	osu_profile_url: string | null;
	created_at: string;
};

export function useProfile() {
	const { user } = useAuth();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user) return;

		let cancelled = false;

		async function fetchProfile() {
			setLoading(true);
			setError(null);

			const { data, error: fetchError } = await supabase
				.from("profiles")
				.select("id, is_paid, osu_profile_url, created_at")
				.eq("id", user!.id)
				.single();

			if (cancelled) return;

			if (fetchError) {
				console.error("Failed to load profile:", fetchError);
				setError(fetchError.message);
				setLoading(false);
				return;
			}

			setProfile(data);
			setLoading(false);
		}

		fetchProfile();

		return () => {
			cancelled = true;
		};
	}, [user]);

	const updateOsuProfile = useCallback(
		async (url: string | null) => {
			if (!user) return false;

			const { error: updateError } = await supabase
				.from("profiles")
				.update({ osu_profile_url: url })
				.eq("id", user.id);

			if (updateError) {
				console.error("Failed to update osu profile:", updateError);
				return false;
			}

			setProfile((prev) => (prev ? { ...prev, osu_profile_url: url } : prev));
			return true;
		},
		[user],
	);

	if (!user) {
		return {
			profile: null,
			isPaid: false,
			loading: false,
			error: null,
			updateOsuProfile,
		};
	}

	const isPaid = profile?.is_paid ?? false;

	return { profile, isPaid, loading, error, updateOsuProfile };
}
