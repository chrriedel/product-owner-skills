# Reusable WIQL Queries

Adapt the tokens before running:

- `@project` — leave as-is to scope to the current project, or replace with `'Project Name'`.
- `<AREA PATH>` — e.g. `Project\\Team\\Area`.
- `<CUSTOMER>\<ENGAGEMENT>` — engagement area path under the customer project, e.g. `CompanyName\\ProductName`. The project is the customer; each engagement/product is a top-level area.
- `<ITERATION PATH>` — e.g. `Project\\Sprint 42`.
- `<DAYS>` — staleness threshold in days.

All queries return work item references; fetch full fields per the read step in the skill.

## Engagement backlog (customer project, one engagement area)

```sql
SELECT [System.Id], [System.WorkItemType], [System.Title], [System.State],
       [System.IterationPath], [System.Tags]
FROM WorkItems
WHERE [System.TeamProject] = @project
  AND [System.AreaPath] UNDER '<CUSTOMER>\<ENGAGEMENT>'
  AND [System.WorkItemType] IN ('Epic', 'Feature', 'User Story', 'Bug')
  AND [System.State] NOT IN ('Closed', 'Removed', 'Done')
ORDER BY [Microsoft.VSTS.Common.BacklogPriority] ASC
```

To roll up **all** engagements for a customer, drop the `AreaPath` clause (the project root already scopes to the customer).

## Backlog slice by area path

```sql
SELECT [System.Id], [System.WorkItemType], [System.Title], [System.State],
       [System.IterationPath], [System.Tags]
FROM WorkItems
WHERE [System.TeamProject] = @project
  AND [System.AreaPath] UNDER '<AREA PATH>'
  AND [System.WorkItemType] IN ('Epic', 'Feature', 'User Story', 'Bug')
  AND [System.State] NOT IN ('Closed', 'Removed', 'Done')
ORDER BY [Microsoft.VSTS.Common.BacklogPriority] ASC
```

## Backlog slice by iteration

```sql
SELECT [System.Id], [System.WorkItemType], [System.Title], [System.State]
FROM WorkItems
WHERE [System.TeamProject] = @project
  AND [System.IterationPath] = '<ITERATION PATH>'
ORDER BY [System.WorkItemType] ASC
```

## Orphaned stories (no parent link)

Run this, then in the read step filter to items with no parent relation (WIQL flat queries return all; check the parent field after fetch). For a tree query:

```sql
SELECT [System.Id], [System.WorkItemType], [System.Title]
FROM WorkItemLinks
WHERE [Source].[System.TeamProject] = @project
  AND [Source].[System.WorkItemType] = 'User Story'
  AND [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Reverse'
MODE (DoesNotContain)
```

## Stale items (untouched for N days)

```sql
SELECT [System.Id], [System.WorkItemType], [System.Title], [System.ChangedDate]
FROM WorkItems
WHERE [System.TeamProject] = @project
  AND [System.State] NOT IN ('Closed', 'Removed', 'Done')
  AND [System.ChangedDate] < @today - <DAYS>
ORDER BY [System.ChangedDate] ASC
```

## Oversized items (story-point heavy)

```sql
SELECT [System.Id], [System.Title], [Microsoft.VSTS.Scheduling.StoryPoints]
FROM WorkItems
WHERE [System.TeamProject] = @project
  AND [System.WorkItemType] = 'User Story'
  AND [Microsoft.VSTS.Scheduling.StoryPoints] >= 13
ORDER BY [Microsoft.VSTS.Scheduling.StoryPoints] DESC
```

## Ready-for-sprint candidates

```sql
SELECT [System.Id], [System.Title], [System.State], [Microsoft.VSTS.Scheduling.StoryPoints]
FROM WorkItems
WHERE [System.TeamProject] = @project
  AND [System.WorkItemType] = 'User Story'
  AND [System.State] = 'New'
  AND [Microsoft.VSTS.Scheduling.StoryPoints] <> ''
  AND [Microsoft.VSTS.Common.AcceptanceCriteria] <> ''
ORDER BY [Microsoft.VSTS.Common.BacklogPriority] ASC
```

## Completed in iteration (for release notes)

```sql
SELECT [System.Id], [System.WorkItemType], [System.Title], [System.Tags]
FROM WorkItems
WHERE [System.TeamProject] = @project
  AND [System.IterationPath] = '<ITERATION PATH>'
  AND [System.State] IN ('Closed', 'Done', 'Resolved')
ORDER BY [System.WorkItemType] ASC
```
