import React, { useEffect } from "react";
import ThemeSelector from "../theme/ThemeSelector";
import "./Settings.css";

/** Turns "KeyZ" → "Z", "Space" → "Space", "Digit1" → "1", etc. */
function formatKeyCode(code: string): string {
	if (code.startsWith("Key")) return code.slice(3);
	if (code.startsWith("Digit")) return code.slice(5);
	return code;
}

interface SettingsProps {
	isOpen: boolean;
	onClose: () => void;
	visualStyle: string;
	setVisualStyle: (style: string) => void;
	mirrorHands: boolean;
	setMirrorHands: (v: boolean) => void;
	keyLeft: string;
	setKeyLeft: (v: string) => void;
	keyRight: string;
	setKeyRight: (v: string) => void;
	hidePremium: boolean;
	setHidePremium: (v: boolean) => void;
	offsetMs: number;
	setOffsetMs: (v: number) => void;
	isPaid: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
	isOpen,
	onClose,
	visualStyle,
	setVisualStyle,
	mirrorHands,
	setMirrorHands,
	keyLeft,
	setKeyLeft,
	keyRight,
	setKeyRight,
	hidePremium,
	setHidePremium,
	offsetMs,
	setOffsetMs,
	isPaid,
}) => {
	const [rebinding, setRebinding] = React.useState<"left" | "right" | null>(
		null,
	);

	useEffect(() => {
		if (!rebinding) return;
		const handler = (e: KeyboardEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (e.code === "Escape") {
				setRebinding(null);
				return;
			}
			if (rebinding === "left") setKeyLeft(e.code);
			else setKeyRight(e.code);
			setRebinding(null);
		};
		window.addEventListener("keydown", handler, true);
		return () => window.removeEventListener("keydown", handler, true);
	}, [rebinding, setKeyLeft, setKeyRight]);

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
						<option value="approach">Moving Notes</option>
						<option value="osu">Approach Circle</option>
						<option value="dual">Dual Circles (L/R)</option>
					</select>

					{visualStyle === "dual" && (
						<p className="settings-hint">
							Notes split to left and right circles. Streams alternate
							automatically, forced keys go to their assigned side.
						</p>
					)}

					{visualStyle === "dual" && (
						<label className="settings-checkbox">
							<input
								type="checkbox"
								checked={mirrorHands}
								onChange={(e) => setMirrorHands(e.target.checked)}
							/>
							Mirror fingers (swap L ↔ R)
						</label>
					)}
				</div>

				<div className="settings-section">
					<h3>Key Bindings</h3>
					<div className="settings-keybinds">
						<div className="settings-keybind">
							<span>Left tap</span>
							<button
								className={`keybind-btn ${rebinding === "left" ? "listening" : ""}`}
								onClick={() => setRebinding("left")}
							>
								{rebinding === "left" ? "Press a key…" : formatKeyCode(keyLeft)}
							</button>
						</div>
						<div className="settings-keybind">
							<span>Right tap</span>
							<button
								className={`keybind-btn ${rebinding === "right" ? "listening" : ""}`}
								onClick={() => setRebinding("right")}
							>
								{rebinding === "right"
									? "Press a key…"
									: formatKeyCode(keyRight)}
							</button>
						</div>
					</div>
				</div>

				<div className="settings-section">
					<h3>Timing Offset</h3>
					<p className="settings-hint">
						Shift the hit window earlier or later to compensate for input lag or
						personal preference.
					</p>
					<div className="settings-offset">
						<input
							type="range"
							min={-50}
							max={50}
							step={1}
							value={offsetMs}
							onChange={(e) => setOffsetMs(Number(e.target.value))}
							className="offset-slider"
						/>
						<div className="offset-value-row">
							<span className="offset-label">Early</span>
							<span className="offset-value">
								{offsetMs > 0 ? "+" : ""}
								{offsetMs} ms
							</span>
							<span className="offset-label">Late</span>
						</div>
						{offsetMs !== 0 && (
							<button className="offset-reset" onClick={() => setOffsetMs(0)}>
								Reset to 0
							</button>
						)}
					</div>
				</div>

				{!isPaid && (
					<div className="settings-section">
						<h3>Display</h3>
						<label className="settings-checkbox">
							<input
								type="checkbox"
								checked={hidePremium}
								onChange={(e) => setHidePremium(e.target.checked)}
							/>
							Hide member-only features
						</label>
						<p className="settings-hint">
							Removes locked feature prompts from the interface.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
