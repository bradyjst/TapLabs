import type { TapLabsTheme } from "./themeTypes";

export function applyTheme(theme: TapLabsTheme) {
  const root = document.documentElement;

  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--grid", theme.grid);

  root.style.setProperty("--text-primary", theme.textPrimary);
  root.style.setProperty("--text-muted", theme.textMuted);

  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-soft", theme.accentSoft);
  root.style.setProperty("--accent-border", theme.accentBorder);

  root.style.setProperty("--perfect", theme.perfect);
  root.style.setProperty("--early", theme.early);
  root.style.setProperty("--late", theme.late);

  root.style.setProperty("--note-color", theme.noteColor);
  root.style.setProperty("--approach-color", theme.approachColor);
  root.style.setProperty(
  "--visualizer-bg-image",
  `url("${theme.backgroundImage || ""}")`
);
}