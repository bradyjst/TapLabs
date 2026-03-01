import { Link } from "react-router-dom";
import { useProfile } from "../context/useProfile";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";
import "./Membership.css";

const features = [
	{
		title: "Advanced Diagnostics",
		description:
			"Timing distribution histograms, drift curves, consistency scoring, and galloping risk analysis. See exactly where your mechanics break down.",
		icon: "📊",
	},
	{
		title: "Long-Term Stat Tracking",
		description:
			"Track your unstable rate, accuracy, and BPM ceiling over weeks and months. Watch your improvement unfold with real data.",
		icon: "📈",
	},
	{
		title: "Coaching Insights",
		description:
			"Personalized feedback based on your session patterns. Coming soon. Identify bad habits before they become permanent.",
		icon: "🎯",
	},
	{
		title: "Early Access",
		description:
			"Get new features first as TapLabs evolves. Members shape the product through priority feedback.",
		icon: "⚡",
	},
];

export default function Membership() {
	const { user } = useAuth();
	const { isPaid, loading } = useProfile();

	async function startCheckout() {
		const { data, error } = await supabase.functions.invoke("checkout");

		if (error) {
			console.error("Checkout error:", error);
			return;
		}

		if (data?.url) {
			window.location.href = data.url;
		}
	}

	return (
		<div className="membership-page">
			<Link to="/" className="membership-back-link">
				← Back to TapLabs
			</Link>

			<div className="membership-hero">
				<h1>
					Train smarter.
					<br />
					<span className="hero-accent">Improve faster.</span>
				</h1>
				<p className="hero-sub">
					A TapLabs Membership unlocks the full depth of your rhythm data so you
					can see what's actually holding you back and fix it.
				</p>
			</div>

			<div className="membership-features">
				{features.map((f) => (
					<div className="feature-card" key={f.title}>
						<span className="feature-icon">{f.icon}</span>
						<h3>{f.title}</h3>
						<p>{f.description}</p>
					</div>
				))}
			</div>

			<div className="membership-comparison">
				<h2>Free vs. Member</h2>

				<div className="comparison-table">
					<div className="comparison-row header">
						<span></span>
						<span>Free</span>
						<span>Member</span>
					</div>
					<ComparisonRow label="All drills & tempos" free member />
					<ComparisonRow label="Real-time session stats" free member />
					<ComparisonRow label="Score submission" free member />
					<ComparisonRow label="Timing histograms" member />
					<ComparisonRow label="Drift curve analysis" member />
					<ComparisonRow label="Consistency scoring" member />
					<ComparisonRow label="Long-term stat tracking" member />
					<ComparisonRow label="Coaching insights" member />
					<ComparisonRow label="Early access to features" member />
				</div>
			</div>

			<div className="membership-cta">
				{loading ? (
					<p className="cta-status">Loading...</p>
				) : isPaid ? (
					<p className="cta-status">
						You're already a member — thank you for your support!
					</p>
				) : !user ? (
					<>
						<p className="cta-status">Sign in to become a member.</p>
						<Link to="/" className="cta-button secondary">
							Go to TapLabs
						</Link>
					</>
				) : (
					<>
						<button className="cta-button" onClick={startCheckout}>
							Become a Member
						</button>
						<p className="cta-note">Cancel anytime. No lock-in.</p>
					</>
				)}
			</div>
		</div>
	);
}

function ComparisonRow({
	label,
	free,
	member,
}: {
	label: string;
	free?: boolean;
	member?: boolean;
}) {
	return (
		<div className="comparison-row">
			<span className="comparison-label">{label}</span>
			<span className={`comparison-check ${free ? "yes" : "no"}`}>
				{free ? "✓" : "—"}
			</span>
			<span className={`comparison-check ${member ? "yes" : "no"}`}>
				{member ? "✓" : "—"}
			</span>
		</div>
	);
}
