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
import "./TapLab.css";

export default function TapLabApp() {
	const { user } = useAuth();
	// 🔥 Selected drill state
	const [selectedDrillId, setSelectedDrillId] = useState(coreDrills[0].id);
	const [bpmOverride, setBpmOverride] = useState<number | null>(null);

	const selectedDrill = coreDrills.find((d) => d.id === selectedDrillId)!;

	const isPracticeMode = bpmOverride !== null;

	const effectiveDrill = useMemo(() => {
		if (!bpmOverride) return selectedDrill;

		return {
			...selectedDrill,
			bpm: bpmOverride,
		};
	}, [selectedDrill, bpmOverride]);

	// 🔥 Engine now receives entire drill
	const engine = useTapEngine(effectiveDrill);

	const tapRef = useRef<() => void>(() => {});

	return (
		<div className="app">
			<Sidebar
				drills={coreDrills}
				selectedDrillId={selectedDrillId}
				setSelectedDrillId={setSelectedDrillId}
			/>

			<main className="main">
				<VisualizerCanvas
					msPerGrid={engine.msPerGrid}
					upcomingNotesRef={engine.upcomingNotesRef}
					isRunning={engine.isRunning}
					registerHit={engine.registerHit}
					registerMiss={engine.registerMiss}
					getGrade={engine.getGrade}
					windows={engine.hitWindows}
					externalTapRef={tapRef}
					sessionEndRef={engine.live.sessionEndRef}
					stop={engine.stop}
					drill={effectiveDrill}
					engine={engine}
					userId={user?.id}
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

				<StatsPanel
					alignmentSD={engine.live.alignmentStdDevRef.current}
					unstableRate={engine.live.unstableRateRef.current}
					meanOffset={engine.live.meanOffsetRef.current}
				/>
			</main>
		</div>
	);
}
