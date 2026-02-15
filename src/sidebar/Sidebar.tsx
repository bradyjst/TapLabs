import "./Sidebar.css";

type SidebarProps = {
	bpm: number;
	setBpm: (v: number) => void;

	burstCount: number;
	setBurstCount: (v: number) => void;

	gapBeats: number;
	setGapBeats: (v: number) => void;

	od: number;
	setOd: (v: number) => void;

	snapDivisor: 2 | 3 | 4 | 6 | 8;
	setSnapDivisor: (v: 2 | 3 | 4 | 6 | 8) => void;

	isRunning: boolean;
	start: () => void;
	stop: () => void;
};

export default function Sidebar({
	bpm,
	setBpm,
	burstCount,
	setBurstCount,
	gapBeats,
	setGapBeats,
	od,
	setOd,
	snapDivisor,
	setSnapDivisor,
	isRunning,
	start,
	stop,
}: SidebarProps) {
	return (
		<aside className="sidebar">
			<h2>TapLabs</h2>

			<div className="section">
				<label>
					BPM
					<input
						type="number"
						min={60}
						max={300}
						value={bpm}
						onChange={(e) => setBpm(Number(e.target.value))}
					/>
				</label>
			</div>

			<div className="section">
				<label>
					Burst Count
					<input
						type="number"
						min={1}
						max={16}
						value={burstCount}
						onChange={(e) => setBurstCount(Number(e.target.value))}
					/>
				</label>
			</div>

			<div className="section">
				<label>
					Gap (beats)
					<input
						type="number"
						step="0.25"
						min={0.25}
						max={4}
						value={gapBeats}
						onChange={(e) => setGapBeats(Number(e.target.value))}
					/>
				</label>
			</div>

			<div className="section">
				<label>
					Accuracy (OD)
					<input
						type="range"
						min={0}
						max={10}
						step={0.5}
						value={od}
						onChange={(e) => setOd(Number(e.target.value))}
					/>
					<div>{od}</div>
				</label>
			</div>

			<label>
				Snap
				<select
					value={snapDivisor}
					onChange={(e) =>
						setSnapDivisor(Number(e.target.value) as 2 | 3 | 4 | 6 | 8)
					}
				>
					<option value={2}>1/2</option>
					<option value={3}>1/3</option>
					<option value={4}>1/4</option>
					<option value={6}>1/6</option>
					<option value={8}>1/8</option>
				</select>
			</label>

			<div className="buttonSection">
				{!isRunning ? (
					<button className="button start" onClick={start}>
						Start
					</button>
				) : (
					<button className="button stop" onClick={stop}>
						Stop
					</button>
				)}
			</div>
		</aside>
	);
}
