import { useRef, useState, useMemo, useEffect } from "react";
import { useTapEngine } from "../engine/useTapEngine";
import { coreDrills } from "../drills/coreDrills";
import { useCustomDrills } from "../drills/useCustomDrills.tsx";
import { useAuth } from "../context/useAuth";
import { initHitSound } from "../lib/hitSound";
import { Settings } from "../settings/Settings";
import type { SessionAnalytics } from "../analytics/sessionAnalyzer";
import { useProfile } from "../context/useProfile";
import { useSettings } from "../settings/useSettings";
import { useUserStats } from "../stats/useUserStats";
import {
	PlayerCard,
	DEFAULT_COSMETICS,
} from "../components/PlayerCard/PlayerCard";
import StatsPanel from "../stats/StatsPanel";
import VisualizerCanvas from "../visualizer/VisualizerCanvas";
import URBar from "../components/URBar/URBar";
import Sidebar from "../sidebar/Sidebar";
import MobileTapPads from "../components/MobileTapPads/MobileTapPads";
import Header from "../components/Header/Header";
import ProfileModal from "../components/ProfileModal/ProfileModal";
import DrillCreator from "../drills/drillCreator";

import "./TapLab.css";

export default function TapLabApp() {
	const { user } = useAuth();
	const { stats } = useUserStats();
	const [selectedDrillId, setSelectedDrillId] = useState(() => {
		return localStorage.getItem("selectedDrillId") ?? "burst3_150";
	});
	const [bpmOverride, setBpmOverride] = useState<number | null>(null);
	const [drillModalOpen, setDrillModalOpen] = useState(false);
	const [settingsBarOpen, setSettingsBarOpen] = useState(false);
	const [statsOpen, setStatsOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [creatorOpen, setCreatorOpen] = useState(false);
	const tapRef = useRef<() => void>(() => {});
	const [lastAnalytics, setLastAnalytics] = useState<SessionAnalytics | null>(
		null,
	);
	const { isPaid, profile, updatePlayerCard } = useProfile();
	const { settings, updateSetting } = useSettings();
	const { drills: customDrills, addTemplate } = useCustomDrills();

	const allDrills = useMemo(
		() => [...coreDrills, ...customDrills],
		[customDrills],
	);

	const selectedDrill = allDrills.find((d) => d.id === selectedDrillId)!;
	const isPracticeMode = bpmOverride !== null;

	const effectiveDrill = useMemo(() => {
		if (!bpmOverride) return selectedDrill;
		return { ...selectedDrill, bpm: bpmOverride };
	}, [selectedDrill, bpmOverride]);

	const engine = useTapEngine(effectiveDrill);

	useEffect(() => {
		localStorage.setItem("selectedDrillId", selectedDrillId);
	}, [selectedDrillId]);

	return (
		<div
			className={`app ${drillModalOpen ? "sidebar-open" : "sidebar-collapsed"}`}
		>
			{drillModalOpen && (
				<Sidebar
					drills={allDrills}
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
					onCreatorClick={isPaid ? () => setCreatorOpen(true) : undefined}
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
						mirrorHands={settings.mirrorHands}
						keyLeft={settings.keyLeft}
						keyRight={settings.keyRight}
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
					<div className="playercard-wrapper">
						{user ? (
							<PlayerCard
								cosmetics={profile?.player_card ?? DEFAULT_COSMETICS}
								stats={stats}
								fallbackName={user?.email?.split("@")[0] ?? "Player"}
								isPaid={isPaid}
								onChange={(next) => updatePlayerCard(next)}
							/>
						) : (
							"Log in to see your player card"
						)}
					</div>

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
									Begin Drill
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
				mirrorHands={settings.mirrorHands}
				setMirrorHands={(v) => updateSetting("mirrorHands", v)}
				keyLeft={settings.keyLeft}
				setKeyLeft={(v) => updateSetting("keyLeft", v)}
				keyRight={settings.keyRight}
				setKeyRight={(v) => updateSetting("keyRight", v)}
			/>

			{statsOpen && (
				<StatsPanel
					data={lastAnalytics}
					isPaid={isPaid}
					onClose={() => setStatsOpen(false)}
				/>
			)}

			{creatorOpen && (
				<div
					className="creator-modal-overlay"
					onClick={() => setCreatorOpen(false)}
				>
					<div className="creator-modal" onClick={(e) => e.stopPropagation()}>
						<DrillCreator
							onSave={(template) => {
								addTemplate(template);
								setCreatorOpen(false);
							}}
						/>
					</div>
				</div>
			)}

			{profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
		</div>
	);
}
