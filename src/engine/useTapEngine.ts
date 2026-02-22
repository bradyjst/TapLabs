import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { getHitWindows, getGrade } from "./timingConfig";
import type { HitWindows } from "./timingConfig";
import type { Drill } from "../types/types";
import { playHitSound, playAccentHit, getAudioCtx } from "../lib/hitSound";

/* ---------------------------------- */
/* ----------- TAP EVENT ------------ */
/* ---------------------------------- */

export type TapEvent = {
  offset: number;
  side: "left" | "right";
  timestamp: number;
  index: number;
};

/* ---------------------------------- */
/* -------- RUNNING STATS ----------- */
/* ---------------------------------- */

type RunningStats = {
  n: number;
  mean: number;
  m2: number;
};

function createStats(): RunningStats {
  return { n: 0, mean: 0, m2: 0 };
}

function pushStat(stats: RunningStats, value: number) {
  stats.n += 1;
  const delta = value - stats.mean;
  stats.mean += delta / stats.n;
  const delta2 = value - stats.mean;
  stats.m2 += delta * delta2;
}

function stdDev(stats: RunningStats) {
  if (stats.n < 2) return 0;
  return Math.sqrt(stats.m2 / (stats.n - 1));
}

/* ---------------------------------- */
/* ------ PATTERN TIME BUILDER ------ */
/* ---------------------------------- */

function buildPatternTimes(drill: Drill, sessionStartMs: number) {
  const beatLength = 60000 / drill.bpm;
  const barLength = beatLength * drill.timeSig.beatsPerBar;
  const gridSize = beatLength / drill.resolution;
  const gridsPerBar =
    drill.timeSig.beatsPerBar * drill.resolution;

  const times: number[] = [];
  const totalBars = drill.durationBars;

  for (let barCounter = 0; barCounter < totalBars; barCounter++) {
    const barIndex = barCounter % drill.bars.length;

    const barStart =
      sessionStartMs +
      barCounter * barLength;

    const bar = drill.bars[barIndex];

    for (const gridIndex of bar.notes) {
      if (gridIndex >= gridsPerBar) continue;
      times.push(barStart + gridIndex * gridSize);
    }
  }

  return times;
}

/* ---------------------------------- */
/* ----------- TAP ENGINE ----------- */
/* ---------------------------------- */

export function useTapEngine(drill: Drill) {
  const [isRunning, setIsRunning] = useState(false);

  const sessionStartRef = useRef<number>(0);
  const metronomeStartRef = useRef<number>(0);
  const upcomingNotesRef = useRef<number[]>([]);
  const sessionEndRef = useRef<number>(0);

  const offsetsStatsRef = useRef<RunningStats>(createStats());
  const lastOffsetRef = useRef<number | null>(null);
  const recentOffsetsMsRef = useRef<number[]>([]);
	const completedRef = useRef(false);
  const alignmentStdDevRef = useRef<number>(0);
  const meanOffsetRef = useRef<number>(0);
  const unstableRateRef = useRef<number>(0);

  const hit300Ref = useRef(0);
  const hit100Ref = useRef(0);
  const hit50Ref = useRef(0);
  const missRef = useRef(0);

  // 🔥 NEW — Full tap log
  const tapEventsRef = useRef<TapEvent[]>([]);

  const beatLength = useMemo(
    () => 60000 / drill.bpm,
    [drill.bpm]
  );

  const msPerGrid = useMemo(() => {
    return beatLength / drill.resolution;
  }, [beatLength, drill.resolution]);

  const hitWindows: HitWindows = useMemo(
    () => getHitWindows(drill.od),
    [drill.od]
  );

  /* ---------------------------------- */
  /* ------------ METRONOME ----------- */
  /* ---------------------------------- */

  const playClick = useCallback((downbeat: boolean) => {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = downbeat ? 1200 : 800;
    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    let raf: number;
    let lastBeat = -1;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - metronomeStartRef.current;
      const beatIndex = Math.floor(elapsed / beatLength);

      if (beatIndex !== lastBeat) {
        lastBeat = beatIndex;
        const beatsPerBar = drill.timeSig.beatsPerBar;
        playClick(beatIndex % beatsPerBar === 0);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isRunning, beatLength, playClick, drill.timeSig.beatsPerBar]);

  /* ---------------------------------- */
  /* --------------- START ------------ */
  /* ---------------------------------- */

  const start = useCallback(() => {
    offsetsStatsRef.current = createStats();
    recentOffsetsMsRef.current = [];
    tapEventsRef.current = [];
completedRef.current = false;
    hit300Ref.current = 0;
    hit100Ref.current = 0;
    hit50Ref.current = 0;
    missRef.current = 0;
	
    const now = performance.now();
    const countInBeats = drill.timeSig.beatsPerBar;

    metronomeStartRef.current = now;
    sessionStartRef.current =
      now + beatLength * countInBeats;

    const barLength =
      beatLength * drill.timeSig.beatsPerBar;

    sessionEndRef.current =
      sessionStartRef.current +
      barLength * drill.durationBars;

    upcomingNotesRef.current = buildPatternTimes(
      drill,
      sessionStartRef.current
    );

    setIsRunning(true);
  }, [beatLength, drill]);

  /* ---------------------------------- */
  /* --------------- STOP ------------- */
  /* ---------------------------------- */

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  /* ---------------------------------- */
  /* ------------ REGISTER HIT -------- */
  /* ---------------------------------- */

  const registerHit = useCallback(
    (
      offset: number,
      grade: 300 | 100 | 50,
      side: "left" | "right"
    ) => {
      lastOffsetRef.current = offset;

      const now = performance.now();

      // 🔥 Store full tap event
      tapEventsRef.current.push({
        offset,
        side,
        timestamp: now,
        index: tapEventsRef.current.length,
      });

      const beatIndex = Math.floor(
        (now - sessionStartRef.current) /
          beatLength
      );

      const isDownbeat =
        beatIndex % drill.timeSig.beatsPerBar === 0;

      if (isDownbeat) {
        playAccentHit();
      } else {
        playHitSound();
      }

      pushStat(offsetsStatsRef.current, offset);

      alignmentStdDevRef.current = stdDev(
        offsetsStatsRef.current
      );
      meanOffsetRef.current =
        offsetsStatsRef.current.mean;
      unstableRateRef.current =
        alignmentStdDevRef.current * 10;

      recentOffsetsMsRef.current.push(offset);
      if (recentOffsetsMsRef.current.length > 200) {
        recentOffsetsMsRef.current.shift();
      }

      if (grade === 300) hit300Ref.current++;
      if (grade === 100) hit100Ref.current++;
      if (grade === 50) hit50Ref.current++;
    },
    [beatLength, drill.timeSig.beatsPerBar]
  );

  /* ---------------------------------- */
  /* ------------ REGISTER MISS ------- */
  /* ---------------------------------- */

  const registerMiss = useCallback(() => {
    missRef.current++;
  }, []);

  /* ---------------------------------- */
  /* ----------- GRADE OFFSET --------- */
  /* ---------------------------------- */

  const gradeOffset = useCallback(
    (offset: number) => getGrade(offset, hitWindows),
    [hitWindows]
  );

  /* ---------------------------------- */
  /* -------------- RETURN ------------ */
  /* ---------------------------------- */

  return {
    isRunning,
    msPerGrid,
    upcomingNotesRef,
    hitWindows,
    getGrade: gradeOffset,
    start,
    stop,
    registerHit,
    registerMiss,
    live: {
      lastOffsetRef,
      alignmentStdDevRef,
      meanOffsetRef,
      unstableRateRef,
      recentOffsetsMsRef,
      hit300Ref,
      hit100Ref,
      hit50Ref,
      missRef,
      sessionStartRef,
      sessionEndRef,
      tapEventsRef,
	  completedRef,
    },
  };
}

export type TapEngine = ReturnType<typeof useTapEngine>;