import { useState } from "react";
import {
	signInWithGoogle,
	signInWithEmail,
	signUpWithEmail,
} from "../../lib/auth";
import "./AuthModal.css";

type Props = {
	onClose: () => void;
};

export default function AuthModal({ onClose }: Props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSignIn = async () => {
		const { error } = await signInWithEmail(email, password);
		if (error) {
			alert(error.message);
		}
	};

	const handleSignUp = async () => {
		const { error } = await signUpWithEmail(email, password);

		if (error) {
			alert(error.message);
		} else {
			alert("Check your email to confirm your TapLabs account!");
			onClose();
		}
	};

	return (
		<div className="auth-modal" onClick={onClose}>
			<div className="auth-box" onClick={(e) => e.stopPropagation()}>
				<h3>Sign In</h3>

				<button className="google-btn" onClick={signInWithGoogle}>
					<img
						src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
						alt="Google"
						className="google-icon"
					/>
					Sign in with Google
				</button>

				<div className="divider">or</div>

				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button className="email-btn" onClick={handleSignIn}>
					Sign In
				</button>

				<button className="email-btn alt" onClick={handleSignUp}>
					Sign Up
				</button>

				<button className="close-btn" onClick={onClose}>
					Close
				</button>
			</div>
		</div>
	);
}
