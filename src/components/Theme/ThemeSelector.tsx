import { THEMES, type ThemeName } from "../../theme/themes";
import { useTheme } from "../../theme/useTheme";

export default function ThemeSelector() {
	const { stored, setPreset } = useTheme();

	return (
		<div className="theme-selector">
			<h2>Theme Selector</h2>
			{Object.keys(THEMES).map((name) => {
				const themeName = name as ThemeName;

				return (
					<button
						key={name}
						className={`theme-button ${
							stored.kind === "preset" && stored.name === themeName
								? "active"
								: ""
						}`}
						onClick={() => setPreset(themeName)}
					>
						{name}
					</button>
				);
			})}
		</div>
	);
}
