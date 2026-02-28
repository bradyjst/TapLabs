import { useEffect } from "react";
import { signOut } from "../../lib/auth";
import { useAuth } from "../../context/useAuth";
import "./ProfileModal.css";
import { supabase } from "../../lib/supabase";

interface Props {
	onClose: () => void;
}

export default function ProfileModal({ onClose }: Props) {
	const { user } = useAuth();

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onClose]);

	async function startCheckout() {
		const { data } = await supabase.auth.getSession();

		const token = data.session?.access_token;

		console.log("TOKEN:", token);

		const res = await fetch(
			"https://nlpjbhfnriutjcrmdswj.functions.supabase.co/checkout",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		const json = await res.json();

		if (json.url) {
			window.location.href = json.url;
		} else {
			console.error(json);
		}
	}
	if (!user) return null;

	const username = user.email?.split("@")[0];

	return (
		<div className="profile-modal-overlay" onClick={onClose}>
			<div className="profile-container" onClick={(e) => e.stopPropagation()}>
				<div className="profile-header">
					<h2>Profile</h2>

					<button className="profile-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="profile-section">
					<h3>Account</h3>

					<div className="profile-row">
						<span className="label">User</span>
						<span className="value">{username}</span>
					</div>

					<div className="profile-row">
						<span className="label">Email</span>
						<span className="value">{user.email}</span>
					</div>
				</div>

				<div className="profile-section">
					<h3>Membership</h3>

					<div className="profile-row">
						<span className="label">Status</span>
						<span className="value free">Free User</span>
					</div>

					<button onClick={startCheckout} className="upgrade-btn">
						Become a Member
					</button>
				</div>

				<div className="profile-section">
					<button className="logout-btn" onClick={signOut}>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}
