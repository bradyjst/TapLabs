import type { TapEvent } from "../engine/useTapEngine";

/* ---------------------------------- */
/* ---------- RUNNING STATS --------- */
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
/* ----------- ANALYTICS TYPE ------- */
/* ---------------------------------- */

export type SessionAnalytics = {
  totalTaps: number;

  meanOffset: number;
  stdDev: number;
  unstableRate: number;

  earlyPercent: number;
  latePercent: number;

  leftMean: number;
  rightMean: number;
  leftStdDev: number;
  rightStdDev: number;

  imbalancePercent: number;

  histogram: Record<string, number>;

  driftCurve: { segment: number; mean: number }[];
  fatigueCurve: { segment: number; stdDev: number }[];

  gallopingRisk: number; // 0–100
  consistencyScore: number; // 0–100
};

/* ---------------------------------- */
/* ------------ HISTOGRAM ----------- */
/* ---------------------------------- */

function buildHistogram(taps: TapEvent[]) {
  const binSize = 5;
  const hist: Record<string, number> = {};

  for (const tap of taps) {
    const bucket =
      Math.round(tap.offset / binSize) * binSize;
    const key = bucket.toString();
    hist[key] = (hist[key] || 0) + 1;
  }

  return hist;
}

/* ---------------------------------- */
/* ---------- SEGMENT SPLIT --------- */
/* ---------------------------------- */

function segmentTaps(taps: TapEvent[], segments: number) {
  const result = [];
  const size = Math.floor(taps.length / segments);

  for (let i = 0; i < segments; i++) {
    const start = i * size;
    const end = i === segments - 1 ? taps.length : (i + 1) * size;

    const slice = taps.slice(start, end);
    if (slice.length === 0) continue;

    const stats = createStats();
    for (const tap of slice) {
      pushStat(stats, tap.offset);
    }

    result.push({
      segment: i,
      mean: stats.mean,
      stdDev: stdDev(stats),
    });
  }

  return result;
}

/* ---------------------------------- */
/* --------- GALLOPING SCORE -------- */
/* ---------------------------------- */

function computeGallopingRisk(taps: TapEvent[]) {
  if (taps.length < 30) return 0;

  // ---------- 1️⃣ Mean Bias Between Fingers ----------
  const left = taps.filter(t => t.side === "left").map(t => t.offset);
  const right = taps.filter(t => t.side === "right").map(t => t.offset);

  if (left.length < 5 || right.length < 5) return 0;

  const leftMean = left.reduce((a, b) => a + b, 0) / left.length;
  const rightMean = right.reduce((a, b) => a + b, 0) / right.length;

  const meanBias = Math.abs(leftMean - rightMean); // ms difference

  // Normalize bias (tune 12–18 depending on feel)
  const biasScore = Math.min(1, meanBias / 15);


  // ---------- 2️⃣ Interval Alternation Detection ----------
  const intervals: number[] = [];
  for (let i = 1; i < taps.length; i++) {
    intervals.push(taps[i].timestamp - taps[i - 1].timestamp);
  }

  let alternatingStrength = 0;
  let count = 0;

  for (let i = 2; i < intervals.length; i++) {
    const a = intervals[i - 2];
    const b = intervals[i - 1];
    const c = intervals[i];

    const diff1 = Math.abs(a - b);
    const diff2 = Math.abs(b - c);

    // If pattern is a-b-a style, diff1 and diff2 both large
    if (diff1 > 3 && diff2 > 3) {
      alternatingStrength += 1;
    }

    count++;
  }

  const intervalScore = count > 0 ? alternatingStrength / count : 0;


  // ---------- 3️⃣ Combine ----------
  const combined = (biasScore * 0.6) + (intervalScore * 0.4);

  // ---------- 4️⃣ Confidence Scaling ----------
  const confidence = Math.min(1, taps.length / 200);
  const finalRisk = Math.round(Math.min(100, combined * confidence * 100));

console.log("Gallop Debug:", {
  tapCount: taps.length,
  leftMean,
  rightMean,
  meanBias,
  biasScore,
  intervalScore,
  confidence,
  finalRisk,
});

return finalRisk;

}

/* ---------------------------------- */
/* ------ CONSISTENCY SCORE --------- */
/* ---------------------------------- */

function computeConsistency(fatigueCurve: { stdDev: number }[]) {
  if (fatigueCurve.length < 2) return 100;

  const stats = createStats();
  for (const seg of fatigueCurve) {
    pushStat(stats, seg.stdDev);
  }

  const variation = stdDev(stats);
  const score = Math.max(0, 100 - variation * 5);
  return Math.min(100, score);
}

/* ---------------------------------- */
/* -------- MAIN ANALYZER ----------- */
/* ---------------------------------- */

export function analyzeSession(
  taps: TapEvent[]
): SessionAnalytics | null {
  if (taps.length === 0) return null;

  const overall = createStats();
  const left = createStats();
  const right = createStats();

  let early = 0;
  let late = 0;

  for (const tap of taps) {
    pushStat(overall, tap.offset);

    if (tap.side === "left") pushStat(left, tap.offset);
    if (tap.side === "right") pushStat(right, tap.offset);

    if (tap.offset < 0) early++;
    if (tap.offset > 0) late++;
  }

  const total = taps.length;

  const driftData = segmentTaps(taps, 10);

  const fatigueData = driftData.map((seg) => ({
    segment: seg.segment,
    stdDev: seg.stdDev,
  }));

  const leftStd = stdDev(left);
  const rightStd = stdDev(right);

  const imbalance =
    Math.abs(left.mean - right.mean) +
    Math.abs(leftStd - rightStd);

  return {
    totalTaps: total,

    meanOffset: overall.mean,
    stdDev: stdDev(overall),
    unstableRate: stdDev(overall) * 10,

    earlyPercent: early / total,
    latePercent: late / total,

    leftMean: left.mean,
    rightMean: right.mean,
    leftStdDev: leftStd,
    rightStdDev: rightStd,

    imbalancePercent: Math.min(100, imbalance),

    histogram: buildHistogram(taps),

    driftCurve: driftData.map((seg) => ({
      segment: seg.segment,
      mean: seg.mean,
    })),

    fatigueCurve: fatigueData,

    gallopingRisk: computeGallopingRisk(taps),

    consistencyScore: computeConsistency(fatigueData),
  };
}