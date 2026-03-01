import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabase";

export type Profile = {
	id: string;
	is_paid: boolean;
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
				.select("id, is_paid, created_at")
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

	// Derive state for no-user case instead of setting it in the effect
	if (!user) {
		return { profile: null, isPaid: false, loading: false, error: null };
	}

	const isPaid = profile?.is_paid ?? false;

	return { profile, isPaid, loading, error };
}
