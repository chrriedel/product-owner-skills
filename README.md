# Product Owner Skills — GitHub Copilot agents for Azure DevOps

A GitHub Copilot Chat plugin that gives Copilot a **Product Owner team** for Azure
DevOps: verify, review, write, and prioritize user stories and backlogs — with
reproducible scoring math and a safe read → diff → approval → write pattern for
every work-item change.

Skills load automatically when relevant, or you can invoke one manually with
`/skill-name`. Agents are selected from the chat agent picker.

## Agents

| Agent | Purpose |
| --- | --- |
| **Product Owner** | Orchestrator — routes work to the specialists and returns one coherent outcome |
| **User Story Reviewer** | Verify/score (INVEST, Definition of Ready), review/improve (Gherkin), and write stories |
| **Backlog Manager** | Prioritization, triage, dedupe, hierarchy hygiene, readiness across many items |
| **Discovery & Strategy** | Vision/OKRs, personas, opportunities, epic/feature framing before story writing |
| **Release & Comms** | Sprint goals, release planning, dependency/risk maps, release notes, stakeholder updates |

## Skills

| Skill | Purpose |
| --- | --- |
| **product-owner-standards** | Shared PO standards: outcome focus, backlog quality, prioritization, traceability, the area-path backlog convention, sprint/release discipline, ADO safety |
| **backlog-prioritization** | Deterministic WSJF / RICE / MoSCoW / Kano / value-vs-effort scoring with transparent math (runs `scripts/score.mjs`) |
| **ado-work-item-ops** | Safe shared procedure for reading and updating work items (read → diff → approval → write) plus reusable WIQL queries |

## Installation

### Manual installation

Add the plugin location to your VS Code **User Settings** (`settings.json`):

```jsonc
"chat.pluginLocations": {
  "your-org/product-owner-skills": true
}
```

Or, if you've cloned the repo locally, use a `file:///` path instead:

```jsonc
"chat.pluginLocations": {
  "file:///C:/git/product-owner-skills": true
}
```

No files are copied — VS Code reads the agents and skills directly from the source,
so the plugin is available in **every** workspace.

## Prerequisites

- [VS Code](https://code.visualstudio.com/) with GitHub Copilot Chat.
- **Node.js** — required by the `backlog-prioritization` skill, which shells out to
  `node ./scripts/score.mjs` for reproducible scoring.
- An **Azure DevOps MCP server** named `ado-remote-mcp`, configured in your workspace
  (`.vscode/mcp.json`), for live work-item access. The skills reference the
  `ado-remote-mcp` server by name; if you use a different name, update the references
  in `skills/ado-work-item-ops/SKILL.md` accordingly.

## Repository structure

```text
.claude-plugin/        Plugin + marketplace manifests
agents/                *.agent.md — orchestrator and specialist agents
skills/                <name>/SKILL.md with bundled scripts/ and references/
```

## License

MIT — see [LICENSE](LICENSE).
