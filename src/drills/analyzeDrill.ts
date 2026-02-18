import type { Drill } from "../types";

function resolutionToSubdivision(resolution: number) {
  const value = resolution * 4;
  return `${value}th Notes`;
}

export function analyzeDrill(drill: Drill) {
  const totalNotes = drill.bars.reduce(
    (sum, bar) => sum + bar.notes.length,
    0
  );

  const beatLength = 60000 / drill.bpm;
  const barLengthMs =
    beatLength * drill.timeSig.beatsPerBar;

  const totalDurationSec =
    (barLengthMs * drill.durationBars) / 1000;

  let focus = "Control";
  if (totalNotes <= 5) focus = "Burst";
  else if (totalNotes >= 9) focus = "Endurance";

  return {
    bpm: drill.bpm,
    od: drill.od,
    focus,
    subdivision: resolutionToSubdivision(drill.resolution),
    timeSig: `${drill.timeSig.beatsPerBar}/4`,
    notesPerBar: totalNotes,
    duration: `${drill.durationBars} bars • ${Math.round(totalDurationSec)}s`,
  };
}
