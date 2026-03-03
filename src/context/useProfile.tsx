import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabase";
import {
	DEFAULT_COSMETICS,
	type CardCosmetics,
} from "../components/PlayerCard/PlayerCard";

export type Profile = {
	id: string;
	is_paid: boolean;
	is_admin: boolean;
	display_name: string | null;
	osu_profile_url: string | null;
	player_card: CardCosmetics;
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
				.select(
					"id, is_paid, is_admin, display_name, osu_profile_url, player_card, created_at",
				)
				.eq("id", user!.id)
				.single();

			if (cancelled) return;

			if (fetchError) {
				console.error("Failed to load profile:", fetchError);
				setError(fetchError.message);
				setLoading(false);
				return;
			}

			setProfile({
				...data,
				player_card: { ...DEFAULT_COSMETICS, ...(data.player_card ?? {}) },
			});
			setLoading(false);
		}

		fetchProfile();

		return () => {
			cancelled = true;
		};
	}, [user]);

	const updateDisplayName = useCallback(
		async (name: string | null) => {
			if (!user) return false;

			const trimmed = name?.trim() || null;

			const { error: updateError } = await supabase
				.from("profiles")
				.update({ display_name: trimmed })
				.eq("id", user.id);

			if (updateError) {
				console.error("Failed to update display name:", updateError);
				return false;
			}

			setProfile((prev) => (prev ? { ...prev, display_name: trimmed } : prev));
			return true;
		},
		[user],
	);

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

	const updatePlayerCard = useCallback(
		async (card: CardCosmetics) => {
			if (!user) return false;

			const { error: updateError } = await supabase
				.from("profiles")
				.update({ player_card: card })
				.eq("id", user.id);

			if (updateError) {
				console.error("Failed to update player card:", updateError);
				return false;
			}

			setProfile((prev) => (prev ? { ...prev, player_card: card } : prev));
			return true;
		},
		[user],
	);

	if (!user) {
		return {
			profile: null,
			isPaid: false,
			isAdmin: false,
			loading: false,
			error: null,
			displayName: null,
			updateDisplayName,
			updateOsuProfile,
			updatePlayerCard,
		};
	}

	const isPaid = profile?.is_paid ?? false;
	const isAdmin = profile?.is_admin ?? false;
	const displayName = profile?.display_name ?? null;

	return {
		profile,
		isPaid,
		isAdmin,
		loading,
		error,
		displayName,
		updateDisplayName,
		updateOsuProfile,
		updatePlayerCard,
	};
}
