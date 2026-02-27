import React from "react";
import AuthButton from "../components/AuthButton/AuthButton";
import "./Settings.css";
import ThemeSelector from "../components/Theme/ThemeSelector";

interface SettingsProps {
	isOpen: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen }) => {
	return (
		<aside className={`settings-container ${isOpen ? "open" : ""}`}>
			<div className="settingsheader">
				<h2>Settings</h2>
				<AuthButton />
			</div>
			<ThemeSelector />
		</aside>
	);
};
