// Centralized timing windows for TapLabs
// Single source of truth for grading + visuals

export const HIT_WINDOWS = {
  PERFECT: 16,  // 300
  GOOD: 34,     // 100
  MEH: 50,      // 50
} as const;

// Optional helper if you ever want grading logic centralized
export function getGrade(offsetMs: number): 300 | 100 | 50 | null {
  const abs = Math.abs(offsetMs);

  if (abs <= HIT_WINDOWS.PERFECT) return 300;
  if (abs <= HIT_WINDOWS.GOOD) return 100;
  if (abs <= HIT_WINDOWS.MEH) return 50;

  return null;
}
