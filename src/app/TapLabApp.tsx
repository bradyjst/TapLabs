import { useRef, useState, useMemo } from "react";
import { useTapEngine } from "../engine/useTapEngine";
import { coreDrills } from "../drills/coreDrills";
import { useAuth } from "../context/useAuth";
import { initHitSound } from "../lib/hitSound";
import { Settings } from "../options/Settings";
import type { SessionAnalytics } from "../analytics/sessionAnalyzer";
import StatsPanel from "../stats/StatsPanel";
import VisualizerCanvas from "../visualizer/VisualizerCanvas";
import URBar from "../components/URBar/URBar";
import Sidebar from "../sidebar/Sidebar";
import MobileTapPads from "../components/MobileTapPads/MobileTapPads";
import "./TapLab.css";
import AuthButton from "../components/AuthButton/AuthButton";

export default function TapLabApp() {
	const { user } = useAuth();

	const [selectedDrillId, setSelectedDrillId] = useState(coreDrills[0].id);
	const [bpmOverride, setBpmOverride] = useState<number | null>(null);
	const [drillModalOpen, setDrillModalOpen] = useState(false);

	const [settingsBarOpen, setSettingsBarOpen] = useState(false);

	const [statsOpen, setStatsOpen] = useState(false);

	const selectedDrill = coreDrills.find((d) => d.id === selectedDrillId)!;

	const [visualStyle, setVisualStyle] = useState<string>("minimal");

	const tapRef = useRef<() => void>(() => {});

	const [lastAnalytics, setLastAnalytics] = useState<SessionAnalytics | null>(
		null
	);

	const isPracticeMode = bpmOverride !== null;

	const effectiveDrill = useMemo(() => {
		if (!bpmOverride) return selectedDrill;

		return {
			...selectedDrill,
			bpm: bpmOverride,
		};
	}, [selectedDrill, bpmOverride]);

	const engine = useTapEngine(effectiveDrill);

	return (
		<div
			className={`app ${drillModalOpen ? "sidebar-open" : "sidebar-collapsed"}`}
		>
			{drillModalOpen && (
				<Sidebar
					drills={coreDrills}
					selectedDrillId={selectedDrillId}
					setSelectedDrillId={setSelectedDrillId}
					onClose={() => setDrillModalOpen(false)}
				/>
			)}

			<main className="main">
				<div className="main-inner">
					<div className="banner">
						This site is currently in beta. Your scores may not permanently
						save, and the site may receive significant changes.
					</div>

					<div className="controls-row">
						<button
							className="sidebar-toggle-floating"
							onClick={() => setDrillModalOpen(true)}
						>
							Drill Select
						</button>

						<button
							className={`visual-toggle ${visualStyle}`}
							onClick={() =>
								setVisualStyle(
									visualStyle === "minimal" ? "approach" : "minimal"
								)
							}
						>
							{visualStyle === "minimal"
								? "Switch to Approach Mode"
								: "Switch to Minimal Mode"}
						</button>

						<button
							className="sidebar-toggle-floating"
							onClick={() => setSettingsBarOpen((v) => !v)}
						>
							Settings
						</button>
						<AuthButton />
					</div>

					<VisualizerCanvas
						msPerGrid={engine.msPerGrid}
						upcomingNotesRef={engine.upcomingNotesRef}
						isRunning={engine.isRunning}
						getGrade={engine.getGrade}
						windows={engine.hitWindows}
						externalTapRef={tapRef}
						sessionEndRef={engine.live.sessionEndRef}
						stop={engine.stop}
						drill={effectiveDrill}
						engine={engine}
						userId={user?.id}
						isPracticeMode={isPracticeMode}
						visualStyle={visualStyle}
						onSessionComplete={(analytics) => {
							setLastAnalytics(analytics);
							setStatsOpen(true);
						}}
					/>

					<URBar
						recentOffsetsMsRef={engine.live.recentOffsetsMsRef}
						od={selectedDrill.od}
					/>

					<div className="session-controls">
						<div className="drill-controls">
							{!engine.isRunning ? (
								<button
									className="start-btn"
									onClick={async () => {
										await initHitSound();
										engine.start();
									}}
								>
									Begin Session
								</button>
							) : (
								<button className="stop-btn" onClick={() => engine.stop()}>
									Quit Early
								</button>
							)}
						</div>

						<div className="bpm-mod">
							<label>
								Tempo Override
								<input
									type="number"
									min={60}
									max={300}
									value={bpmOverride ?? selectedDrill.bpm}
									onChange={(e) => {
										const value = Number(e.target.value);

										if (value === selectedDrill.bpm) {
											setBpmOverride(null);
										} else {
											setBpmOverride(value);
										}
									}}
								/>
							</label>

							{isPracticeMode && (
								<div className="practice-badge">
									Practice Mode – Scores Disabled
								</div>
							)}
						</div>
					</div>

					<MobileTapPads
						onTap={() => {
							tapRef.current();
						}}
					/>
				</div>
			</main>

			{/* SETTINGS PANEL */}
			<Settings
				isOpen={settingsBarOpen}
				onClose={() => setSettingsBarOpen(false)}
			/>

			{/* STATS MODAL */}
			{statsOpen && (
				<StatsPanel
					data={lastAnalytics}
					isPaid={false}
					onClose={() => setStatsOpen(false)}
				/>
			)}
		</div>
	);
}
