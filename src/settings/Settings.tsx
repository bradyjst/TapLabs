import React, { useEffect } from "react";
import ThemeSelector from "../components/Theme/ThemeSelector";
import "./Settings.css";

interface SettingsProps {
	isOpen: boolean;
	onClose: () => void;
	visualStyle: string;
	setVisualStyle: (style: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
	isOpen,
	onClose,
	visualStyle,
	setVisualStyle,
}) => {
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
			<div className="settings-container" onClick={(e) => e.stopPropagation()}>
				<div className="settingsheader">
					<h2>Settings</h2>

					<button className="settings-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="settings-section">
					<h3>Theme</h3>
					<ThemeSelector />
				</div>

				<div className="settings-section">
					<h3>Visualizer Mode</h3>

					<select
						value={visualStyle}
						onChange={(e) => setVisualStyle(e.target.value)}
					>
						<option value="minimal">Minimal</option>
						<option value="approach">Approach</option>
					</select>
				</div>
			</div>
		</div>
	);
};
