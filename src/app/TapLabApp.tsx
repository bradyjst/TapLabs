import { useState } from "react";
import { useTapEngine } from "../engine/useTapEngine";
import StatsPanel from "../stats/StatsPanel";
import VisualizerCanvas from "../visualizer/VisualizerCanvas";
import URBar from "../components/URBar";
import Sidebar from "../sidebar/Sidebar";
import "./TapLab.css";

export default function TapLabApp() {
	const [bpm, setBpm] = useState(150);
	const [burstCount, setBurstCount] = useState(5);
	const [gapBeats, setGapBeats] = useState(2);
	const [od, setOd] = useState(8);
	const [snapDivisor, setSnapDivisor] = useState<2 | 3 | 4 | 6 | 8>(4);

	const engine = useTapEngine({
		bpm,
		burstCount,
		gapBeats,
		od,
		snapDivisor,
	});

	return (
		<div className="app">
			<Sidebar
				bpm={bpm}
				setBpm={setBpm}
				burstCount={burstCount}
				setBurstCount={setBurstCount}
				gapBeats={gapBeats}
				setGapBeats={setGapBeats}
				od={od}
				setOd={setOd}
				snapDivisor={snapDivisor}
				setSnapDivisor={setSnapDivisor}
				isRunning={engine.isRunning}
				start={engine.start}
				stop={engine.stop}
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
				/>

				<URBar recentOffsetsMsRef={engine.live.recentOffsetsMsRef} od={od} />

				<StatsPanel
					alignmentSD={engine.live.alignmentStdDevRef.current}
					unstableRate={engine.live.unstableRateRef.current}
					meanOffset={engine.live.meanOffsetRef.current}
				/>
			</main>
		</div>
	);
}
