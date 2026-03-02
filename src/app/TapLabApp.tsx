import { useRef, useState, useMemo } from "react";
import { useTapEngine } from "../engine/useTapEngine";
import { coreDrills } from "../drills/coreDrills";
import { useAuth } from "../context/useAuth";
import { initHitSound } from "../lib/hitSound";
import { Settings } from "../settings/Settings";
import type { SessionAnalytics } from "../analytics/sessionAnalyzer";
import { useProfile } from "../context/useProfile";
import { useSettings } from "../settings/useSettings";
import StatsPanel from "../stats/StatsPanel";
import VisualizerCanvas from "../visualizer/VisualizerCanvas";
import URBar from "../components/URBar/URBar";
import Sidebar from "../sidebar/Sidebar";
import MobileTapPads from "../components/MobileTapPads/MobileTapPads";
import Header from "../components/Header/Header";
import ProfileModal from "../components/ProfileModal/ProfileModal";
import "./TapLab.css";

export default function TapLabApp() {
	const { user } = useAuth();
	const [selectedDrillId, setSelectedDrillId] = useState(coreDrills[0].id);
	const [bpmOverride, setBpmOverride] = useState<number | null>(null);
	const [drillModalOpen, setDrillModalOpen] = useState(false);
	const [settingsBarOpen, setSettingsBarOpen] = useState(false);
	const [statsOpen, setStatsOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const selectedDrill = coreDrills.find((d) => d.id === selectedDrillId)!;
	const tapRef = useRef<() => void>(() => {});
	const [lastAnalytics, setLastAnalytics] = useState<SessionAnalytics | null>(
		null,
	);
	const { isPaid } = useProfile();
	const { settings, updateSetting } = useSettings();

	const isPracticeMode = bpmOverride !== null;

	const effectiveDrill = useMemo(() => {
		if (!bpmOverride) return selectedDrill;
		return { ...selectedDrill, bpm: bpmOverride };
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
				<Header
					onDrillSelectClick={() => setDrillModalOpen(true)}
					onSettingsClick={() => setSettingsBarOpen((v) => !v)}
					onProfileClick={() => setProfileOpen(true)}
				/>

				<div className="main-inner">
					<div className="current-drill-display">
						<h4>{effectiveDrill.name}</h4>
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
						visualStyle={settings.visualStyle}
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

					<MobileTapPads onTap={() => tapRef.current()} />
				</div>
			</main>

			<Settings
				isOpen={settingsBarOpen}
				onClose={() => setSettingsBarOpen(false)}
				visualStyle={settings.visualStyle}
				setVisualStyle={(style) => updateSetting("visualStyle", style)}
			/>

			{statsOpen && (
				<StatsPanel
					data={lastAnalytics}
					isPaid={isPaid}
					onClose={() => setStatsOpen(false)}
				/>
			)}

			{/* Rendered at root level so position:fixed works correctly */}
			{profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
		</div>
	);
}
