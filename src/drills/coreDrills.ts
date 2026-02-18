import type { Drill } from "../types";

export const coreDrills: Drill[] = [

  // 🔹 5 Burst Series (lighter / control focus)
  {
    id: "burst5_160",
    name: "5 Burst – 160 BPM",
    difficulty: "easy",
    bpm: 160,
    od: 6,
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: 12,
    bars: [
      { notes: [0,1,2,3,4] }, // Beat 1 burst
    ],
  },

  {
    id: "burst5_180",
    name: "5 Burst – 180 BPM",
    difficulty: "medium",
    bpm: 180,
    od: 7,
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: 16,
    bars: [
      { notes: [0,1,2,3,4] },
    ],
  },

  {
    id: "burst5_200",
    name: "5 Burst – 200 BPM",
    difficulty: "hard",
    bpm: 200,
    od: 8,
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: 20,
    bars: [
      { notes: [0,1,2,3,4] },
    ],
  },

  // 🔹 9 Burst Series (denser / stamina focus)
  {
    id: "burst9_160",
    name: "9 Burst – 160 BPM",
    difficulty: "medium",
    bpm: 160,
    od: 7,
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: 16,
    bars: [
      { notes: [0,1,2,3,4,5,6,7,8] },
    ],
  },

  {
    id: "burst9_180",
    name: "9 Burst – 180 BPM",
    difficulty: "hard",
    bpm: 180,
    od: 8,
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: 20,
    bars: [
      { notes: [0,1,2,3,4,5,6,7,8] },
    ],
  },

  {
    id: "burst9_200",
    name: "9 Burst – 200 BPM",
    difficulty: "expert",
    bpm: 200,
    od: 9,
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: 24,
    bars: [
      { notes: [0,1,2,3,4,5,6,7,8] },
    ],
  },

    {
    id: "16burst_200",
    name: "16 Burst – 200 BPM",
    difficulty: "expert",
    bpm: 200,
    od: 8,
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: 24,
    bars: [
      { notes: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
    ],
  },

      {
    id: "32burst_200",
    name: "32 Burst – 200 BPM",
    difficulty: "expert",
    bpm: 200,
    od: 8,
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: 24,
    bars: [
      { notes: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
        { notes: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
        {notes: []}
    ],
  },

        {
    id: "64burst_200",
    name: "64 Burst – 200 BPM",
    difficulty: "expert",
    bpm: 200,
    od: 8,
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: 24,
    bars: [
      { notes: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
        { notes: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
            { notes: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
        { notes: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
        {notes: []}
    ],
  },
];
