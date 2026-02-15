export type HitWindows = {
  PERFECT: number;
  GOOD: number;
  MEH: number;
};

export function getHitWindows(od: number): HitWindows {
  return {
    PERFECT: 80 - 6 * od,
    GOOD: 140 - 8 * od,
    MEH: 200 - 10 * od,
  };
}

export function getGrade(
  offsetMs: number,
  windows: HitWindows
): 300 | 100 | 50 | null {
  const abs = Math.abs(offsetMs);

  if (abs <= windows.PERFECT) return 300;
  if (abs <= windows.GOOD) return 100;
  if (abs <= windows.MEH) return 50;

  return null;
}
