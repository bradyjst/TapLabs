import { Link } from "react-router-dom";
import "./Resources.css";

type ResourceLink = {
	title: string;
	url: string;
	description: string;
	tag?: string;
};

const guides: ResourceLink[] = [
	{
		title: "Sytho's Guide to Speed",
		url: "https://www.youtube.com/watch?v=s9ksRDiqzfM",
		description:
			"An in-depth video guide covering speed mechanics, finger control, and how to push your BPM ceiling. One of the most referenced improvement resources in the community.",
		tag: "Video",
	},
	{
		title: "osu! Wiki — Offset & Timing",
		url: "https://osu.ppy.sh/wiki/en/Beatmapping/Offset",
		description:
			"Understanding how offset and timing points work. Helpful context for interpreting your mean offset in TapLabs.",
		tag: "Wiki",
	},
	{
		title: "Unstable Rate Explained",
		url: "https://osu.ppy.sh/wiki/en/Gameplay/Unstable_rate",
		description:
			"What UR actually measures, why it matters, and what good values look like at different skill levels.",
		tag: "Wiki",
	},
	// TODO: Add more guides here
];

const community: ResourceLink[] = [
	{
		title: "osu! Discord",
		url: "https://discord.gg/ppy",
		description:
			"The main osu! community Discord. Good for general discussion, improvement advice, and finding practice partners.",
		tag: "Discord",
	},
	{
		title: "r/osugame",
		url: "https://reddit.com/r/osugame",
		description:
			"The osu! subreddit. Score posts, memes, and occasional improvement threads.",
		tag: "Reddit",
	},
	// TODO: Add TapLabs Discord once it exists
];

const equipment: {
	category: string;
	items: { name: string; note: string }[];
}[] = [
	{
		category: "Keyboards",
		items: [
			{
				name: "Any mechanical keyboard",
				note: "Linear switches (Reds, Yellows) or light tactiles (Browns) are generally preferred for tapping. Avoid heavy switches if you're doing stamina drills.",
			},
			{
				name: "Wooting 60HE / Razer Huntsman V3",
				note: "Analog Hall Effect keyboards with adjustable actuation. Lets you set extremely shallow actuation points for fast tapping. Popular in competitive play.",
			},
			{
				name: "Keypads (2-key)",
				note: "Dedicated osu! keypads exist if you want a minimal setup. Lighter springs and shorter travel can reduce fatigue.",
			},
		],
	},
	{
		category: "Audio",
		items: [
			{
				name: "Wired headphones or IEMs",
				note: "Bluetooth adds latency. If you're using wireless, make sure your adapter supports low-latency mode. For rhythm training, wired is always safer.",
			},
			{
				name: "Low-latency audio setup",
				note: "On Windows, WASAPI exclusive mode or ASIO drivers reduce audio latency. On macOS, CoreAudio is generally fine out of the box.",
			},
		],
	},
	{
		category: "Display",
		items: [
			{
				name: "High refresh rate monitor",
				note: "144Hz+ makes note movement smoother and easier to read. Not required, but noticeable once you try it. 240Hz is the point of diminishing returns for most people.",
			},
		],
	},
];

const routines: {
	name: string;
	level: string;
	description: string;
	steps: string[];
}[] = [
	{
		name: "Beginner Warmup",
		level: "New players",
		description:
			"A simple 10-minute routine to build foundational timing. Run this before every session.",
		steps: [
			"3 Burst @ 150 BPM — 2 rounds",
			"5 Burst @ 150 BPM — 2 rounds",
			"7 Burst @ 160 BPM — 2 rounds",
			"16 Trill @ 150 BPM — 1 round",
			"16 Stream @ 150 BPM — 1 round",
		],
	},
	{
		name: "Speed Builder",
		level: "Intermediate",
		description:
			"Push your BPM ceiling gradually. The goal is maintaining sub-100 UR at each step before moving up.",
		steps: [
			"9 Burst @ 180 BPM — 2 rounds",
			"13 Burst @ 190 BPM — 2 rounds",
			"16 Stream @ 180 BPM — 2 rounds",
			"16 Stream @ 190 BPM — 2 rounds",
			"32 Stream @ 180 BPM — 1 round",
		],
	},
	{
		name: "Stamina Grind",
		level: "Advanced",
		description:
			"Long streams and deathstreams to build endurance. Focus on consistency, not just survival.",
		steps: [
			"32 Stream @ 200 BPM — 2 rounds (warmup)",
			"Deathstream @ 190 BPM — 2 rounds",
			"Deathstream @ 200 BPM — 2 rounds",
			"Deathstream @ 210 BPM — 1 round",
			"16 Trill @ 220 BPM — 2 rounds (cooldown)",
		],
	},
	{
		name: "Hand Independence",
		level: "All levels",
		description:
			"Focuses on trills, doubles, and dual-circle mode to balance your hands. Use Mirror Hands to train your weak side.",
		steps: [
			"8 Trill @ 170 BPM — 2 rounds",
			"16 Trill @ 170 BPM — 2 rounds",
			"8 Doubles @ 170 BPM — 2 rounds",
			"16 Doubles @ 170 BPM — 2 rounds",
			"Repeat all with Mirror Hands enabled",
		],
	},
];

export default function Resources() {
	return (
		<div className="resources-page">
			<Link to="/" className="resources-back-link">
				← Back to TapLabs
			</Link>

			<div className="resources-hero">
				<h1>Resources</h1>
				<p className="resources-intro">
					Guides, gear recommendations, practice routines, and community links
					to help you improve.
				</p>
			</div>

			{/* ---- Quick nav ---- */}
			<nav className="resources-nav">
				<a href="#routines">Practice Routine Examples</a>
				<a href="#equipment">Equipment</a>
				<a href="#guides">Guides</a>
				<a href="#community">Community</a>
			</nav>

			{/* ---- Practice Routines ---- */}
			<section id="routines" className="resources-section">
				<h2>Practice Routines</h2>
				<p className="section-desc">
					Structured plans for different skill levels. Each routine is designed
					to be run as a single session. Adjust BPM to match your current
					comfort zone — the listed tempos are starting points, not targets.
				</p>

				<div className="routines-grid">
					{routines.map((r) => (
						<div className="routine-card" key={r.name}>
							<div className="routine-header">
								<h3>{r.name}</h3>
								<span className="routine-level">{r.level}</span>
							</div>
							<p className="routine-desc">{r.description}</p>
							<ol className="routine-steps">
								{r.steps.map((step, i) => (
									<li key={i}>{step}</li>
								))}
							</ol>
						</div>
					))}
				</div>
			</section>

			{/* ---- Equipment ---- */}
			<section id="equipment" className="resources-section">
				<h2>Equipment</h2>
				<p className="section-desc">
					You don't need expensive gear to improve — but the right setup removes
					friction. Here's what matters and what doesn't.
				</p>

				{equipment.map((cat) => (
					<div className="equipment-category" key={cat.category}>
						<h3>{cat.category}</h3>
						{cat.items.map((item) => (
							<div className="equipment-item" key={item.name}>
								<strong>{item.name}</strong>
								<p>{item.note}</p>
							</div>
						))}
					</div>
				))}
			</section>

			{/* ---- Guides ---- */}
			<section id="guides" className="resources-section">
				<h2>Guides & References</h2>
				<div className="link-grid">
					{guides.map((g) => (
						<a
							key={g.url}
							href={g.url}
							target="_blank"
							rel="noopener noreferrer"
							className="resource-card"
						>
							{g.tag && <span className="resource-tag">{g.tag}</span>}
							<h3>{g.title}</h3>
							<p>{g.description}</p>
							<span className="resource-external">↗</span>
						</a>
					))}
				</div>
			</section>

			{/* ---- Community ---- */}
			<section id="community" className="resources-section">
				<h2>Community</h2>
				<div className="link-grid">
					{community.map((c) => (
						<a
							key={c.url}
							href={c.url}
							target="_blank"
							rel="noopener noreferrer"
							className="resource-card"
						>
							{c.tag && <span className="resource-tag">{c.tag}</span>}
							<h3>{c.title}</h3>
							<p>{c.description}</p>
							<span className="resource-external">↗</span>
						</a>
					))}
				</div>
			</section>
		</div>
	);
}
