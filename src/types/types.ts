export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "expert"
  | "extreme"
  | "weekly";

export type TimeSignature = {
  beatsPerBar: number;
  beatUnit: 4 | 8;
};

export type NoteSide = "left" | "right" | "either";

export type NoteEntry = number | { slot: number; side: NoteSide };

export type MusicalBar = {
  notes: NoteEntry[];
};

export type Drill = {
  id: string;
  name: string;
  difficulty: Difficulty;
  bpm: number;
  od: number;
  durationBars: number;
  timeSig: TimeSignature;
  resolution: number;
  bars: MusicalBar[];
  templateId?: string;
  isCustom?: boolean;
};