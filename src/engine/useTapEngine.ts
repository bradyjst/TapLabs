import { useCallback, useRef, useState, useEffect } from "react";
import { getHitWindows, getGrade } from "./timingConfig";
import type { HitWindows } from "./timingConfig";

type Config = {
  bpm: number;
  burstCount: number;
  gapBeats: number;
  od: number;
  snapDivisor: 2 | 3 | 4 | 6 | 8;
};

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

export function useTapEngine({
  bpm,
  burstCount,
  gapBeats,
  od,
  snapDivisor,
}: Config) {
  const [isRunning, setIsRunning] = useState(false);

  const sessionStartRef = useRef<number>(0);
  const metronomeStartRef = useRef<number>(0);
  const upcomingNotesRef = useRef<number[]>([]);

  const offsetsStatsRef = useRef<RunningStats>(createStats());
  const lastOffsetRef = useRef<number | null>(null);
  const recentOffsetsMsRef = useRef<number[]>([]);

  const alignmentStdDevRef = useRef<number>(0);
  const meanOffsetRef = useRef<number>(0);
  const unstableRateRef = useRef<number>(0);

  const hit300Ref = useRef(0);
  const hit100Ref = useRef(0);
  const hit50Ref = useRef(0);
  const missRef = useRef(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const beatLength = 60000 / bpm;
  const interval = beatLength / snapDivisor;

  // 🔥 This replaces subdivision grid
  const msPerGrid = interval;

  const hitWindows: HitWindows = getHitWindows(od);

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const playClick = useCallback((downbeat: boolean) => {
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = downbeat ? 1200 : 800;
    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  }, []);

  const playHitSound = useCallback((grade: 300 | 100 | 50) => {
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (grade === 300) osc.frequency.value = 1400;
    if (grade === 100) osc.frequency.value = 1000;
    if (grade === 50) osc.frequency.value = 700;

    gain.gain.value = 0.12;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }, []);

  // Metronome
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
        playClick(beatIndex % 4 === 0);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isRunning, beatLength, playClick]);

  const start = useCallback(() => {
    offsetsStatsRef.current = createStats();
    recentOffsetsMsRef.current = [];

    hit300Ref.current = 0;
    hit100Ref.current = 0;
    hit50Ref.current = 0;
    missRef.current = 0;

    const now = performance.now();
    const countInBeats = 4;

    metronomeStartRef.current = now;
    sessionStartRef.current = now + beatLength * countInBeats;

    let timeCursor = sessionStartRef.current;
    const pattern: number[] = [];

    for (let i = 0; i < 30; i++) {
      for (let n = 0; n < burstCount; n++) {
        pattern.push(timeCursor + n * interval);
      }

      timeCursor += beatLength * gapBeats;
    }

    upcomingNotesRef.current = pattern;
    setIsRunning(true);
  }, [beatLength, burstCount, gapBeats, interval]);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const registerHit = useCallback(
    (offset: number, grade: 300 | 100 | 50) => {
      lastOffsetRef.current = offset;
      playHitSound(grade);

      pushStat(offsetsStatsRef.current, offset);

      alignmentStdDevRef.current = stdDev(offsetsStatsRef.current);
      meanOffsetRef.current = offsetsStatsRef.current.mean;
      unstableRateRef.current = alignmentStdDevRef.current * 10;

      recentOffsetsMsRef.current.push(offset);
      if (recentOffsetsMsRef.current.length > 200) {
        recentOffsetsMsRef.current.shift();
      }

      if (grade === 300) hit300Ref.current++;
      if (grade === 100) hit100Ref.current++;
      if (grade === 50) hit50Ref.current++;
    },
    [playHitSound]
  );

  const registerMiss = useCallback(() => {
    missRef.current++;
  }, []);

  const gradeOffset = useCallback(
    (offset: number) => getGrade(offset, hitWindows),
    [hitWindows]
  );

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
    },
  };
}
