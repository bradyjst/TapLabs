import React, { useState, useCallback, useMemo } from "react";
import {
	type DrillTemplate,
	validateTemplate,
	createUserTemplate,
} from "./coreDrills";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type CellValue = "." | "x" | "L" | "R";

const SLOTS_PER_BAR = 16;
const MAX_BARS = 8;

interface DrillCreatorProps {
	/** Called when the user saves a valid template */
	onSave: (template: DrillTemplate) => void;
	/** Optional: pre-populate for editing an existing custom template */
	existingTemplate?: DrillTemplate;
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function createEmptyBar(): CellValue[] {
	return Array(SLOTS_PER_BAR).fill(".");
}

function barToString(bar: CellValue[]): string {
	return bar.join("");
}

function stringToBar(s: string): CellValue[] {
	const bar: CellValue[] = [];
	for (let i = 0; i < SLOTS_PER_BAR; i++) {
		const ch = s[i];
		if (ch === "L" || ch === "l") bar.push("L");
		else if (ch === "R" || ch === "r") bar.push("R");
		else if (ch === "x" || ch === "X") bar.push("x");
		else bar.push(".");
	}
	return bar;
}

function cellColor(v: CellValue): string {
	switch (v) {
		case "x":
			return "var(--cell-either)";
		case "L":
			return "var(--cell-left)";
		case "R":
			return "var(--cell-right)";
		default:
			return "transparent";
	}
}

function cellLabel(v: CellValue): string {
	if (v === ".") return "";
	return v;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

const DrillCreator: React.FC<DrillCreatorProps> = ({
	onSave,
	existingTemplate,
}) => {
	/* ---- state ---- */
	const [label, setLabel] = useState(existingTemplate?.label ?? "");
	const [description, setDescription] = useState(
		existingTemplate?.description ?? "",
	);
	const [recoveryBars, setRecoveryBars] = useState(
		existingTemplate?.recoveryBars ?? 0,
	);
	const [loops, setLoops] = useState<number | undefined>(
		existingTemplate?.loops,
	);
	const [bars, setBars] = useState<CellValue[][]>(
		existingTemplate
			? existingTemplate.bars.map(stringToBar)
			: [createEmptyBar()],
	);
	const [errors, setErrors] = useState<string[]>([]);
	const [saved, setSaved] = useState(false);
	const [paintMode, setPaintMode] = useState<CellValue>("x");

	/* ---- bar manipulation ---- */
	const addBar = useCallback(() => {
		if (bars.length >= MAX_BARS) return;
		setBars((prev) => [...prev, createEmptyBar()]);
	}, [bars.length]);

	const removeBar = useCallback(
		(index: number) => {
			if (bars.length <= 1) return;
			setBars((prev) => prev.filter((_, i) => i !== index));
		},
		[bars.length],
	);

	const duplicateBar = useCallback(
		(index: number) => {
			if (bars.length >= MAX_BARS) return;
			setBars((prev) => {
				const next = [...prev];
				next.splice(index + 1, 0, [...prev[index]]);
				return next;
			});
		},
		[bars.length],
	);

	const clearBar = useCallback((index: number) => {
		setBars((prev) => {
			const next = [...prev];
			next[index] = createEmptyBar();
			return next;
		});
	}, []);

	/* ---- cell toggle ---- */
	const toggleCell = useCallback(
		(barIdx: number, slotIdx: number, rightClick?: boolean) => {
			setBars((prev) => {
				const next = prev.map((b) => [...b]);
				if (rightClick) {
					// Right-click always clears
					next[barIdx][slotIdx] = ".";
				} else {
					// Left-click paints with current paint mode, or clears if already that value
					const current = next[barIdx][slotIdx];
					next[barIdx][slotIdx] = current === paintMode ? "." : paintMode;
				}
				return next;
			});
			setSaved(false);
			setErrors([]);
		},
		[paintMode],
	);

	/* ---- build & validate ---- */
	const templatePreview = useMemo<DrillTemplate>(() => {
		return {
			id: existingTemplate?.id ?? `custom_${Date.now()}`,
			label: label || "Untitled",
			bars: bars.map(barToString),
			recoveryBars,
			loops,
			description: description || undefined,
			isCustom: true,
		};
	}, [label, description, recoveryBars, loops, bars, existingTemplate]);

	const noteStats = useMemo(() => {
		let total = 0;
		let left = 0;
		let right = 0;
		let either = 0;
		bars.forEach((bar) =>
			bar.forEach((cell) => {
				if (cell === ".") return;
				total++;
				if (cell === "L") left++;
				else if (cell === "R") right++;
				else either++;
			}),
		);
		return { total, left, right, either };
	}, [bars]);

	const handleSave = useCallback(() => {
		const validationErrors = validateTemplate(templatePreview);
		if (validationErrors.length > 0) {
			setErrors(validationErrors);
			return;
		}
		const finalTemplate = createUserTemplate({
			...templatePreview,
			bars: bars.map(barToString),
		});
		onSave(finalTemplate);
		setSaved(true);
		setErrors([]);
	}, [templatePreview, bars, onSave]);

	/* ---- render ---- */
	return (
		<div className="drill-creator" onContextMenu={(e) => e.preventDefault()}>
			<style>{`
        .drill-creator {
          --cell-either: #e8c44a;
          --cell-left: #4a9fe8;
          --cell-right: #e85a5a;
          --bg-primary: #0d0d12;
          --bg-secondary: #16161f;
          --bg-tertiary: #1e1e2a;
          --border: #2a2a3a;
          --text-primary: #e4e4ec;
          --text-secondary: #8888a0;
          --accent: #7c6aed;

          font-family: "JetBrains Mono", "Fira Code", "SF Mono", monospace;
          background: var(--bg-primary);
          color: var(--text-primary);
          padding: 24px;
          border-radius: 12px;
          max-width: 720px;
          user-select: none;
        }

        .dc-header {
          margin-bottom: 20px;
        }

        .dc-header h2 {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 0 0 4px 0;
        }

        .dc-header p {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
        }

        /* ---- Fields ---- */
        .dc-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .dc-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dc-field.full {
          grid-column: 1 / -1;
        }

        .dc-field label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .dc-field input,
        .dc-field textarea {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 10px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
        }

        .dc-field input:focus,
        .dc-field textarea:focus {
          border-color: var(--accent);
        }

        .dc-field textarea {
          resize: vertical;
          min-height: 48px;
        }

        /* ---- Paint mode selector ---- */
        .dc-paint-mode {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .dc-paint-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 2px solid var(--border);
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          color: #000;
        }

        .dc-paint-btn.active {
          border-color: #fff;
          box-shadow: 0 0 8px rgba(255,255,255,0.2);
          transform: scale(1.1);
        }

        /* ---- Grid ---- */
        .dc-bar-section {
          margin-bottom: 12px;
        }

        .dc-bar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .dc-bar-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .dc-bar-actions {
          display: flex;
          gap: 4px;
        }

        .dc-bar-actions button {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-secondary);
          font-size: 11px;
          padding: 2px 8px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }

        .dc-bar-actions button:hover {
          color: var(--text-primary);
          border-color: var(--accent);
        }

        .dc-grid {
          display: grid;
          grid-template-columns: repeat(16, 1fr);
          gap: 3px;
        }

        .dc-cell {
          aspect-ratio: 1;
          border-radius: 4px;
          border: 1px solid var(--border);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          transition: all 0.1s;
          background: var(--bg-secondary);
          color: #000;
        }

        .dc-cell:hover {
          border-color: var(--accent);
          transform: scale(1.08);
        }

        .dc-cell.on-beat {
          border-color: #3a3a4a;
        }

        /* beat markers under grid */
        .dc-beat-markers {
          display: grid;
          grid-template-columns: repeat(16, 1fr);
          gap: 3px;
          margin-top: 2px;
        }

        .dc-beat-marker {
          text-align: center;
          font-size: 9px;
          color: var(--text-secondary);
          opacity: 0.5;
        }

        /* ---- Add bar ---- */
        .dc-add-bar {
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          margin-bottom: 20px;
          background: var(--bg-secondary);
          border: 1px dashed var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .dc-add-bar:hover {
          border-color: var(--accent);
          color: var(--text-primary);
        }

        .dc-add-bar:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* ---- Stats ---- */
        .dc-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          font-size: 12px;
        }

        .dc-stat {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dc-stat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* ---- Errors ---- */
        .dc-errors {
          background: rgba(232, 90, 90, 0.1);
          border: 1px solid rgba(232, 90, 90, 0.3);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          font-size: 12px;
          color: #e85a5a;
        }

        .dc-errors li {
          margin: 2px 0;
          list-style: none;
        }

        /* ---- Save ---- */
        .dc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dc-save-btn {
          background: var(--accent);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          padding: 10px 28px;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.5px;
        }

        .dc-save-btn:hover {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }

        .dc-saved-msg {
          font-size: 12px;
          color: #4ae87a;
        }

        /* ---- String preview ---- */
        .dc-preview {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 16px;
          font-size: 12px;
          color: var(--text-secondary);
          word-break: break-all;
        }

        .dc-preview code {
          color: var(--text-primary);
        }
      `}</style>

			<div className="dc-header">
				<h2>{existingTemplate ? "Edit Drill" : "Create Custom Drill"}</h2>
				<p>Click cells to paint notes. Right-click to erase.</p>
			</div>

			{/* ---- Meta fields ---- */}
			<div className="dc-fields">
				<div className="dc-field full">
					<label>Name</label>
					<input
						type="text"
						value={label}
						onChange={(e) => {
							setLabel(e.target.value);
							setSaved(false);
						}}
						placeholder="e.g. My Stream Pattern"
						maxLength={40}
					/>
				</div>
				<div className="dc-field">
					<label>Recovery Bars</label>
					<input
						type="number"
						min={0}
						max={8}
						value={recoveryBars}
						onChange={(e) => {
							setRecoveryBars(Number(e.target.value));
							setSaved(false);
						}}
					/>
				</div>
				<div className="dc-field">
					<label>Loops (optional)</label>
					<input
						type="number"
						min={1}
						max={32}
						value={loops ?? ""}
						onChange={(e) => {
							const v = e.target.value;
							setLoops(v === "" ? undefined : Number(v));
							setSaved(false);
						}}
						placeholder="auto"
					/>
				</div>
				<div className="dc-field full">
					<label>Description (optional)</label>
					<textarea
						value={description}
						onChange={(e) => {
							setDescription(e.target.value);
							setSaved(false);
						}}
						placeholder="What's this drill for?"
						maxLength={200}
					/>
				</div>
			</div>

			{/* ---- Paint mode ---- */}
			<div className="dc-paint-mode">
				<span>Paint:</span>
				{(["x", "L", "R"] as CellValue[]).map((mode) => (
					<button
						key={mode}
						className={`dc-paint-btn ${paintMode === mode ? "active" : ""}`}
						style={{ background: cellColor(mode) }}
						onClick={() => setPaintMode(mode)}
					>
						{mode}
					</button>
				))}
			</div>

			{/* ---- Bar grids ---- */}
			{bars.map((bar, barIdx) => (
				<div className="dc-bar-section" key={barIdx}>
					<div className="dc-bar-header">
						<span className="dc-bar-label">Bar {barIdx + 1}</span>
						<div className="dc-bar-actions">
							<button onClick={() => clearBar(barIdx)}>Clear</button>
							<button onClick={() => duplicateBar(barIdx)}>Dupe</button>
							{bars.length > 1 && (
								<button onClick={() => removeBar(barIdx)}>Remove</button>
							)}
						</div>
					</div>
					<div className="dc-grid">
						{bar.map((cell, slotIdx) => (
							<div
								key={slotIdx}
								className={`dc-cell ${slotIdx % 4 === 0 ? "on-beat" : ""}`}
								style={{
									background:
										cell === "." ? "var(--bg-secondary)" : cellColor(cell),
								}}
								onClick={() => toggleCell(barIdx, slotIdx)}
								onContextMenu={(e) => {
									e.preventDefault();
									toggleCell(barIdx, slotIdx, true);
								}}
							>
								{cellLabel(cell)}
							</div>
						))}
					</div>
					<div className="dc-beat-markers">
						{Array.from({ length: SLOTS_PER_BAR }).map((_, i) => (
							<div key={i} className="dc-beat-marker">
								{i % 4 === 0 ? i / 4 + 1 : ""}
							</div>
						))}
					</div>
				</div>
			))}

			<button
				className="dc-add-bar"
				onClick={addBar}
				disabled={bars.length >= MAX_BARS}
			>
				+ Add Bar {bars.length >= MAX_BARS && `(max ${MAX_BARS})`}
			</button>

			{/* ---- Stats ---- */}
			<div className="dc-stats">
				<div className="dc-stat">
					<span>Total: {noteStats.total}</span>
				</div>
				<div className="dc-stat">
					<div
						className="dc-stat-dot"
						style={{ background: "var(--cell-either)" }}
					/>
					<span>Either: {noteStats.either}</span>
				</div>
				<div className="dc-stat">
					<div
						className="dc-stat-dot"
						style={{ background: "var(--cell-left)" }}
					/>
					<span>Left: {noteStats.left}</span>
				</div>
				<div className="dc-stat">
					<div
						className="dc-stat-dot"
						style={{ background: "var(--cell-right)" }}
					/>
					<span>Right: {noteStats.right}</span>
				</div>
			</div>

			{/* ---- String preview ---- */}
			<div className="dc-preview">
				Pattern:{" "}
				<code>
					{bars.map(barToString).join(" | ")}
					{recoveryBars > 0 &&
						` + ${recoveryBars} rest bar${recoveryBars > 1 ? "s" : ""}`}
				</code>
			</div>

			{/* ---- Errors ---- */}
			{errors.length > 0 && (
				<div className="dc-errors">
					<ul>
						{errors.map((e, i) => (
							<li key={i}>⚠ {e}</li>
						))}
					</ul>
				</div>
			)}

			{/* ---- Save ---- */}
			<div className="dc-footer">
				<button className="dc-save-btn" onClick={handleSave}>
					{existingTemplate ? "Update Drill" : "Save Drill"}
				</button>
				{saved && <span className="dc-saved-msg">✓ Saved</span>}
			</div>
		</div>
	);
};

export default DrillCreator;
