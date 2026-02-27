import type { TapLabsTheme } from "./themeTypes";

export const cyanTheme: TapLabsTheme = {
  bg: "#0f172a",
  surface: "#111827",
  border: "#1f2937",
  grid: "#1e293b",

  textPrimary: "#e5e7eb",
  textMuted: "#94a3b8",

  accent: "rgb(34, 211, 238)",
  accentSoft: "rgba(34, 211, 238, 0.10)",
  accentBorder: "rgba(34, 211, 238, 0.40)",

  perfect: "#22d3ee",
  early: "#f97316",
  late: "#ef4444",

  noteColor: "rgb(34, 211, 238)",
  approachColor: "rgba(34, 211, 238, 0.60)",

  backgroundImage: "#020617",
  visualizerOverlay: "rgba(0,0,0,0.45)",
};

export const violetTheme: TapLabsTheme = {
  bg: "#0f172a",
  surface: "#111827",
  border: "#1f2937",
  grid: "#1e293b",

  textPrimary: "#e5e7eb",
  textMuted: "#94a3b8",

  accent: "rgb(168, 85, 247)",
  accentSoft: "rgba(168, 85, 247, 0.10)",
  accentBorder: "rgba(168, 85, 247, 0.40)",

  perfect: "#a855f7",
  early: "#f97316",
  late: "#ef4444",

  noteColor: "rgb(168, 85, 247)",
  approachColor: "rgba(168, 85, 247, 0.60)",

  backgroundImage: "#020617",
  visualizerOverlay: "rgba(0,0,0,0.45)",
};

export const THEMES = {
  cyan: cyanTheme,
  violet: violetTheme,
} as const;

export type ThemeName = keyof typeof THEMES;