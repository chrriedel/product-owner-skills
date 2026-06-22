---
name: product-owner-standards
description: Shared Product Owner team standards — outcome focus, backlog quality baseline, prioritization framework selection, hierarchy/traceability rules, the area-path backlog structure convention, sprint/release discipline, communication outputs, and Azure DevOps safety. Load this for any Product Owner, backlog, story-writing, prioritization, or release task to keep all PO agents consistent. Triggers on: product owner standards, backlog quality, definition of ready, definition of done, INVEST, traceability, area path convention, prioritization framework, sprint discipline, release readiness.
argument-hint: Reference these standards when reviewing, writing, prioritizing, or releasing backlog items.
---

# Product Owner Team Standards

Use this guidance for all Product Owner-related agents in this repository.

## Product Outcome Focus

- Start from business outcome: objective, KPI/OKR, target date, and confidence.
- Keep traceability explicit: every story maps to a feature/epic and objective.
- Prefer incremental value delivery over large-batch scope.

## Backlog Quality Baseline

For all backlog items (epic, feature, story, task), enforce:

- **Clarity:** unambiguous intent, scope, and boundaries.
- **Value:** explicit user/business benefit.
- **Testability:** measurable acceptance criteria.
- **Readiness:** assumptions, dependencies, and risks called out.
- **Size:** item is appropriately split for its level.

For stories specifically, apply INVEST plus Definition of Ready.

## Prioritization Frameworks

Pick the framework that best fits the request and explain the choice briefly:

- **WSJF** for flow/lean economics.
- **RICE** for growth/product trade-offs.
- **MoSCoW** for release scoping.
- **Kano** for satisfaction/expectation mapping.
- **Value vs Effort** for quick triage.

Always show ranking rationale, not only the final order. For reproducible math, use the
`backlog-prioritization` skill rather than computing scores by hand.

## Hierarchy and Traceability Rules

- Maintain parent/child integrity: Epic -> Feature -> Story -> Task.
- Flag orphaned items and propose parent linkage.
- Flag duplicates, stale items, and oversized items; recommend action.
- Preserve area path, iteration, and tagging conventions when updating ADO.

## Backlog Structure Convention

This organization uses **one ADO project per customer**, with each engagement/product modeled as an **Area Path** under that project.

- Project = customer (e.g. `CompanyName`).
- Top-level area = engagement/product (e.g. `CompanyName\ProductA`, `CompanyName\ProductB`, `CompanyName\ProductC`).
- Optional second-level area = internal stream (e.g. `CompanyName\ProductA\Mobile`). Keep depth shallow and decide it early; deep trees are costly to refactor.
- An **engagement is an area path, never an Epic.** Within an engagement, keep the standard Epic -> Feature -> Story -> Task hierarchy so area-based roll-ups stay intact.
- Scope an engagement backlog with `[System.AreaPath] UNDER 'Customer\Engagement'`; query the project root to roll up all engagements for a customer.
- Area path expresses **whose** backlog (which engagement), not status or priority. Use States for status and the prioritization field (stack rank / WSJF) for ordering.
- Use **tags**, not extra area nesting, for cross-cutting concerns (e.g. `security`, `tech-debt`) to avoid combinatorial area explosion.
- Decide iteration scope per engagement: shared cadence = one project-level iteration tree; independent cadence = per-engagement iteration subtree (`Customer\Engagement\Sprint N`).

## Sprint and Release Discipline

- Enforce both **Definition of Ready** and **Definition of Done**.
- During sprint planning, evaluate capacity fit, dependencies, and spillover risk.
- During release planning, surface sequencing risks and cross-team dependencies.

## Communication Outputs

When requested, provide:

- Sprint goal and scope summary.
- Stakeholder status roll-up (what changed, risk, next decision).
- Release notes in business language ("what shipped and why").

## Azure DevOps Safety Rules

- Read/list first, then propose edits.
- Never mutate work items without explicit user approval.
- Before write operations, show concise before/after field diffs.
- After writes, report updated fields and item links/IDs.
- For all work item reads and writes, follow the `ado-work-item-ops` skill.
