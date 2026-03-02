import React, { useState } from "react";
import type { UserStats } from "../../stats/useUserStats";
import "./PlayerCard.css";

/* ------------------------------------------------------------------ */
/*  TYPES & CONSTANTS                                                  */
/* ------------------------------------------------------------------ */

export type CardCosmetics = {
	displayName: string;
	accentColor: string;
	title: string;
	badge: string;
};

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_COSMETICS: CardCosmetics = {
	displayName: "",
	accentColor: "#7c6aed",
	title: "",
	badge: "",
};

const ACCENT_COLORS = [
	{ value: "#7c6aed", label: "Purple" },
	{ value: "#4a9fe8", label: "Blue" },
	{ value: "#e85a5a", label: "Red" },
	{ value: "#4ae87a", label: "Green" },
	{ value: "#e8c44a", label: "Gold" },
	{ value: "#e87a4a", label: "Orange" },
	{ value: "#4ae8d4", label: "Cyan" },
	{ value: "#d44ae8", label: "Pink" },
	{ value: "#ffffff", label: "White" },
];

const TITLES = [
	"",
	"Speed Demon",
	"Stream King",
	"Rhythm Machine",
	"Tap Prodigy",
	"Burst Master",
	"Deathstreamer",
	"The Metronome",
	"Finger Athlete",
];

const BADGES = ["", "⚡", "🔥", "💎", "🎯", "👑", "⭐", "🏆", "💀"];

/* ------------------------------------------------------------------ */
/*  PLAYER CARD                                                        */
/* ------------------------------------------------------------------ */

interface PlayerCardProps {
	cosmetics: CardCosmetics;
	stats: UserStats | null;
	fallbackName: string;
	isPaid: boolean;
	onChange?: (cosmetics: CardCosmetics) => void;
}

export function PlayerCard({
	cosmetics,
	stats,
	fallbackName,
	isPaid,
	onChange,
}: PlayerCardProps) {
	const [editing, setEditing] = useState(false);
	const name = cosmetics.displayName || fallbackName;
	const accent =
		isPaid && cosmetics.accentColor ? cosmetics.accentColor : "#7c6aed";
	const title = isPaid ? cosmetics.title : "";
	const badge = isPaid ? cosmetics.badge : "";

	return (
		<>
			<div
				className="player-card"
				style={{ "--card-accent": accent } as React.CSSProperties}
			>
				<div className="pc-left">
					<div className="pc-name-row">
						{badge && <span className="pc-badge">{badge}</span>}
						<span className="pc-name">{name}</span>
					</div>
					{title && <span className="pc-title">{title}</span>}
				</div>

				<div className="pc-stats">
					<div className="pc-stat">
						<span className="pc-stat-value">
							{stats ? stats.bestUr.toFixed(1) : "—"}
						</span>
						<span className="pc-stat-label">Best UR</span>
					</div>
					<div className="pc-stat">
						<span className="pc-stat-value">
							{stats?.bpmCeiling ? `${stats.bpmCeiling}` : "—"}
						</span>
						<span className="pc-stat-label">BPM Ceiling</span>
					</div>
					<div className="pc-stat">
						<span className="pc-stat-value">
							{stats ? `${(stats.bestAccuracy * 100).toFixed(1)}%` : "—"}
						</span>
						<span className="pc-stat-label">Best Acc</span>
					</div>
				</div>

				{onChange && (
					<button className="pc-edit-btn" onClick={() => setEditing(true)}>
						✎
					</button>
				)}
			</div>

			{editing && onChange && (
				<PlayerCardEditor
					cosmetics={cosmetics}
					onChange={(next) => {
						onChange(next);
						setEditing(false);
					}}
					onClose={() => setEditing(false)}
					isPaid={isPaid}
					fallbackName={fallbackName}
					stats={stats}
				/>
			)}
		</>
	);
}

/* ------------------------------------------------------------------ */
/*  EDITOR (internal, rendered by PlayerCard)                          */
/* ------------------------------------------------------------------ */

interface PlayerCardEditorProps {
	cosmetics: CardCosmetics;
	onChange: (cosmetics: CardCosmetics) => void;
	onClose: () => void;
	isPaid: boolean;
	fallbackName: string;
	stats: UserStats | null;
}

function PlayerCardEditor({
	cosmetics,
	onChange,
	onClose,
	isPaid,
	fallbackName,
	stats,
}: PlayerCardEditorProps) {
	const [draft, setDraft] = useState<CardCosmetics>({ ...cosmetics });

	const update = <K extends keyof CardCosmetics>(
		key: K,
		value: CardCosmetics[K],
	) => {
		setDraft((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<div className="pce-overlay" onClick={onClose}>
			<div className="pce-modal" onClick={(e) => e.stopPropagation()}>
				<div className="pce-header">
					<h2>Edit Player Card</h2>
					<button className="pce-close" onClick={onClose}>
						✕
					</button>
				</div>

				{/* Live preview */}
				<div className="pce-preview">
					<PlayerCard
						cosmetics={draft}
						stats={stats}
						fallbackName={fallbackName}
						isPaid={isPaid}
					/>
				</div>

				{/* Display name — always free */}
				<div className="pce-field">
					<label>Display Name</label>
					<input
						type="text"
						value={draft.displayName}
						onChange={(e) => update("displayName", e.target.value)}
						placeholder={fallbackName}
						maxLength={20}
					/>
				</div>

				{/* Accent color — paid */}
				<div className={`pce-field ${!isPaid ? "pce-locked" : ""}`}>
					<label>
						Accent Color
						{!isPaid && <span className="pce-member-tag">Member</span>}
					</label>
					{isPaid ? (
						<div className="pce-colors">
							{ACCENT_COLORS.map((c) => (
								<button
									key={c.value}
									className={`pce-color-swatch ${draft.accentColor === c.value ? "active" : ""}`}
									style={{ background: c.value }}
									onClick={() => update("accentColor", c.value)}
									title={c.label}
								/>
							))}
						</div>
					) : (
						<p className="pce-locked-msg">
							Unlock card colors with a membership.
						</p>
					)}
				</div>

				{/* Title — paid */}
				<div className={`pce-field ${!isPaid ? "pce-locked" : ""}`}>
					<label>
						Title
						{!isPaid && <span className="pce-member-tag">Member</span>}
					</label>
					{isPaid ? (
						<div className="pce-titles">
							{TITLES.map((t) => (
								<button
									key={t}
									className={`pce-title-btn ${draft.title === t ? "active" : ""}`}
									onClick={() => update("title", t)}
								>
									{t || "None"}
								</button>
							))}
						</div>
					) : (
						<p className="pce-locked-msg">
							Unlock custom titles with a membership.
						</p>
					)}
				</div>

				{/* Badge — paid */}
				<div className={`pce-field ${!isPaid ? "pce-locked" : ""}`}>
					<label>
						Badge
						{!isPaid && <span className="pce-member-tag">Member</span>}
					</label>
					{isPaid ? (
						<div className="pce-badges">
							{BADGES.map((b) => (
								<button
									key={b}
									className={`pce-badge-btn ${draft.badge === b ? "active" : ""}`}
									onClick={() => update("badge", b)}
								>
									{b || "✕"}
								</button>
							))}
						</div>
					) : (
						<p className="pce-locked-msg">Unlock badges with a membership.</p>
					)}
				</div>

				<div className="pce-actions">
					<button className="pce-save" onClick={() => onChange(draft)}>
						Save
					</button>
					<button className="pce-cancel" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
