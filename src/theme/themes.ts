import type { TapLabsTheme } from "./themeTypes";

// ─── FREE THEMES ──────────────────────────────────────────────────────────────

export const darkTheme: TapLabsTheme = {
  bg: "#0f172a",
  surface: "#111827",
  border: "#1f2937",
  grid: "#1e293b",

  textPrimary: "#e5e7eb",
  textMuted: "#94a3b8",

  accent: "rgb(148, 163, 184)",
  accentSoft: "rgba(148, 163, 184, 0.10)",
  accentBorder: "rgba(148, 163, 184, 0.35)",

  perfect: "#94a3b8",
  good: "#ffd166",
  meh: "#ff5c7a",
  early: "#f97316",
  late: "#ef4444",

  noteColor: "rgb(148, 163, 184)",
  approachColor: "rgba(148, 163, 184, 0.55)",

  backgroundImage: "#020617",
  visualizerOverlay: "rgba(0,0,0,0.45)",
};

export const lightTheme: TapLabsTheme = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  grid: "#f1f5f9",

  textPrimary: "#0f172a",
  textMuted: "#64748b",

  accent: "rgb(15, 118, 110)",
  accentSoft: "rgba(15, 118, 110, 0.08)",
  accentBorder: "rgba(15, 118, 110, 0.35)",

  perfect: "#0f766e",
  good: "#b45309",
  meh: "#be123c",
  early: "#c2410c",
  late: "#b91c1c",

  noteColor: "rgb(15, 118, 110)",
  approachColor: "rgba(15, 118, 110, 0.50)",

  backgroundImage: "#f1f5f9",
  visualizerOverlay: "rgba(255,255,255,0.35)",
};

// ─── PREMIUM THEMES ───────────────────────────────────────────────────────────

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
  good: "#ffd166",
  meh: "#ff5c7a",
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
  good: "#ffd166",
  meh: "#ff5c7a",
  early: "#f97316",
  late: "#ef4444",

  noteColor: "rgb(168, 85, 247)",
  approachColor: "rgba(168, 85, 247, 0.60)",

  backgroundImage: "#020617",
  visualizerOverlay: "rgba(0,0,0,0.45)",
};

export const roseTheme: TapLabsTheme = {
  bg: "#12060e",
  surface: "#1a0d16",
  border: "#2d1424",
  grid: "#21101a",

  textPrimary: "#f5e6ef",
  textMuted: "#9d7a8e",

  accent: "rgb(251, 63, 128)",
  accentSoft: "rgba(251, 63, 128, 0.10)",
  accentBorder: "rgba(251, 63, 128, 0.40)",

  perfect: "#fb3f80",
  good: "#fda4af",
  meh: "#be123c",
  early: "#fb923c",
  late: "#f43f5e",

  noteColor: "rgb(251, 63, 128)",
  approachColor: "rgba(251, 63, 128, 0.55)",

  backgroundImage: "#0a0408",
  visualizerOverlay: "rgba(0,0,0,0.50)",
};

export const goldTheme: TapLabsTheme = {
  bg: "#0c0a06",
  surface: "#151209",
  border: "#2a2210",
  grid: "#1e1a0d",

  textPrimary: "#f5f0e8",
  textMuted: "#9c8f72",

  accent: "rgb(234, 179, 8)",
  accentSoft: "rgba(234, 179, 8, 0.10)",
  accentBorder: "rgba(234, 179, 8, 0.40)",

  perfect: "#eab308",
  good: "#f59e0b",
  meh: "#dc2626",
  early: "#f97316",
  late: "#ef4444",

  noteColor: "rgb(234, 179, 8)",
  approachColor: "rgba(234, 179, 8, 0.55)",

  backgroundImage: "#060502",
  visualizerOverlay: "rgba(0,0,0,0.50)",
};

export const midnightTheme: TapLabsTheme = {
  bg: "#08090f",
  surface: "#0e1018",
  border: "#181c28",
  grid: "#121520",

  textPrimary: "#dde4f0",
  textMuted: "#6b7a99",

  accent: "rgb(129, 161, 241)",
  accentSoft: "rgba(129, 161, 241, 0.08)",
  accentBorder: "rgba(129, 161, 241, 0.30)",

  perfect: "#81a1f1",
  good: "#c4b5fd",
  meh: "#f472b6",
  early: "#f97316",
  late: "#ef4444",

  noteColor: "rgb(129, 161, 241)",
  approachColor: "rgba(129, 161, 241, 0.50)",

  backgroundImage: "#03040a",
  visualizerOverlay: "rgba(0,0,0,0.55)",
};

// ─── REGISTRY ─────────────────────────────────────────────────────────────────

export const FREE_THEMES = {
  dark: darkTheme,
  light: lightTheme,
} as const;

export const PREMIUM_THEMES = {
  cyan: cyanTheme,
  violet: violetTheme,
  rose: roseTheme,
  gold: goldTheme,
  midnight: midnightTheme,
} as const;

export const THEMES = {
  ...FREE_THEMES,
  ...PREMIUM_THEMES,
} as const;

export type ThemeName = keyof typeof THEMES;
export type FreeThemeName = keyof typeof FREE_THEMES;
export type PremiumThemeName = keyof typeof PREMIUM_THEMES;

export function isPremiumTheme(name: ThemeName): name is PremiumThemeName {
  return name in PREMIUM_THEMES;
}