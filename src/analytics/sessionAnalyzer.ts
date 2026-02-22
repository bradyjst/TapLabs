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
  // Need enough taps from both sides
  if (taps.length < 20) return 0;

  let n = 0;
  let sumX = 0;   // side sign
  let sumY = 0;   // offset
  let sumXX = 0;
  let sumYY = 0;
  let sumXY = 0;

  let leftCount = 0;
  let rightCount = 0;

  for (const t of taps) {
    const x = t.side === "left" ? 1 : -1;
    const y = t.offset;

    if (t.side === "left") leftCount++;
    else rightCount++;

    n++;
    sumX += x;
    sumY += y;
    sumXX += x * x;
    sumYY += y * y;
    sumXY += x * y;
  }

  // If one side barely used, don’t call it galloping
  if (leftCount < 5 || rightCount < 5) return 0;

  const denom = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  if (denom === 0) return 0;

  const r = (n * sumXY - sumX * sumY) / denom; // -1..1

  // |r| near 1 => strong L/R bias (gallop)
  const strength = Math.min(1, Math.abs(r));

  // Optional: require actual alternation to matter
  let alternations = 0;
  for (let i = 1; i < taps.length; i++) {
    if (taps[i].side !== taps[i - 1].side) alternations++;
  }
  const altRate = alternations / (taps.length - 1); // 0..1

  // Map to 0..100 with a soft threshold so small bias doesn't punish
  const threshold = 0.25; // tune: 0.2–0.35 feels good
  const gated = Math.max(0, (strength - threshold) / (1 - threshold));

  const risk = gated * altRate * 100;
  return Math.round(Math.min(100, risk));

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