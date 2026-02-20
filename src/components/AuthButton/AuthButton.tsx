import { useState } from "react";
import { signOut } from "../../lib/auth";
import AuthModal from "../AuthModal/AuthModal";
import { useAuth } from "../../context/useAuth";
import "./AuthButton.css";

export default function AuthButton() {
	const { user } = useAuth(); // 🔥 shared auth state
	const [showModal, setShowModal] = useState(false);

	if (!user) {
		return (
			<>
				<button className="auth-btn" onClick={() => setShowModal(true)}>
					Sign In
				</button>

				{showModal && <AuthModal onClose={() => setShowModal(false)} />}
			</>
		);
	}

	return (
		<button className="auth-btn logged-in" onClick={signOut}>
			{user.email?.split("@")[0]}
		</button>
	);
}
