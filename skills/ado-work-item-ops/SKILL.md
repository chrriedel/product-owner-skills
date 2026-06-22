---
name: ado-work-item-ops
description: 'Safe, shared procedure for reading and updating Azure DevOps work items via the ado-remote-mcp server. Enforces read → diff → approval → write so no item is mutated without explicit confirmation. Use for any backlog fetch, query, field update, hierarchy re-parent, tagging, or state change. Triggers on: read work item, fetch backlog, WIQL query, update work item, change field, re-parent, set iteration, tag work item, bulk update, write to ADO, Azure DevOps update.'
argument-hint: 'Provide work item IDs or a query scope (area path / iteration), and what you want to read or change.'
---

# Azure DevOps Work Item Operations

Single source of truth for how every Product Owner agent reads from and writes to Azure DevOps. It centralizes the safety pattern so agents do not each restate it.

## When to Use

- Fetching a single work item or a backlog slice for analysis.
- Running a WIQL query to find orphans, stale, oversized, or completed items.
- Any update: field edit, acceptance criteria, re-parent, iteration/area, tags, state.
- Bulk triage actions across a query result.

## Connection

Use the **ado-remote-mcp** MCP server (configured in `.vscode/mcp.json`). If the server is not connected or returns an auth error, stop and tell the user to sign in to the MCP server — do not guess IDs or fabricate data.

## The Safety Pattern (mandatory)

Every operation follows this order. Never skip a step.

1. **Read first.** Fetch the current state of the target item(s). For a scope, run a WIQL query (see [wiql-queries.md](./references/wiql-queries.md)) and list what matched.
2. **Confirm scope** if ambiguous. If the user gave a vague scope, show the matched items and confirm before proceeding.
3. **Propose a diff.** For any write, present a concise field-level **before → after** table. One row per changed field per item.
4. **Get explicit approval.** Wait for the user to confirm. Treat silence or an unrelated reply as "not approved."
5. **Write.** Apply only the approved changes.
6. **Report.** State exactly which fields changed on which items, and link to each item.

## Diff Format

```
### Proposed changes — Work Item <ID>: <title>
| Field | Before | After |
|-------|--------|-------|
| <field> | <current> | <proposed> |

Confirm to apply? (yes / adjust / cancel)
```

## Read Output Format

```
## Work Items — <scope>
| ID | Type | Title | State | Parent | Iteration | Tags |
|----|------|-------|-------|--------|-----------|------|
```

## Reusable Queries

Common WIQL templates (backlog slice, orphans, stale, oversized, ready-for-sprint, completed-in-iteration) live in [wiql-queries.md](./references/wiql-queries.md). Adapt the project/area/iteration tokens before running.

## Hard Rules

- DO NOT mutate any work item without an approved diff.
- DO NOT bypass the read step, even for "obvious" changes.
- DO NOT invent work item IDs, field values, or query results.
- Preserve area path, iteration, and tagging conventions defined in the Product Owner instructions.
- For bulk writes, show the diff for every item (or a representative sample plus full count) before applying.
