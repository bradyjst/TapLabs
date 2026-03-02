import { useState, useCallback } from "react";
import type { Drill } from "../types/types";
import {
	type DrillTemplate,
	validateTemplate,
	createUserTemplate,
	generateDrillsFromTemplate,
} from "./coreDrills";

const STORAGE_KEY = "taplabs-custom-drills";

function loadTemplates(): DrillTemplate[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		return JSON.parse(stored);
	} catch {
		return [];
	}
}

function saveTemplates(templates: DrillTemplate[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
	} catch {
		console.error("Failed to save custom drills to localStorage");
	}
}

export function useCustomDrills() {
	const [templates, setTemplates] = useState<DrillTemplate[]>(loadTemplates);

	/** All generated drills across all custom templates */
	const drills: Drill[] = templates.flatMap((t) =>
		generateDrillsFromTemplate(t),
	);

	const addTemplate = useCallback(
		(template: DrillTemplate): string[] => {
			const errors = validateTemplate(template);
			if (errors.length > 0) return errors;

			const final = createUserTemplate(template);
			setTemplates((prev) => {
				const next = [...prev, final];
				saveTemplates(next);
				return next;
			});
			return [];
		},
		[],
	);

	const updateTemplate = useCallback(
		(id: string, template: DrillTemplate): string[] => {
			const errors = validateTemplate(template);
			if (errors.length > 0) return errors;

			setTemplates((prev) => {
				const next = prev.map((t) => (t.id === id ? { ...template, isCustom: true } : t));
				saveTemplates(next);
				return next;
			});
			return [];
		},
		[],
	);

	const removeTemplate = useCallback((id: string) => {
		setTemplates((prev) => {
			const next = prev.filter((t) => t.id !== id);
			saveTemplates(next);
			return next;
		});
	}, []);

	return {
		templates,
		drills,
		addTemplate,
		updateTemplate,
		removeTemplate,
	};
}