import { useState } from "react";
import AuthModal from "../AuthModal/AuthModal";
import { useAuth } from "../../context/useAuth";
import "./AuthButton.css";

type Props = {
	onProfileClick: () => void;
};

export default function AuthButton({ onProfileClick }: Props) {
	const { user } = useAuth();
	const [showAuthModal, setShowAuthModal] = useState(false);

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

	return (
		<button className="auth-btn logged-in" onClick={onProfileClick}>
			👤 {user.email?.split("@")[0]} ▾
		</button>
	);
}
