---
name: backlog-prioritization
description: 'Deterministically score and rank Azure DevOps backlog items using WSJF, RICE, MoSCoW, Kano, or value-vs-effort. Use when you need a reproducible priority order with transparent math and rationale. Triggers on: prioritize backlog, rank work items, WSJF, RICE, MoSCoW, Kano, value vs effort, score backlog, priority order, backlog grooming math.'
argument-hint: 'Provide the items (IDs + factor inputs) and the framework (WSJF/RICE/MoSCoW/Kano/value-effort).'
---

# Backlog Prioritization

Produce a reproducible, defensible ranking of backlog items. Use the bundled script for the arithmetic so scores are consistent (LLM mental math drifts), then explain the rationale.

## When to Use

- Ranking a set of work items against each other (not judging a single story).
- Any request naming WSJF, RICE, MoSCoW, Kano, or value-vs-effort.
- Sprint/quarter planning where a transparent, repeatable order is needed.

## When NOT to Use

- Single-story quality review → use the **User Story Reviewer** agent.
- Open-ended roadmap/strategy framing → use the **Discovery & Strategy** agent.

## Inputs Required Per Framework

| Framework | Required factors per item |
|-----------|---------------------------|
| **WSJF** | userBusinessValue, timeCriticality, riskReductionOpportunity, jobSize (all 1–10 or Fibonacci) |
| **RICE** | reach, impact (0.25/0.5/1/2/3), confidence (0–1), effort (person-time) |
| **MoSCoW** | bucket (must/should/could/wont) + optional tiebreaker value |
| **Kano** | category (basic/performance/delight/indifferent) + satisfaction, dissatisfaction |
| **value-effort** | value (1–10), effort (1–10) |

If the user has work item IDs but no factor inputs, fetch context via the **ado-work-item-ops** skill first, then ask for or infer the missing factors (and mark inferred values as assumptions).

## Procedure

1. **Gather inputs.** Collect items with their factor values. If pulling from Azure DevOps, use the **ado-work-item-ops** skill to read the items first.
2. **Pick the framework** that fits the request and state why (one line). Default to WSJF for flow economics, RICE for growth trade-offs, value-vs-effort for quick triage.
3. **Compute scores deterministically** by running [score.mjs](./scripts/score.mjs) with a JSON payload. Do not do the arithmetic yourself.
4. **Rank** descending by score (WSJF/RICE/value-effort) or by bucket order (MoSCoW/Kano).
5. **Explain rationale** per item: which factors drove its position and any ties broken.
6. **Surface constraints** — dependencies, risk, or sequencing that should override the raw score.

## Running the Script

The script reads a JSON payload from stdin and prints a ranked table plus per-item scores.

```
echo '{ "framework": "wsjf", "items": [ ... ] }' | node ./scripts/score.mjs
```

See [score.mjs](./scripts/score.mjs) for the exact payload shape per framework (documented at the top of the file) and the scoring formulas.

## Formulas (reference)

- **WSJF** = (userBusinessValue + timeCriticality + riskReductionOpportunity) / jobSize
- **RICE** = (reach × impact × confidence) / effort
- **value-effort** ratio = value / effort (higher is better)
- **MoSCoW** order = Must > Should > Could > Won't (tiebreaker value descending)
- **Kano** order = Basic > Performance > Delight > Indifferent

## Output Format

```
## Prioritization — <framework> (why this framework)
Scope: <IDs / query / iteration>

| Rank | ID | Title | Score | Key drivers |
|------|----|-------|-------|-------------|

### Rationale
- <item>: <what drove its rank, ties broken>

### Constraints that override raw score
- <dependency / risk / sequencing note>

### Recommended order
1. <final actionable order>
```

## Writing Back to Azure DevOps

If the user wants the priority order persisted (e.g. stack rank, tags, iteration), hand off to the **ado-work-item-ops** skill, which enforces read → diff → approval → write. Never write without explicit approval.
