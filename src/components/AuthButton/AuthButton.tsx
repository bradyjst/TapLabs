import { useAuth } from "../../context/useAuth";
import "./AuthButton.css";

type Props = {
	onProfileClick: () => void;
	onAuthClick: () => void;
	displayName?: string;
};

export default function AuthButton({ onProfileClick, onAuthClick }: Props) {
	const { user } = useAuth();

	if (!user) {
		return (
			<button className="auth-btn" onClick={onAuthClick}>
				Sign In
			</button>
		);
	}

	return (
		<button className="auth-btn logged-in" onClick={onProfileClick}>
			{user.email?.split("@")[0]} ▾
		</button>
	);
}
