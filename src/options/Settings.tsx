import React, { useEffect } from "react";
import ThemeSelector from "../components/Theme/ThemeSelector";
import "./Settings.css";

interface SettingsProps {
	isOpen: boolean;
	onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
	// ESC closes modal
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onClose]);

	if (!isOpen) return null;

	return (
		<div className="settings-modal-overlay" onClick={onClose}>
			<aside
				className="settings-container"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="settingsheader">
					<h2>Settings</h2>

					<button className="settings-close" onClick={onClose}>
						✕
					</button>
				</div>

				<ThemeSelector />
			</aside>
		</div>
	);
};
