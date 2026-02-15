import { useCallback, useRef, useState, useEffect } from "react";

type Config = {
  bpm: number;
  subdivision: number; // 1=quarter, 2=8th, 4=16th, etc
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

export function useTapEngine(config: Config) {
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef<number>(0);

  const offsetsStatsRef = useRef<RunningStats>(createStats());
  const intervalStatsRef = useRef<RunningStats>(createStats());

  const tapCountRef = useRef<number>(0);
  const lastOffsetRef = useRef<number | null>(null);
  const recentOffsetsMsRef = useRef<number[]>([]);
  const alignmentStdDevRef = useRef<number>(0);
  const intervalStdDevRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number>(0);

  const beatPhaseRef = useRef<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const msPerBeat = 60000 / config.bpm;
  const msPerGrid = msPerBeat / config.subdivision;

  const playClick = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = 1000;
    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  };

  // RAF Loop (beat tracking + metronome)
  useEffect(() => {
    if (!isRunning) return;

    let rafId: number;
    let lastBeatIndex = -1;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startTimeRef.current;

      const gridIndex = Math.floor(elapsed / msPerGrid);

      if (gridIndex !== lastBeatIndex) {
        lastBeatIndex = gridIndex;
        playClick();
      }

      const phase = (elapsed % msPerGrid) / msPerGrid;
      beatPhaseRef.current = phase;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isRunning, msPerGrid]);

  const start = useCallback(() => {
    offsetsStatsRef.current = createStats();
    intervalStatsRef.current = createStats();
    tapCountRef.current = 0;
    lastOffsetRef.current = null;
    alignmentStdDevRef.current = 0;
    intervalStdDevRef.current = 0;
    lastTapTimeRef.current = null;
    recentOffsetsMsRef.current = [];

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    sessionStartRef.current = performance.now();


    startTimeRef.current = performance.now();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const registerTap = useCallback(() => {
    if (!isRunning) return;

    const now = performance.now();
    const elapsed = now - startTimeRef.current;

    const gridIndex = Math.round(elapsed / msPerGrid);
    const idealTime = startTimeRef.current + gridIndex * msPerGrid;
    const offset = now - idealTime;

    lastOffsetRef.current = offset;

    pushStat(offsetsStatsRef.current, offset);
    alignmentStdDevRef.current = stdDev(offsetsStatsRef.current);
    tapCountRef.current += 1;

    recentOffsetsMsRef.current.push(offset);
    if (recentOffsetsMsRef.current.length > 120) {
      recentOffsetsMsRef.current.shift();
    }

    if (lastTapTimeRef.current != null) {
      const interval = now - lastTapTimeRef.current;
      pushStat(intervalStatsRef.current, interval);
      intervalStdDevRef.current = stdDev(intervalStatsRef.current);
    }

    lastTapTimeRef.current = now;
  }, [isRunning, msPerGrid]);

  return {
    isRunning,
    msPerBeat,
    msPerGrid,
    start,
    stop,
    registerTap,
    live: {
      lastOffsetRef,
      alignmentStdDevRef,
      tapCountRef,
      intervalStdDevRef,
      recentOffsetsMsRef,
      beatPhaseRef,
      sessionStartRef
    },
  };
}
