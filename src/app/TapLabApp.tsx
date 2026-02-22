import { useRef, useState, useMemo } from "react";
import { useTapEngine } from "../engine/useTapEngine";
import { coreDrills } from "../drills/coreDrills";
import { useAuth } from "../context/useAuth";
import StatsPanel from "../stats/StatsPanel";
import VisualizerCanvas from "../visualizer/VisualizerCanvas";
import URBar from "../components/URBar/URBar";
import Sidebar from "../sidebar/Sidebar";
import MobileTapPads from "../components/MobileTapPads/MobileTapPads";
import { initHitSound } from "../lib/hitSound";
import type { SessionAnalytics } from "../analytics/sessionAnalyzer";
import "./TapLab.css";

export default function TapLabApp() {
	const { user } = useAuth();
	const [selectedDrillId, setSelectedDrillId] = useState(coreDrills[0].id);
	const [bpmOverride, setBpmOverride] = useState<number | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const selectedDrill = coreDrills.find((d) => d.id === selectedDrillId)!;
	const [isPracticeMode] = useState<boolean>(bpmOverride !== null);
	const tapRef = useRef<() => void>(() => {});
	const [lastAnalytics, setLastAnalytics] = useState<SessionAnalytics | null>(
		null,
	);
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
			className={`app ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}
		>
			<Sidebar
				drills={coreDrills}
				selectedDrillId={selectedDrillId}
				setSelectedDrillId={setSelectedDrillId}
			/>

			<main className="main">
				<button
					className="sidebar-toggle-floating"
					onClick={() => setSidebarOpen((v) => !v)}
				>
					{sidebarOpen ? "◀" : "▶"}
				</button>
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
					onSessionComplete={setLastAnalytics}
					isPracticeMode={isPracticeMode}
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
									await initHitSound(); // 🔥 unlock browser audio
									engine.start();
								}}
							>
								Begin Session
							</button>
						) : (
							<button
								className="stop-btn"
								onClick={() => {
									engine.stop();
								}}
							></button>
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

				<StatsPanel data={lastAnalytics} isPaid={true} />
			</main>
		</div>
	);
}
