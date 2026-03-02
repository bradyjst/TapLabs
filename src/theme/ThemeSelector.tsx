import { useState } from "react";
import {
	THEMES,
	FREE_THEMES,
	PREMIUM_THEMES,
	type ThemeName,
} from "../theme/themes";
import { useTheme } from "../theme/useTheme";
import { useProfile } from "../context/useProfile";
import ThemeEditor from "./themeEditor";
import type { TapLabsTheme } from "../theme/themeTypes";
import "./ThemeSelector.css";

const THEME_SWATCHES: Record<ThemeName, [string, string, string]> = {
	dark: ["#94a3b8", "#f97316", "#ef4444"],
	light: ["#0f766e", "#c2410c", "#b91c1c"],
	cyan: ["#22d3ee", "#f97316", "#ef4444"],
	violet: ["#a855f7", "#f97316", "#ef4444"],
	rose: ["#fb3f80", "#fb923c", "#f43f5e"],
	gold: ["#eab308", "#f97316", "#ef4444"],
	midnight: ["#81a1f1", "#f97316", "#ef4444"],
};

const THEME_LABELS: Record<ThemeName, string> = {
	dark: "Dark",
	light: "Light",
	cyan: "Cyan",
	violet: "Violet",
	rose: "Rose",
	gold: "Gold",
	midnight: "Midnight",
};

export default function ThemeSelector() {
	const { stored, setPreset, setCustom } = useTheme();
	const { isPaid } = useProfile();
	const [editorOpen, setEditorOpen] = useState(false);

	const activeTheme = stored.kind === "preset" ? stored.name : null;
	const isCustomActive = stored.kind === "custom";

	const currentCustomBase: TapLabsTheme =
		stored.kind === "custom" ? stored.theme : THEMES.dark;

	const renderCard = (name: ThemeName, locked: boolean) => {
		const isActive = activeTheme === name;
		const [accent, early, late] = THEME_SWATCHES[name];
		const theme = THEMES[name];

		return (
			<button
				key={name}
				className={`theme-card ${isActive ? "theme-card--active" : ""} ${locked ? "theme-card--locked" : ""}`}
				onClick={() => !locked && setPreset(name)}
				disabled={locked}
				style={
					{
						"--card-bg": theme.surface,
						"--card-border": isActive ? accent : theme.border,
						"--card-accent": accent,
					} as React.CSSProperties
				}
				title={locked ? "Upgrade to unlock this theme" : THEME_LABELS[name]}
			>
				<div className="theme-card__preview" style={{ background: theme.bg }}>
					<div
						className="theme-card__preview-bar"
						style={{ background: accent }}
					/>
					<div className="theme-card__swatches">
						<span
							className="theme-card__swatch"
							style={{ background: accent }}
						/>
						<span
							className="theme-card__swatch"
							style={{ background: early }}
						/>
						<span className="theme-card__swatch" style={{ background: late }} />
					</div>
				</div>
				<div className="theme-card__footer">
					<span className="theme-card__name">{THEME_LABELS[name]}</span>
					{isActive && <span className="theme-card__active-dot" aria-hidden />}
					{locked && (
						<span className="theme-card__lock" aria-label="Premium">
							★
						</span>
					)}
				</div>
			</button>
		);
	};

	const renderCustomCard = (locked: boolean) => (
		<button
			className={`theme-card theme-card--custom ${isCustomActive ? "theme-card--active" : ""} ${locked ? "theme-card--locked" : ""}`}
			onClick={() => {
				if (locked) return;
				if (!isCustomActive) setCustom(currentCustomBase);
				setEditorOpen((v) => !v);
			}}
			disabled={locked}
			style={
				{
					"--card-bg": "var(--surface)",
					"--card-border": isCustomActive ? "var(--accent)" : "var(--border)",
					"--card-accent": "var(--accent)",
				} as React.CSSProperties
			}
			title={locked ? "Upgrade to unlock custom themes" : "Custom theme"}
		>
			<div className="theme-card__preview theme-card__preview--custom">
				<div className="custom-preview-grid">
					{[
						"#e74c3c",
						"#3498db",
						"#2ecc71",
						"#f39c12",
						"#9b59b6",
						"#1abc9c",
					].map((c) => (
						<span key={c} style={{ background: c }} />
					))}
				</div>
			</div>
			<div className="theme-card__footer">
				<span className="theme-card__name">Custom</span>
				{isCustomActive && (
					<span className="theme-card__active-dot" aria-hidden />
				)}
				{locked ? (
					<span className="theme-card__lock" aria-label="Premium">
						★
					</span>
				) : (
					<span className="theme-card__edit-icon" aria-hidden>
						✎
					</span>
				)}
			</div>
		</button>
	);

	return (
		<div className="theme-selector">
			<section className="theme-section">
				<h3 className="theme-section__label">Free</h3>
				<div className="theme-grid">
					{(Object.keys(FREE_THEMES) as ThemeName[]).map((name) =>
						renderCard(name, false),
					)}
				</div>
			</section>

			<section className="theme-section">
				<h3 className="theme-section__label">
					Premium
					{!isPaid && (
						<span className="theme-section__upgrade">Upgrade to unlock</span>
					)}
				</h3>
				<div className="theme-grid">
					{(Object.keys(PREMIUM_THEMES) as ThemeName[]).map((name) =>
						renderCard(name, !isPaid),
					)}
					{renderCustomCard(!isPaid)}
				</div>
			</section>

			{/* Inline editor — expands below the grid when custom is active */}
			{editorOpen && isCustomActive && (
				<div className="theme-editor-panel">
					<div className="theme-editor-panel__header">
						<span>Custom Theme</span>
						<button
							className="theme-editor-panel__close"
							onClick={() => setEditorOpen(false)}
						>
							✕
						</button>
					</div>
					<ThemeEditor
						initial={currentCustomBase}
						onChange={(next) => setCustom(next)}
					/>
				</div>
			)}
		</div>
	);
}
