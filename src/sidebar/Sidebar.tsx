import { useEffect, useState, useMemo } from "react";
import "./Sidebar.css";
import type { Drill } from "../types/types";
import { analyzeDrill } from "../drills/analyzeDrill";
import AuthButton from "../components/AuthButton/AuthButton";
import { useAuth } from "../context/useAuth";
import { getBestGrades } from "../lib/getBestGrades";

type SidebarProps = {
	drills: Drill[];
	selectedDrillId: string;
	setSelectedDrillId: (id: string) => void;
};

const BPM_BUCKETS = [
	{ min: 100, max: 120 },
	{ min: 130, max: 150 },
	{ min: 160, max: 180 },
	{ min: 200, max: 220 },
	{ min: 230, max: 250 },
	{ min: 260, max: 280 },
	{ min: 300, max: Infinity },
];

export default function Sidebar({
	drills,
	selectedDrillId,
	setSelectedDrillId,
}: SidebarProps) {
	const { user } = useAuth();
	const [bestGrades, setBestGrades] = useState<Record<string, string>>({});
	const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (!user) return;
		getBestGrades(user.id).then(setBestGrades);
	}, [user]);

	const toggleSection = (label: string) => {
		setOpenSections((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	};

	// 🔥 NEW: Get currently selected drill
	const selectedDrill = useMemo(
		() => drills.find((d) => d.id === selectedDrillId),
		[drills, selectedDrillId]
	);

	const selectedMeta = selectedDrill ? analyzeDrill(selectedDrill) : null;

	return (
		<aside className="sidebar">
			<div className="taplabsheader">
				<h2>TapLabs</h2>
				<AuthButton />
			</div>

			{/* 🔥 Current Drill Display */}
			{selectedDrill && selectedMeta && (
				<div className="current-drill">
					<div className="current-title">{selectedDrill.name}</div>
					<div className="current-meta">
						{selectedMeta.bpm} BPM • OD {selectedMeta.od}
					</div>
				</div>
			)}

			{BPM_BUCKETS.map((bucket) => {
				const label =
					bucket.max === Infinity
						? `${bucket.min}+`
						: `${bucket.min}–${bucket.max}`;

				const sectionDrills = drills.filter((d) => {
					const meta = analyzeDrill(d);
					return meta.bpm >= bucket.min && meta.bpm <= bucket.max;
				});

				if (sectionDrills.length === 0) return null;

				const isOpen = openSections[label] ?? false;

				return (
					<div key={label} className="section">
						<button
							className={`section-title ${isOpen ? "open" : ""}`}
							onClick={() => toggleSection(label)}
						>
							<span>{label} BPM</span>
							<span className="chevron">{isOpen ? "▾" : "▸"}</span>
						</button>

						{isOpen && (
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
															className={`grade-badge grade-${
																bestGrades[drill.id]
															}`}
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
						)}
					</div>
				);
			})}
		</aside>
	);
}
