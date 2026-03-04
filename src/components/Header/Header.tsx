import { useState } from "react";
import AuthButton from "../AuthButton/AuthButton";
import "./Header.css";

type Props = {
	onDrillSelectClick: () => void;
	onSettingsClick: () => void;
	onProfileClick: () => void;
	onCreatorClick?: () => void;
	onAuthClick: () => void;
	isPaidUser?: boolean;
	displayName?: string;
	hidePremium?: boolean;
};

const CHANGELOG = [
	{
		version: "1.01",
		date: "March 4, 2026",
		items: [
			"New `What's new` section 🤓",
			"Player cards no longer paywalled. This was a leftover from prelaunch and should never have launched as a paid feature",
			"Added contest card to membership page. Contest page coming soon.",
		],
	},
];

export default function Header({
	onDrillSelectClick,
	onSettingsClick,
	onProfileClick,
	onCreatorClick,
	onAuthClick,
	isPaidUser,
	displayName,
	hidePremium,
}: Props) {
	const [showWhatsNew, setShowWhatsNew] = useState(false);

	return (
		<div className="header-root">
			<header className="site-header">
				<div className="header-inner">
					{/* Wordmark */}
					<a href="/" className="wordmark">
						<span className="wordmark-tap">Tap</span>
						<span className="wordmark-lab">Labs</span>
					</a>

					{/* Nav links */}
					<nav className="header-nav">
						<a href="/how-to-use" className="nav-link">
							How to Use
						</a>
						<a href="/resources" className="nav-link">
							Resources
						</a>
						<a href="/collaborators" className="nav-link">
							Collaborators
						</a>
						<a href="/membership" className="nav-link">
							Membership
						</a>
						<a href="/feedback" className="nav-link">
							Feedback
						</a>
						<button
							className="nav-link nav-link-btn"
							onClick={() => setShowWhatsNew(true)}
						>
							What's New
						</button>
					</nav>

					{/* Action buttons + auth */}
					<div className="header-actions">
						{(isPaidUser || !hidePremium) && (
							<button
								className={`header-action-btn ${!isPaidUser ? "header-btn-locked" : ""}`}
								onClick={isPaidUser ? onCreatorClick : undefined}
								title={!isPaidUser ? "Member feature" : undefined}
							>
								{!isPaidUser && "🔒 "}+ Create
							</button>
						)}
						<button className="header-action-btn" onClick={onDrillSelectClick}>
							Drills
						</button>
						<button className="header-action-btn" onClick={onSettingsClick}>
							Settings
						</button>
						<AuthButton
							onProfileClick={onProfileClick}
							onAuthClick={onAuthClick}
							displayName={displayName}
						/>
					</div>
				</div>
			</header>

			{/* Beta banner */}
			<div className="header-banner">Welcome to TapLabs!</div>

			{/* What's New modal */}
			{showWhatsNew && (
				<div
					className="whats-new-overlay"
					onClick={() => setShowWhatsNew(false)}
				>
					<div className="whats-new-modal" onClick={(e) => e.stopPropagation()}>
						<div className="whats-new-header">
							<h2>What's New</h2>
							<button
								className="whats-new-close"
								onClick={() => setShowWhatsNew(false)}
							>
								✕
							</button>
						</div>
						<div className="whats-new-body">
							{CHANGELOG.map((entry) => (
								<div key={entry.version} className="whats-new-entry">
									<div className="whats-new-version">
										<span className="version-tag">v{entry.version}</span>
										<span className="version-date">{entry.date}</span>
									</div>
									<ul className="whats-new-list">
										{entry.items.map((item) => (
											<li key={item}>{item}</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
