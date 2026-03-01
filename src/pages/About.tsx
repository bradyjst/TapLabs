import { Link } from "react-router-dom";
import "./Pages.css";

export default function About() {
	return (
		<div className="page-shell">
			<Link to="/" className="back-link">
				← Back to TapLabs
			</Link>

			<h1>About TapLabs</h1>
			<p className="page-subtitle">Built by a player, for players.</p>

			<h2>What is TapLabs?</h2>
			<p>
				TapLabs is a dedicated rhythm training tool designed to help osu!
				players improve their tapping mechanics. Whether you're working on short
				bursts or long streams, TapLabs gives you structured drills with
				real-time feedback so you can isolate and improve the skills that matter
				most.
			</p>

			<h2>Why does it exist?</h2>
			<p>
				Because playing more maps isn't always the most efficient way to get
				better. If your tapping is inconsistent at 200 BPM, grinding maps at 200
				BPM can sometimes reinforce bad habits. TapLabs lets you break your
				mechanics down into focused practice. Specific burst lengths, specific
				tempos, with precise timing feedback you can actually learn from.
			</p>

			<h2>Who built this?</h2>
			<p>
				TapLabs was built by a solo developer who wanted a tool like this and
				couldn't find one. It started as a personal side project and grew from
				there. The app is still actively being developed, with new features and
				improvements shipping regularly.
			</p>

			<h2>Current status</h2>
			<p>
				TapLabs is currently in beta. The core training experience is stable,
				but the app is still evolving. Scores and session data may be affected
				by updates during this period. If you run into issues or have ideas,
				feedback is always welcome.
			</p>

			<h2>What's next?</h2>
			<p>
				The roadmap includes long-term stat tracking, advanced coaching
				diagnostics, visual themes, and more. Members get early access to these
				features as they ship. Check out the{" "}
				<Link to="/membership">Membership page</Link> to learn more.
			</p>
		</div>
	);
}
