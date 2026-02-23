import { useEffect, useMemo, useState } from "react";
import { applyTheme } from "./applyTheme";
import { THEMES, type ThemeName } from "./themes";
import type { TapLabsTheme } from "./themeTypes";

const STORAGE_KEY = "taplabs_theme_v1";

type StoredTheme =
  | { kind: "preset"; name: ThemeName }
  | { kind: "custom"; theme: TapLabsTheme };

export function useTheme() {
  const [stored, setStored] = useState<StoredTheme>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { kind: "preset", name: "cyan" };
    try {
      return JSON.parse(raw) as StoredTheme;
    } catch {
      return { kind: "preset", name: "cyan" };
    }
  });

  const theme = useMemo(() => {
    if (stored.kind === "preset") return THEMES[stored.name];
    return stored.theme;
  }, [stored]);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [theme, stored]);

  return {
    theme,
    stored,
    setPreset: (name: ThemeName) => setStored({ kind: "preset", name }),
    setCustom: (theme: TapLabsTheme) => setStored({ kind: "custom", theme }),
    reset: () => setStored({ kind: "preset", name: "cyan" }),
  };
}