import { Link } from "react-router-dom";
import "./Collaborators.css";

type Collaborator = {
	name: string;
	role: string;
	description: string;
	links?: { label: string; url: string }[];
	avatar?: string;
};

const collaborators: Collaborator[] = [];

type SpecialThanks = {
	name: string;
	note: string;
	url?: string;
};

const specialThanks: SpecialThanks[] = [
	{
		name: "hippochans",
		note: "Early feedback and testing",
		url: "https://www.reddit.com/user/hippochans",
	},
];

function getInitials(name: string): string {
	return name
		.split(/\s+/)
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function nameToColor(name: string): string {
	const colors = [
		"#7c6aed",
		"#4a9fe8",
		"#e85a5a",
		"#4ae87a",
		"#e8c44a",
		"#e87a4a",
		"#4ae8d4",
		"#d44ae8",
	];
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return colors[Math.abs(hash) % colors.length];
}

function CollaboratorCard({ collab }: { collab: Collaborator }) {
	const color = nameToColor(collab.name);

	return (
		<div
			className="collab-card"
			style={{ "--card-accent": color } as React.CSSProperties}
		>
			<div className="collab-avatar" style={{ borderColor: color }}>
				{collab.avatar ? (
					<img src={collab.avatar} alt={collab.name} />
				) : (
					<span style={{ color }}>{getInitials(collab.name)}</span>
				)}
			</div>

			<div className="collab-info">
				<h3>{collab.name}</h3>
				<span className="collab-role">{collab.role}</span>
				<p>{collab.description}</p>

				{collab.links && collab.links.length > 0 && (
					<div className="collab-links">
						{collab.links.map((link) => (
							<a
								key={link.url}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								{link.label} ↗
							</a>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default function Collaborators() {
	const hasCollaborators = collaborators.length > 0;

	return (
		<div className="collabs-page">
			<Link to="/" className="collabs-back-link">
				← Back to TapLabs
			</Link>

			<div className="collabs-hero">
				<h1>Collaborators</h1>
				<p className="collabs-intro">
					People who help spread the word and support TapLabs.
				</p>
			</div>

			{hasCollaborators ? (
				<div className="collabs-grid">
					{collaborators.map((c) => (
						<CollaboratorCard key={c.name} collab={c} />
					))}
				</div>
			) : (
				<div className="collabs-empty">
					<div className="collabs-empty-icon">👀</div>
					<h2>Collaborators coming soon</h2>
					<p>This space is reserved. Stay tuned.</p>
				</div>
			)}

			<div className="special-thanks">
				<h2>Special Thanks</h2>
				<div className="thanks-list">
					{specialThanks.map((person) => (
						<div key={person.name} className="thanks-item">
							<span className="thanks-name">
								{person.url ? (
									<a
										href={person.url}
										target="_blank"
										rel="noopener noreferrer"
									>
										{person.name}
									</a>
								) : (
									person.name
								)}
							</span>
							<span className="thanks-note">{person.note}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
