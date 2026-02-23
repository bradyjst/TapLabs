import type { Drill } from "../types/types";

/* ---------------------------------- */
/* ----------- CONFIG --------------- */
/* ---------------------------------- */

// Midpoints for your sidebar buckets
const BPM_VALUES = [110, 140, 170, 200, 230, 260, 300];

// You now control recovery + structure here
const BURST_TYPES = [
  { length: 3,  label: "3 Burst",  recoveryBars: 1 },
  { length: 5,  label: "5 Burst",  recoveryBars: 1 },
  { length: 7,  label: "7 Burst",  recoveryBars: 0 }, // tighter
  { length: 9,  label: "9 Burst",  recoveryBars: 0 },
  { length: 13, label: "13 Burst", recoveryBars: 0 },
  { length: 16, label: "16 Notes", recoveryBars: 0 },
  { length: 32, label: "32 Notes", recoveryBars: 0 },
];

/* ---------------------------------- */
/* ----------- HELPERS -------------- */
/* ---------------------------------- */

function buildBurstNotes(length: number): number[] {
  return Array.from({ length }, (_, i) => i);
}

function buildBars(length: number, recoveryBars: number) {
  const bars = [];

  // Primary burst bar
  bars.push({ notes: buildBurstNotes(length) });

  // Optional recovery bars
  for (let i = 0; i < recoveryBars; i++) {
    bars.push({ notes: [] });
  }

  return bars;
}

function calculateOD(bpm: number): number {
  const base = 6;
  const scale = Math.floor((bpm - 100) / 40);
  return Math.min(10, base + scale);
}

function calculateDurationBars(length: number): number {
  if (length <= 5) return 12;
  if (length <= 9) return 16;
  if (length <= 16) return 20;
  return 24;
}

function generateBurstDrill(
  bpm: number,
  burstLength: number,
  label: string,
  recoveryBars: number
): Drill {
  return {
    id: `burst${burstLength}_${bpm}`,
    name: `${label} – ${bpm} BPM`,
    difficulty: "easy",
    bpm,
    od: calculateOD(bpm),
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: calculateDurationBars(burstLength),
    bars: buildBars(burstLength, recoveryBars),
  };
}

/* ---------------------------------- */
/* --------- GENERATE SET ----------- */
/* ---------------------------------- */

export const coreDrills: Drill[] = [];

for (const bpm of BPM_VALUES) {
  for (const burst of BURST_TYPES) {
    coreDrills.push(
      generateBurstDrill(
        bpm,
        burst.length,
        burst.label,
        burst.recoveryBars
      )
    );
  }
}