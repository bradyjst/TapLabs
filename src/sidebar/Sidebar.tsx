import { useEffect, useState } from "react";
import "./Sidebar.css";
import type { Drill, Difficulty } from "../types/types";
import { analyzeDrill } from "../drills/analyzeDrill";
import AuthButton from "../components/AuthButton/AuthButton";
import { useAuth } from "../context/useAuth";
import { getBestGrades } from "../lib/getBestGrades";

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
	const { user } = useAuth();
	const [bestGrades, setBestGrades] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!user) return;
		getBestGrades(user.id).then(setBestGrades);
	}, [user]);

	return (
		<aside className="sidebar">
			<div className="taplabsheader">
				<h2>TapLabs</h2>
				<AuthButton />
			</div>

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
											<div className="drill-row">
												<span>{drill.name}</span>

												{bestGrades[drill.id] && (
													<span
														className={`grade-badge grade-${bestGrades[drill.id]}`}
													>
														{bestGrades[drill.id]}
													</span>
												)}
											</div>
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
