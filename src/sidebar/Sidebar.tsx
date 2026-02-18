import "./Sidebar.css";
import type { Drill, Difficulty } from "../types";
import { analyzeDrill } from "../drills/analyzeDrill";

type SidebarProps = {
	drills: Drill[];
	selectedDrillId: string;
	setSelectedDrillId: (id: string) => void;
};

const sections: Difficulty[] = [
	"easy",
	"medium",
	"hard",
	"expert",
	"extreme",
	"weekly",
];

export default function Sidebar({
	drills,
	selectedDrillId,
	setSelectedDrillId,
}: SidebarProps) {
	return (
		<aside className="sidebar">
			<h2>TapLabs</h2>

			{sections.map((section) => {
				const sectionDrills = drills.filter((d) => d.difficulty === section);

				if (sectionDrills.length === 0) return null;

				return (
					<div key={section} className="section">
						<h3 className="section-title">{section.toUpperCase()}</h3>

						<div className="drill-list">
							{sectionDrills.map((drill) => {
								const meta = analyzeDrill(drill);

								return (
									<div key={drill.id} className="drill-item-wrapper">
										<button
											className={`drill-item ${
												selectedDrillId === drill.id ? "active" : ""
											}`}
											onClick={() => setSelectedDrillId(drill.id)}
										>
											{drill.name}
										</button>

										<div className="drill-popout">
											<div>BPM: {meta.bpm}</div>
											<div>OD: {meta.od}</div>
											<div>Focus: {meta.focus}</div>
											<div>Subdivision: {meta.subdivision}</div>
											<div>{meta.duration}</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</aside>
	);
}
