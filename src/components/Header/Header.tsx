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
};

export default function Header({
	onDrillSelectClick,
	onSettingsClick,
	onProfileClick,
	onCreatorClick,
	onAuthClick,
	isPaidUser,
	displayName,
}: Props) {
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
					</nav>

					{/* Action buttons + auth */}
					<div className="header-actions">
						<button
							className={`header-action-btn ${!isPaidUser ? "header-btn-locked" : ""}`}
							onClick={isPaidUser ? onCreatorClick : undefined}
							title={!isPaidUser ? "Member feature" : undefined}
						>
							{!isPaidUser && "🔒 "}+ Create
						</button>
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
			<div className="header-banner">
				Beta — scores may not save permanently and the site may receive
				significant changes.
			</div>
		</div>
	);
}
