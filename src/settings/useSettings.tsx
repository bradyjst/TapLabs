import { useState, useCallback } from "react";

type Settings = {
	visualStyle: string;
};

const STORAGE_KEY = "taplabs-settings";

const defaults: Settings = {
	visualStyle: "minimal",
};

function loadSettings(): Settings {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return defaults;
		return { ...defaults, ...JSON.parse(stored) };
	} catch {
		return defaults;
	}
}

function saveSettings(settings: Settings) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		console.error("Failed to save settings to localStorage");
	}
}

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(loadSettings);

	const updateSetting = useCallback(
		<K extends keyof Settings>(key: K, value: Settings[K]) => {
			setSettings((prev) => {
				const next = { ...prev, [key]: value };
				saveSettings(next);
				return next;
			});
		},
		[],
	);

	return { settings, updateSetting };
}
