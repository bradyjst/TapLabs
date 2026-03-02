import { useState, useCallback } from "react";
import type { TapLabsTheme } from "./themeTypes";
import "./ThemeEditor.css";

type Props = {
	initial: TapLabsTheme;
	onChange: (theme: TapLabsTheme) => void;
};

type ColorField = {
	key: keyof TapLabsTheme;
	label: string;
};

type Group = {
	label: string;
	fields: ColorField[];
};

const GROUPS: Group[] = [
	{
		label: "Base",
		fields: [
			{ key: "bg", label: "Background" },
			{ key: "surface", label: "Surface" },
			{ key: "border", label: "Border" },
			{ key: "grid", label: "Grid" },
		],
	},
	{
		label: "Text",
		fields: [
			{ key: "textPrimary", label: "Primary" },
			{ key: "textMuted", label: "Muted" },
		],
	},
	{
		label: "Accent",
		fields: [{ key: "accent", label: "Accent" }],
	},
	{
		label: "Feedback",
		fields: [
			{ key: "perfect", label: "Perfect" },
			{ key: "early", label: "Early" },
			{ key: "late", label: "Late" },
		],
	},
	{
		label: "Notes",
		fields: [{ key: "noteColor", label: "Note" }],
	},
	{
		label: "Visualizer",
		fields: [{ key: "backgroundImage", label: "BG Color" }],
	},
];

// Parse any css color string into a hex value usable by <input type="color">
function toHex(color: string): string {
	// Already hex
	if (/^#[0-9a-f]{6}$/i.test(color)) return color;

	// rgb(...) / rgba(...)
	const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (match) {
		const [, r, g, b] = match.map(Number);
		return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
	}
	return "#000000";
}

function hexToRgb(hex: string): [number, number, number] {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return [r, g, b];
}

function deriveTheme(
	base: TapLabsTheme,
	key: keyof TapLabsTheme,
	hex: string,
): TapLabsTheme {
	const [r, g, b] = hexToRgb(hex);
	const rgb = `rgb(${r}, ${g}, ${b})`;

	const updates: Partial<TapLabsTheme> = { [key]: hex };

	// Auto-derive opacity variants
	if (key === "accent") {
		updates.accent = rgb;
		updates.accentSoft = `rgba(${r}, ${g}, ${b}, 0.10)`;
		updates.accentBorder = `rgba(${r}, ${g}, ${b}, 0.40)`;
	}
	if (key === "noteColor") {
		updates.noteColor = rgb;
		updates.approachColor = `rgba(${r}, ${g}, ${b}, 0.55)`;
	}

	return { ...base, ...updates };
}

export default function ThemeEditor({ initial, onChange }: Props) {
	const [theme, setTheme] = useState<TapLabsTheme>(initial);
	const [overlayOpacity, setOverlayOpacity] = useState(0.45);

	const handleColor = useCallback(
		(key: keyof TapLabsTheme, hex: string) => {
			const next = deriveTheme(theme, key, hex);
			setTheme(next);
			onChange(next);
		},
		[theme, onChange],
	);

	const handleOverlayOpacity = useCallback(
		(opacity: number) => {
			setOverlayOpacity(opacity);
			const hex = toHex(theme.visualizerOverlay);
			const [r, g, b] = hexToRgb(hex);
			const next = {
				...theme,
				visualizerOverlay: `rgba(${r}, ${g}, ${b}, ${opacity})`,
			};
			setTheme(next);
			onChange(next);
		},
		[theme, onChange],
	);

	const handleOverlayColor = useCallback(
		(hex: string) => {
			const [r, g, b] = hexToRgb(hex);
			const next = {
				...theme,
				visualizerOverlay: `rgba(${r}, ${g}, ${b}, ${overlayOpacity})`,
			};
			setTheme(next);
			onChange(next);
		},
		[theme, overlayOpacity, onChange],
	);

	return (
		<div className="theme-editor">
			{GROUPS.map((group) => (
				<div key={group.label} className="te-group">
					<span className="te-group__label">{group.label}</span>
					<div className="te-group__fields">
						{group.fields.map(({ key, label }) => (
							<label key={key} className="te-field">
								<input
									type="color"
									className="te-swatch"
									value={toHex(theme[key] as string)}
									onChange={(e) => handleColor(key, e.target.value)}
								/>
								<span className="te-field__label">{label}</span>
							</label>
						))}

						{/* Visualizer overlay — extra opacity slider */}
						{group.label === "Visualizer" && (
							<label className="te-field te-field--wide">
								<input
									type="color"
									className="te-swatch"
									value={toHex(theme.visualizerOverlay)}
									onChange={(e) => handleOverlayColor(e.target.value)}
								/>
								<span className="te-field__label">Overlay</span>
								<input
									type="range"
									className="te-slider"
									min={0}
									max={1}
									step={0.05}
									value={overlayOpacity}
									onChange={(e) => handleOverlayOpacity(Number(e.target.value))}
								/>
								<span className="te-field__value">
									{Math.round(overlayOpacity * 100)}%
								</span>
							</label>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
