import { useState } from "react";
import AuthModal from "../AuthModal/AuthModal";
import ProfileModal from "../ProfileModal/ProfileModal";
import { useAuth } from "../../context/useAuth";
import "./AuthButton.css";

export default function AuthButton() {
	const { user } = useAuth();

	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showProfileModal, setShowProfileModal] = useState(false);

	// Not logged in
	if (!user) {
		return (
			<>
				<button className="auth-btn" onClick={() => setShowAuthModal(true)}>
					Sign In
				</button>

				{showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
			</>
		);
	}

	// Logged in
	return (
		<>
			<button
				className="auth-btn logged-in"
				onClick={() => setShowProfileModal(true)}
			>
				👤 {user.email?.split("@")[0]} ▾
			</button>

			{showProfileModal && (
				<ProfileModal onClose={() => setShowProfileModal(false)} />
			)}
		</>
	);
}
