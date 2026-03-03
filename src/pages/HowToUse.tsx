import { Link } from "react-router-dom";
import "./HowToUse.css";

const sections = [
	{ id: "getting-started", label: "Getting Started" },
	{ id: "scoring", label: "Scoring & Grades" },
	{ id: "metrics", label: "Metrics Explained" },
	{ id: "drills", label: "Drill Types" },
	{ id: "visualizers", label: "Visualizer Modes" },
	{ id: "settings", label: "Settings" },
	{ id: "custom-drills", label: "Custom Drills" },
	{ id: "controls", label: "Keyboard Controls" },
	{ id: "install", label: "Install the App" },
];

export default function HowToUse() {
	return (
		<div className="howto-page">
			<Link to="/" className="howto-back-link">
				← Back to TapLabs
			</Link>

			<div className="howto-hero">
				<h1>How to Use TapLabs</h1>
				<p className="howto-intro">
					TapLabs is a rhythm mechanics trainer designed to help you build
					speed, accuracy, and consistency. This guide covers everything you
					need to know.
				</p>
			</div>

			{/* ---- Table of Contents ---- */}
			<nav className="howto-toc">
				{sections.map((s) => (
					<a key={s.id} href={`#${s.id}`} className="toc-link">
						{s.label}
					</a>
				))}
			</nav>

			{/* ---- Getting Started ---- */}
			<section id="getting-started" className="howto-section">
				<h2>Getting Started</h2>
				<p>
					Pick a drill from the drill selector, hit <strong>Begin Drill</strong>
					, and tap along to the notes. Your goal is to hit each note as close
					to its scheduled time as possible. After the session ends, you'll see
					a breakdown of your performance.
				</p>
				<p>
					Start with low-BPM burst drills to warm up, then work your way up.
					Consistency matters more than speed. a clean 160 BPM is better than a
					sloppy 220.
				</p>
			</section>

			{/* ---- Scoring & Grades ---- */}
			<section id="scoring" className="howto-section">
				<h2>Scoring & Grades</h2>
				<p>
					Every note you hit is graded based on how close your tap was to the
					note's scheduled time. The hit windows are determined by the drill's
					OD (Overall Difficulty) value.
				</p>
				<div className="howto-grades">
					<div className="grade-item grade-300">
						<span className="grade-face">:)</span>
						<div>
							<strong>300 (Perfect)</strong>
							<p>
								Your tap landed within the tightest timing window. This is what
								you're aiming for.
							</p>
						</div>
					</div>
					<div className="grade-item grade-100">
						<span className="grade-face">:|</span>
						<div>
							<strong>100 (Good)</strong>
							<p>
								Slightly off. early or late, but still within an acceptable
								range.
							</p>
						</div>
					</div>
					<div className="grade-item grade-50">
						<span className="grade-face">:(</span>
						<div>
							<strong>50 (Meh)</strong>
							<p>
								Barely registered. You were significantly off from the target
								timing.
							</p>
						</div>
					</div>
					<div className="grade-item grade-miss">
						<span className="grade-face">✕</span>
						<div>
							<strong>Miss</strong>
							<p>
								The note passed without being hit, or you pressed the wrong key
								on a hand-specific note.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ---- Metrics Explained ---- */}
			<section id="metrics" className="howto-section">
				<h2>Metrics Explained</h2>

				<div className="howto-metric">
					<h3>Unstable Rate (UR)</h3>
					<p>
						The standard deviation of your hit offsets, multiplied by 10. Lower
						is better. A UR under 100 is solid; under 80 is very consistent.
						This is the single most important number for measuring your raw
						tapping consistency.
					</p>
				</div>

				<div className="howto-metric">
					<h3>Mean Offset</h3>
					<p>
						The average difference between when you tapped and when the note was
						scheduled. A negative value means you tend to hit early; positive
						means late. Ideally this sits close to zero.
					</p>
				</div>

				<div className="howto-metric">
					<h3>OD (Overall Difficulty)</h3>
					<p>
						Controls how tight the timing windows are. Higher OD means smaller
						windows for 300s. OD scales automatically with BPM; faster drills
						demand more precision.
					</p>
				</div>

				<div className="howto-metric">
					<h3>Accuracy</h3>
					<p>
						Your weighted hit percentage based on grades. 300s count fully, 100s
						partially, 50s barely. Misses are zero. 100% accuracy means every
						note was a 300.
					</p>
				</div>

				<div className="howto-metric">
					<h3>Practice Mode</h3>
					<p>
						When you override the BPM using the Tempo Override input, the
						session enters Practice Mode. Scores from practice sessions are not
						submitted to your profile. This lets you experiment freely without
						impacting your stats.
					</p>
				</div>
			</section>

			{/* ---- Drill Types ---- */}
			<section id="drills" className="howto-section">
				<h2>Drill Types</h2>

				<div className="howto-drill">
					<h3>Bursts</h3>
					<p>
						Short groups of notes (3, 5, 7, 9, 13) followed by rest. Great for
						building speed in short controlled intervals. Start here if you're
						new.
					</p>
				</div>

				<div className="howto-drill">
					<h3>Streams</h3>
					<p>
						Continuous 16th-note runs across one or more bars with a recovery
						bar. The 16 Stream is one bar; the 32 Stream is two. These test
						sustained stamina.
					</p>
				</div>

				<div className="howto-drill">
					<h3>Trills</h3>
					<p>
						Strict alternating left-right patterns (L-R-L-R). These force proper
						hand independence and expose any imbalance between your hands.
					</p>
				</div>

				<div className="howto-drill">
					<h3>Doubles</h3>
					<p>
						Two consecutive notes on the same hand before switching
						(LL-RR-LL-RR). Trains your ability to double-tap cleanly without
						losing rhythm.
					</p>
				</div>

				<div className="howto-drill">
					<h3>Gallop</h3>
					<p>
						An uneven rhythmic pattern with gaps. Useful for training
						non-uniform timing and preventing your hands from falling into
						autopilot.
					</p>
				</div>

				<div className="howto-drill">
					<h3>Triplets</h3>
					<p>
						Groups of three notes with gaps between them. Trains a different
						rhythmic feel from standard 16th-note patterns.
					</p>
				</div>

				<div className="howto-drill">
					<h3>Deathstream</h3>
					<p>
						Four full bars of continuous 16th notes with two recovery bars. The
						endurance test. If your UR stays low through a deathstream, your
						stamina is in good shape.
					</p>
				</div>
			</section>

			{/* ---- Visualizer Modes ---- */}
			<section id="visualizers" className="howto-section">
				<h2>Visualizer Modes</h2>

				<div className="howto-drill">
					<h3>Moving Notes</h3>
					<p>
						Notes travel from left to right toward a center target circle. The
						default mode — straightforward and easy to read.
					</p>
				</div>

				<div className="howto-drill">
					<h3>Approach Circle</h3>
					<p>
						Notes appear at fixed positions with a shrinking approach circle.
						Tap when the approach ring meets the note. Familiar if you've played
						circle-clicking rhythm games.
					</p>
				</div>

				<div className="howto-drill">
					<h3>Dual Circles (L/R)</h3>
					<p>
						Two target circles stacked vertically — left hand on top, right hand
						on bottom. Notes split toward their assigned circle as they travel.
						On stream drills, notes alternate automatically. On drills with
						forced hand assignments (trills, doubles), notes go to their
						designated side. Use this mode to visualize and train hand
						independence.
					</p>
				</div>
			</section>

			{/* ---- Settings ---- */}
			<section id="settings" className="howto-section">
				<h2>Settings</h2>

				<div className="howto-metric">
					<h3>Theme</h3>
					<p>
						Choose a visual theme for the app. Themes change colors,
						backgrounds, and the overall feel of the interface.
					</p>
				</div>

				<div className="howto-metric">
					<h3>Visualizer Mode</h3>
					<p>
						Switch between Moving Notes, Approach Circle, and Dual Circles. See
						the Visualizer Modes section above for details on each.
					</p>
				</div>

				<div className="howto-metric">
					<h3>Mirror Hands</h3>
					<p>
						Available in Dual Circle mode. Swaps all left and right hand
						assignments — left becomes right, right becomes left. Useful for
						training your weaker hand on patterns that normally favor the other.
					</p>
				</div>

				<div className="howto-metric">
					<h3>Key Bindings</h3>
					<p>
						Remap the left and right tap keys to any key on your keyboard. Click
						the key button in settings and press your desired key. Defaults are
						Z (left) and X (right).
					</p>
				</div>
			</section>

			{/* ---- Custom Drills ---- */}
			<section id="custom-drills" className="howto-section">
				<h2>Custom Drills</h2>
				<span className="howto-badge">Member Feature</span>
				<p>
					Members can create their own drills using the visual grid editor.
					Click the <strong>+ Create</strong> button in the header to open it.
				</p>
				<p>
					The editor gives you a 16-slot grid per bar (4 beats × 4
					subdivisions). Click cells to paint notes — choose between general
					notes (either hand), or forced left/right assignments. You can add up
					to 8 bars, set recovery bars for rest between loops, and configure how
					many times the pattern repeats.
				</p>
				<p>
					Custom drills appear in the sidebar alongside the built-in drills and
					are generated across all standard BPM values automatically. Your
					custom drills are saved locally and persist between sessions.
				</p>
				<p>
					Not a member yet?{" "}
					<Link to="/membership" className="howto-inline-link">
						Learn about membership
					</Link>
					.
				</p>
			</section>

			{/* ---- Keyboard Controls ---- */}
			<section id="controls" className="howto-section">
				<h2>Keyboard Controls</h2>
				<div className="howto-keys">
					<div className="key-row">
						<kbd>Z</kbd>
						<span>Left tap (default)</span>
					</div>
					<div className="key-row">
						<kbd>X</kbd>
						<span>Right tap (default)</span>
					</div>
					<div className="key-row">
						<kbd>Esc</kbd>
						<span>Close settings / modals</span>
					</div>
				</div>
				<p>
					Keys can be rebound in Settings. On mobile, use the on-screen tap
					pads.
				</p>
			</section>

			{/* ---- Install ---- */}
			<section id="install" className="howto-section">
				<h2>Install the App</h2>
				<span className="howto-badge">Coming Soon</span>
				<p>
					TapLabs will be installable as a Progressive Web App on desktop and
					mobile. Once available, you'll be able to add it to your home screen
					or dock for a native app experience with offline support and reduced
					input latency.
				</p>
			</section>
		</div>
	);
}
