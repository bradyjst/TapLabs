import { useEffect, useState } from "react";
import { useTapEngine } from "../engine/useTapEngine";
import VisualizerCanvas from "../visualizer/VisualizerCanvas";
import URBar from "../components/URBar";

export default function TapLabApp() {
	const [bpm, setBpm] = useState(100);
	const [subdivision, setSubdivision] = useState(1);
	const [burstCount, setBurstCount] = useState(5);
	const [gapBeats, setGapBeats] = useState(1);

	const engine = useTapEngine({
		bpm: bpm,
		subdivision: subdivision,
		burstCount: burstCount,
		gapBeats: gapBeats,
	});

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.code === "Space") {
				if (engine.isRunning) {
					engine.stop();
				} else {
					engine.start();
				}
			}
		};

		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [engine]);

	const totalHits =
		engine.live.hit300Ref.current +
		engine.live.hit100Ref.current +
		engine.live.hit50Ref.current;

	return (
		<div style={{ padding: 40 }}>
			<VisualizerCanvas
				msPerGrid={engine.msPerGrid}
				sessionStartRef={engine.live.sessionStartRef}
				upcomingNotesRef={engine.upcomingNotesRef} // 🔥 add this
				isRunning={engine.isRunning}
				registerHit={engine.registerHit}
				registerMiss={engine.registerMiss}
			/>

			<URBar recentOffsetsMsRef={engine.live.recentOffsetsMsRef} />

			<h1>TapLabs Engine Test</h1>
			<p>Running: {engine.isRunning ? "Yes" : "No"}</p>
			<p>Taps: {totalHits}</p>
			<p>Last Offset: {engine.live.lastOffsetRef.current?.toFixed(2)}</p>
			<p>
				Alignment SD: {engine.live.alignmentStdDevRef.current.toFixed(2)} ms
			</p>

			<p>Press Space to start/stop. Tap Z/X.</p>

			<aside>
				<h3>Settings</h3>

				<label>
					BPM: {bpm}
					<input
						type="text"
						min={60}
						max={300}
						value={bpm}
						onChange={(e) => setBpm(Number(e.target.value))}
					/>
				</label>

				<label>
					Subdivision:
					<select
						value={subdivision}
						onChange={(e) => setSubdivision(Number(e.target.value))}
					>
						<option value={1}>Quarter</option>
					</select>
				</label>

				<div style={{ marginTop: 16 }}>
					<button onClick={() => engine.start()}>Start</button>
					<button onClick={() => engine.stop()}>Stop</button>
				</div>

				<label>
					Burst Count:
					<input
						type="number"
						min={1}
						max={16}
						value={burstCount}
						onChange={(e) => setBurstCount(Number(e.target.value))}
					/>
				</label>

				<label>
					Gap (beats):
					<input
						type="number"
						step="0.25"
						min={0.25}
						max={4}
						value={gapBeats}
						onChange={(e) => setGapBeats(Number(e.target.value))}
					/>
				</label>
			</aside>
		</div>
	);
}
