import type { Drill } from "../types/types";

/* ---------------------------------- */
/* ----------- TYPES ---------------- */
/* ---------------------------------- */

export type DrillTemplate = {
  id: string;
  label: string;
  /** Each string = 1 bar. Characters: x = note (either hand), L = left, R = right, . = rest */
  bars: string[];
  /** Empty bars appended after the pattern before it loops */
  recoveryBars?: number;
  /** How many times the pattern loops. Overrides durationBars. */
  loops?: number;
  /** Total bars for the session. Overridden by loops if set. */
  durationBars?: number;
  /** Optional user-provided description */
  description?: string;
  /** Whether this was created by a user */
  isCustom?: boolean;
};

/* ---------------------------------- */
/* -------- CORE TEMPLATES ---------- */
/* ---------------------------------- */

export const CORE_TEMPLATES: DrillTemplate[] = [
  // Bursts
  { id: "burst3",      label: "3 Burst",       bars: ["xxx............."] },
  { id: "burst5",      label: "5 Burst",       bars: ["xxxxx..........."] },
  { id: "burst7",      label: "7 Burst",       bars: ["xxxxxxx........."] },
  { id: "burst9",      label: "9 Burst",       bars: ["xxxxxxxxx......."] },
  { id: "burst13",     label: "13 Burst",      bars: ["xxxxxxxxxxxxx..."] },
  { id: "burst16",     label: "16 Stream",     bars: ["xxxxxxxxxxxxxxxx"], recoveryBars: 1 },
  { id: "burst32",     label: "32 Stream",     bars: ["xxxxxxxxxxxxxxxx", "xxxxxxxxxxxxxxxx"], recoveryBars: 1 },

  // Trills
  { id: "trill8",      label: "8 Trill",       bars: ["LRLRLRLR........"] },
  { id: "trill16",     label: "16 Trill",      bars: ["LRLRLRLRLRLRLRLR"], recoveryBars: 1 },

  // Doubles
  { id: "doubles8",    label: "8 Doubles",     bars: ["LLRRLLRR........"] },
  { id: "doubles16",   label: "16 Doubles",    bars: ["LLRRLLRRLLRRLLRR"], recoveryBars: 1 },

  // Patterns with gaps
  { id: "gallop",      label: "Gallop",        bars: ["x.xxx.xxx.xxx.xx"] },
  { id: "triplet",     label: "Triplets",      bars: ["xxx.xxx.xxx.xxx."] },
  { id: "deathstream", label: "Deathstream",   bars: ["xxxxxxxxxxxxxxxx", "xxxxxxxxxxxxxxxx", "xxxxxxxxxxxxxxxx", "xxxxxxxxxxxxxxxx"], recoveryBars: 2 },
];

/* ---------------------------------- */
/* ----------- CONFIG --------------- */
/* ---------------------------------- */

const BPM_VALUES = [150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300];
const SLOTS_PER_BAR = 16; // 4 beats x resolution 4

/* ---------------------------------- */
/* ----------- PARSER --------------- */
/* ---------------------------------- */

type NoteSide = "left" | "right" | "either";
type ParsedNote = { slot: number; side: NoteSide };
type ParsedBar = { notes: ParsedNote[] };

function parseBarString(bar: string): ParsedBar {
  const notes: ParsedNote[] = [];
  const chars = bar.slice(0, SLOTS_PER_BAR);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === ".") continue;
    if (ch === "x" || ch === "X") {
      notes.push({ slot: i, side: "either" });
    } else if (ch === "L" || ch === "l") {
      notes.push({ slot: i, side: "left" });
    } else if (ch === "R" || ch === "r") {
      notes.push({ slot: i, side: "right" });
    }
  }

  return { notes };
}

export function parseTemplate(template: DrillTemplate): ParsedBar[] {
  const parsed = template.bars.map(parseBarString);
  const recovery = template.recoveryBars ?? 0;

  for (let i = 0; i < recovery; i++) {
    parsed.push({ notes: [] });
  }

  return parsed;
}

/* ---------------------------------- */
/* -------- DRILL BUILDER ----------- */
/* ---------------------------------- */

function calculateOD(bpm: number): number {
  const base = 6;
  const scale = Math.floor((bpm - 100) / 40);
  return Math.min(10, base + scale);
}

function calculateDurationBars(template: DrillTemplate): number {
  if (template.durationBars) return template.durationBars;

  const patternBars = template.bars.length + (template.recoveryBars ?? 0);

  if (template.loops) return patternBars * template.loops;

  // Auto-scale: shorter patterns loop more
  const noteCount = template.bars.join("").replace(/\./g, "").length;
  if (noteCount <= 5) return 12;
  if (noteCount <= 9) return 16;
  if (noteCount <= 16) return 20;
  return 24;
}

export function buildDrill(bpm: number, template: DrillTemplate): Drill {
  const parsedBars = parseTemplate(template);

  // Convert ParsedBar[] to the format the engine expects
  const bars = parsedBars.map((bar) => ({
    notes: bar.notes.map((n) =>
      n.side === "either" ? n.slot : { slot: n.slot, side: n.side }
    ),
  }));

  return {
    id: `${template.id}_${bpm}`,
    name: `${bpm} BPM ${template.label}`,
    difficulty: "easy",
    bpm,
    od: calculateOD(bpm),
    timeSig: { beatsPerBar: 4, beatUnit: 4 },
    resolution: 4,
    durationBars: calculateDurationBars(template),
    bars,
    templateId: template.id,
    isCustom: template.isCustom ?? false,
  };
}

/* ---------------------------------- */
/* ----- GENERATE CORE DRILLS ------- */
/* ---------------------------------- */

export const coreDrills: Drill[] = [];

for (const bpm of BPM_VALUES) {
  for (const template of CORE_TEMPLATES) {
    coreDrills.push(buildDrill(bpm, template));
  }
}

/* ---------------------------------- */
/* ----- USER DRILL HELPERS --------- */
/* ---------------------------------- */

/** Validate a user-created template before saving */
export function validateTemplate(template: DrillTemplate): string[] {
  const errors: string[] = [];

  if (!template.id || template.id.trim() === "") {
    errors.push("Template must have an ID.");
  }

  if (!template.label || template.label.trim() === "") {
    errors.push("Template must have a label.");
  }

  if (!template.bars.length) {
    errors.push("Template must have at least one bar.");
  }

  for (let i = 0; i < template.bars.length; i++) {
    const bar = template.bars[i];
    if (bar.length > SLOTS_PER_BAR) {
      errors.push(`Bar ${i + 1} has ${bar.length} slots (max ${SLOTS_PER_BAR}).`);
    }
    const invalid = bar.replace(/[xXlLrR.]/g, "");
    if (invalid.length > 0) {
      errors.push(`Bar ${i + 1} has invalid characters: "${invalid}". Use x, L, R, or .`);
    }
  }

  const totalNotes = template.bars.join("").replace(/\./g, "").length;
  if (totalNotes === 0) {
    errors.push("Template must contain at least one note.");
  }

  return errors;
}

/** Create a user drill template with defaults applied */
export function createUserTemplate(
  partial: Partial<DrillTemplate> & Pick<DrillTemplate, "bars" | "label">
): DrillTemplate {
  return {
    id: partial.id ?? `custom_${Date.now()}`,
    label: partial.label,
    bars: partial.bars,
    recoveryBars: partial.recoveryBars ?? 0,
    loops: partial.loops,
    durationBars: partial.durationBars,
    description: partial.description,
    isCustom: true,
  };
}

/** Generate drills from a user template across a set of BPMs */
export function generateDrillsFromTemplate(
  template: DrillTemplate,
  bpms: number[] = BPM_VALUES
): Drill[] {
  return bpms.map((bpm) => buildDrill(bpm, template));
}