export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "expert"
  | "weekly";

export type TimeSignature = {
  beatsPerBar: number; // usually 4
  beatUnit: 4 | 8;     // 4 = quarter note base
};

export type MusicalBar = {
  notes: number[]; // grid positions inside bar
};

export type Drill = {
  id: string;
  name: string;
  difficulty: Difficulty;
  bpm: number;
  od: number;
  durationBars: number;
  timeSig: TimeSignature;
  resolution: number; // 1 = quarter, 2 = 8th, 4 = 16th, 8 = 32nd

  bars: MusicalBar[];
};
