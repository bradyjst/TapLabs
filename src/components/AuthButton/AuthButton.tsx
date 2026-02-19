import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { signOut } from "../../lib/auth";
import AuthModal from "../AuthModal/AuthModal";
import "./AuthButton.css";

export default function AuthButton() {
	const [user, setUser] = useState<User | null>(null);

	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user);
		});

		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user ?? null);
			},
		);

		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

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
