import type { Drill } from "../types/types";

/* ---------------------------------- */
/* ----------- CONFIG --------------- */
/* ---------------------------------- */

// Midpoints for your sidebar buckets
const BPM_VALUES = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300];

// You now control recovery + structure here
const BURST_TYPES = [
  { length: 3,  label: "3 Burst",  recoveryBars: 0 },
  { length: 5,  label: "5 Burst",  recoveryBars: 0 },
  { length: 7,  label: "7 Burst",  recoveryBars: 0 },
  { length: 9,  label: "9 Burst",  recoveryBars: 0 },
  { length: 13, label: "13 Burst", recoveryBars: 0 },
  { length: 16, label: "16 Notes", recoveryBars: 1 },
  { length: 96, label: "96 Notes", recoveryBars: 1 },
  { length: 192, label: "192 Notes", recoveryBars: 2 },
];

/* ---------------------------------- */
/* ----------- HELPERS -------------- */
/* ---------------------------------- */


function buildBars(length: number, recoveryBars: number) {
  const bars = [];
  const maxPerBar = 16; // 4 beats × 4 resolution

  let remaining = length;

  while (remaining > 0) {
    const notesThisBar = Math.min(maxPerBar, remaining);
    bars.push({
      notes: Array.from({ length: notesThisBar }, (_, i) => i),
    });
    remaining -= notesThisBar;
  }

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
    name: `${bpm} BPM ${label}`,
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