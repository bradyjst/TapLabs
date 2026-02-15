import { useEffect, useState } from "react";
import VisualizerCanvas from "../visualizer/VisualizerCanvas";
import { useTapEngine } from "../engine/useTapEngine";

export default function TapLabApp() {
	const [bpm, setBpm] = useState(200);
	const [subdivision, setSubdivision] = useState(4);

	const engine = useTapEngine({
		bpm: bpm,
		subdivision: subdivision,
	});

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.code === "KeyZ" || e.code === "KeyX") {
				engine.registerTap();
			}
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

	return (
		<div style={{ padding: 40 }}>
			<VisualizerCanvas
				msPerGrid={engine.msPerGrid}
				lastOffsetRef={engine.live.lastOffsetRef}
				sessionStartRef={engine.live.sessionStartRef}
				isRunning={engine.isRunning}
			/>

			<h1>TapLabs Engine Test</h1>
			<p>Running: {engine.isRunning ? "Yes" : "No"}</p>
			<p>Taps: {engine.live.tapCountRef.current}</p>
			<p>Last Offset: {engine.live.lastOffsetRef.current?.toFixed(2)}</p>
			<p>
				Alignment SD: {engine.live.alignmentStdDevRef.current.toFixed(2)} ms
			</p>
			<p>Interval SD: {engine.live.intervalStdDevRef.current.toFixed(2)} ms</p>

			<p>Press Space to start/stop. Tap Z/X.</p>

			<aside>
				<h3>Settings</h3>

				<label>
					BPM: {bpm}
					<input
						type="range"
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
						<option value={2}>8ths</option>
						<option value={4}>16ths</option>
						<option value={8}>32nds</option>
					</select>
				</label>

				<div style={{ marginTop: 16 }}>
					<button onClick={() => engine.start()}>Start</button>
					<button onClick={() => engine.stop()}>Stop</button>
				</div>
			</aside>
		</div>
	);
}
