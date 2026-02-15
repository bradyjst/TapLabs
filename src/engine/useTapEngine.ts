import { useCallback, useRef, useState, useEffect } from "react";

type Config = {
  bpm: number;
  subdivision: number; // keep for future
  burstCount: number;
  gapBeats: number;
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

function generateBurst(
  bpm: number,
  count: number,
  beatsSpanned: number,
  startTime: number
): number[] {
  const beatLength = 60000 / bpm;
  const totalDuration = beatLength * beatsSpanned;

  if (count <= 1) {
    return [startTime];
  }

  const interval = totalDuration / (count - 1);

  const times: number[] = [];

  for (let i = 0; i < count; i++) {
    times.push(startTime + i * interval);
  }

  return times;
}


function stdDev(stats: RunningStats) {
  if (stats.n < 2) return 0;
  return Math.sqrt(stats.m2 / (stats.n - 1));
}

export function useTapEngine(config: Config) {
  const [isRunning, setIsRunning] = useState(false);

  const sessionStartRef = useRef<number>(0);
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

  // 🔥 Metronome click (still subdivision based)
  useEffect(() => {
    if (!isRunning) return;

    let rafId: number;
    let lastIndex = -1;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - sessionStartRef.current;

      const index = Math.floor(elapsed / msPerGrid);

      if (index !== lastIndex) {
        lastIndex = index;
        playClick();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [isRunning, msPerGrid]);

  const playHitSound = (grade: 300 | 100 | 50) => {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }

  const ctx = audioCtxRef.current;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Slight pitch difference for feedback
  if (grade === 300) osc.frequency.value = 1400;
  if (grade === 100) osc.frequency.value = 1000;
  if (grade === 50) osc.frequency.value = 700;

  gain.gain.value = 0.12;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.02);
};


const start = useCallback(() => {
  offsetsStatsRef.current = createStats();

  lastOffsetRef.current = null;
  alignmentStdDevRef.current = 0;
  meanOffsetRef.current = 0;
  unstableRateRef.current = 0;

  recentOffsetsMsRef.current = [];

  hit300Ref.current = 0;
  hit100Ref.current = 0;
  hit50Ref.current = 0;
  missRef.current = 0;

  const startTime = performance.now();
  sessionStartRef.current = startTime;

  const beatLength = 60000 / config.bpm;

  let timeCursor = startTime;
  const pattern: number[] = [];

  for (let i = 0; i < 30; i++) {
    const burst = generateBurst(
      config.bpm,
      config.burstCount,
      1, // span 1 beat
      timeCursor
    );

    pattern.push(...burst);

    // Move forward by gap
    timeCursor += beatLength * config.gapBeats;
  }

  upcomingNotesRef.current = pattern;

  setIsRunning(true);
}, [config.bpm, config.burstCount, config.gapBeats]);



  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const registerHit = useCallback(
    (offset: number, grade: 300 | 100 | 50) => {
      lastOffsetRef.current = offset;
        playHitSound(grade); // 🔥 add this

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
    []
  );

  const registerMiss = useCallback(() => {
    missRef.current++;
  }, []);

  return {
    isRunning,
    msPerGrid, // still useful for UI if needed
    upcomingNotesRef, // 🔥 expose to canvas
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
