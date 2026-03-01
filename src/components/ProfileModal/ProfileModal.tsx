import { useEffect } from "react";
import { signOut } from "../../lib/auth";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../lib/supabase";
import { useProfile } from "../../context/useProfile";
import "./ProfileModal.css";

interface Props {
	onClose: () => void;
}

export default function ProfileModal({ onClose }: Props) {
	const { user } = useAuth();
	const { isPaid, loading } = useProfile();

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onClose]);

	async function startCheckout() {
		try {
			const { data, error } = await supabase.functions.invoke("checkout");

			if (error) {
				console.error("Checkout error:", error);
				return;
			}

			if (data?.url) {
				window.location.href = data.url;
			} else {
				console.error("No checkout URL returned:", data);
			}
		} catch (err) {
			console.error("Unexpected checkout failure:", err);
		}
	}

	async function openCustomerPortal() {
		const { data, error } = await supabase.functions.invoke("customer-portal");

		if (error) {
			console.error("Portal error:", error);
			return;
		}

		window.location.href = data.url;
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

						<span className={`value ${isPaid ? "member" : "free"}`}>
							{loading ? "Loading..." : isPaid ? "Member" : "Free User"}
						</span>
					</div>

					{!loading && !isPaid && (
						<button onClick={startCheckout} className="upgrade-btn">
							Become a Member
						</button>
					)}

					{!loading && isPaid && (
						<button onClick={openCustomerPortal} className="manage-btn">
							Manage Subscription
						</button>
					)}
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
