#!/usr/bin/env node
// Deterministic backlog prioritization scorer.
//
// Usage:
//   echo '<json>' | node score.mjs
//
// Payload shapes by framework:
//
// WSJF:
//   { "framework": "wsjf", "items": [
//     { "id": "123", "title": "...", "userBusinessValue": 8, "timeCriticality": 5,
//       "riskReductionOpportunity": 3, "jobSize": 5 } ] }
//
// RICE:
//   { "framework": "rice", "items": [
//     { "id": "123", "title": "...", "reach": 500, "impact": 2, "confidence": 0.8, "effort": 4 } ] }
//
// value-effort:
//   { "framework": "value-effort", "items": [
//     { "id": "123", "title": "...", "value": 8, "effort": 3 } ] }
//
// MoSCoW:
//   { "framework": "moscow", "items": [
//     { "id": "123", "title": "...", "bucket": "must", "tiebreaker": 5 } ] }
//
// Kano:
//   { "framework": "kano", "items": [
//     { "id": "123", "title": "...", "category": "performance", "satisfaction": 7, "dissatisfaction": 4 } ] }

const BUCKET_ORDER = { must: 0, should: 1, could: 2, wont: 3 };
const KANO_ORDER = { basic: 0, performance: 1, delight: 2, indifferent: 3 };

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function num(v, name, id) {
  const n = Number(v);
  if (!Number.isFinite(n)) {
    throw new Error(`Item ${id}: "${name}" must be a finite number, got: ${JSON.stringify(v)}`);
  }
  return n;
}

function scoreWsjf(it) {
  const v = num(it.userBusinessValue, "userBusinessValue", it.id);
  const t = num(it.timeCriticality, "timeCriticality", it.id);
  const r = num(it.riskReductionOpportunity, "riskReductionOpportunity", it.id);
  const size = num(it.jobSize, "jobSize", it.id);
  if (size <= 0) throw new Error(`Item ${it.id}: jobSize must be > 0`);
  const cod = v + t + r;
  return { score: cod / size, drivers: `CoD=${cod} (V${v}+TC${t}+RR${r}), JobSize=${size}` };
}

function scoreRice(it) {
  const reach = num(it.reach, "reach", it.id);
  const impact = num(it.impact, "impact", it.id);
  const confidence = num(it.confidence, "confidence", it.id);
  const effort = num(it.effort, "effort", it.id);
  if (effort <= 0) throw new Error(`Item ${it.id}: effort must be > 0`);
  return {
    score: (reach * impact * confidence) / effort,
    drivers: `Reach=${reach}, Impact=${impact}, Conf=${confidence}, Effort=${effort}`,
  };
}

function scoreValueEffort(it) {
  const value = num(it.value, "value", it.id);
  const effort = num(it.effort, "effort", it.id);
  if (effort <= 0) throw new Error(`Item ${it.id}: effort must be > 0`);
  return { score: value / effort, drivers: `Value=${value}, Effort=${effort}` };
}

function scoreMoscow(it) {
  const bucket = String(it.bucket || "").toLowerCase();
  if (!(bucket in BUCKET_ORDER)) {
    throw new Error(`Item ${it.id}: bucket must be must|should|could|wont, got: ${it.bucket}`);
  }
  const tiebreaker = it.tiebreaker == null ? 0 : num(it.tiebreaker, "tiebreaker", it.id);
  // Lower sortKey ranks higher. Combine bucket order with inverse tiebreaker.
  return {
    score: BUCKET_ORDER[bucket] - tiebreaker / 1000,
    ascending: true,
    drivers: `Bucket=${bucket}, tiebreaker=${tiebreaker}`,
  };
}

function scoreKano(it) {
  const category = String(it.category || "").toLowerCase();
  if (!(category in KANO_ORDER)) {
    throw new Error(`Item ${it.id}: category must be basic|performance|delight|indifferent, got: ${it.category}`);
  }
  const sat = it.satisfaction == null ? 0 : num(it.satisfaction, "satisfaction", it.id);
  const dissat = it.dissatisfaction == null ? 0 : num(it.dissatisfaction, "dissatisfaction", it.id);
  return {
    score: KANO_ORDER[category] - (sat + dissat) / 1000,
    ascending: true,
    drivers: `Category=${category}, sat=${sat}, dissat=${dissat}`,
  };
}

const SCORERS = {
  wsjf: scoreWsjf,
  rice: scoreRice,
  "value-effort": scoreValueEffort,
  moscow: scoreMoscow,
  kano: scoreKano,
};

function round(n) {
  return Math.round(n * 1000) / 1000;
}

async function main() {
  const raw = await readStdin();
  if (!raw.trim()) {
    console.error("No input. Pipe a JSON payload to stdin.");
    process.exit(1);
  }
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    console.error(`Invalid JSON: ${e.message}`);
    process.exit(1);
  }

  const framework = String(payload.framework || "").toLowerCase();
  const scorer = SCORERS[framework];
  if (!scorer) {
    console.error(`Unknown framework "${payload.framework}". Use one of: ${Object.keys(SCORERS).join(", ")}`);
    process.exit(1);
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    console.error("Payload must include a non-empty 'items' array.");
    process.exit(1);
  }

  let ascending = false;
  const scored = payload.items.map((it) => {
    const result = scorer(it);
    if (result.ascending) ascending = true;
    return {
      id: it.id ?? "(no id)",
      title: it.title ?? "",
      score: round(result.score),
      drivers: result.drivers,
    };
  });

  scored.sort((a, b) => (ascending ? a.score - b.score : b.score - a.score));

  const widthId = Math.max(2, ...scored.map((s) => String(s.id).length));
  const widthTitle = Math.max(5, ...scored.map((s) => s.title.length));

  console.log(`Framework: ${framework}`);
  console.log(
    `Rank | ${"ID".padEnd(widthId)} | Score    | ${"Title".padEnd(widthTitle)} | Drivers`
  );
  scored.forEach((s, i) => {
    console.log(
      `${String(i + 1).padStart(4)} | ${String(s.id).padEnd(widthId)} | ${String(s.score).padEnd(8)} | ${s.title.padEnd(widthTitle)} | ${s.drivers}`
    );
  });
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
