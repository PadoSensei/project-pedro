# Canonical Content Schemas

**Version:** 1
**Locales:** `en`, `pt`
**Status:** Proposed canonical contract

## 1. Shared conventions

All content records must follow these conventions:

| Field | Required | Convention |
|---|---|---|
| `id` | Yes | Stable, unique identifier shared across translations |
| `locale` | Yes | `en` or `pt` |
| `title` | Yes | Localized, non-empty title |
| `summary` | Yes | Localized short description |
| `status` | Yes | `draft`, `published`, or `archived` |
| `category` | Yes | Lowercase kebab-case category |
| `tags` | Yes | Array of lowercase kebab-case strings |
| `createdAt` | Yes | ISO 8601 timestamp |
| `updatedAt` | Yes | ISO 8601 timestamp |

Additional conventions:

- IDs remain identical between English and Portuguese records.
- Document slugs may differ by locale.
- IDs are immutable after publication.
- Timestamps use ISO 8601 with an explicit timezone, preferably UTC.
- New records default to `draft`.
- Only `published` records should appear in normal public-facing content listings.
- Unknown fields should be rejected by validation unless explicitly allowed.
- Content files must never contain credentials, access tokens, or secrets.

## 2. Documents

**Storage:** `content/docs/{locale}/{slug}.json`

Required fields:

- All shared metadata.
- `slug`: locale-specific lowercase kebab-case URL identifier.
- `body`: non-empty Markdown content.

Optional fields:

- `author`: content owner or contributor.
- `relatedIds`: IDs of related content records.
- `readingTimeMinutes`: positive integer.
- `reviewedAt`: ISO 8601 timestamp.
- `reviewedBy`: reviewer identifier.

Documents represent operational guides, platform instructions, SOPs, and fichas.

## 3. Agents

**Storage:** `content/agents/{locale}.json`

Each file contains an array of agent records.

Required fields:

- All shared metadata.
- `purpose`: what the agent is intended to accomplish.
- `capabilities`: array of supported capabilities.
- `inputs`: array of expected inputs.
- `outputs`: array of expected outputs.
- `autonomyLevel`: `manual`, `assisted`, `supervised`, or `autonomous`.
- `riskLevel`: `low`, `medium`, `high`, or `critical`.
- `requiredPermissions`: explicit permission identifiers.
- `prohibitedActions`: actions the agent must not perform.
- `humanApprovalRequired`: boolean.

Optional fields:

- `limitations`: known limitations.
- `integrationRefs`: identifiers of relevant integrations.
- `relatedIds`: related documentation or workflow IDs.

Agent records describe intended behavior and permission boundaries. They do not grant actual system permissions.

## 4. Operational rules

**Storage:** `content/rules/{locale}.json`

Each file contains an array of rule records.

Required fields:

- All shared metadata.
- `scope`: systems, teams, or workflows covered by the rule.
- `severity`: `low`, `medium`, `high`, or `critical`.
- `enforcement`: `must`, `should`, or `may`.
- `rationale`: why the rule exists.

Optional fields:

- `appliesTo`: relevant platform, campaign, or workflow identifiers.
- `exceptions`: documented exceptions.
- `relatedIds`: related rules or documentation.

Rules should be explicit, independently identifiable, and understandable without relying on another rule for their meaning.

## 5. Workflow blueprints

**Storage:** `content/workflows/{locale}.json`

Each file contains an array of workflow records.

Required fields:

- All shared metadata.
- `trigger`: event or condition that starts the workflow.
- `prerequisites`: requirements that must be satisfied before execution.
- `steps`: ordered array of workflow steps.
- `expectedOutputs`: expected final results.
- `riskLevel`: `low`, `medium`, `high`, or `critical`.

Each workflow step requires:

- `id`: unique within the workflow.
- `title`: localized step title.
- `description`: explanation of the step.
- `owner`: `human`, `agent`, or `system`.
- `inputs`: expected inputs.
- `outputs`: expected outputs.
- `requiresApproval`: boolean.

Optional workflow fields:

- `integrationRefs`: referenced integrations.
- `failureHandling`: documented response to a failed step.
- `relatedIds`: related content records.

A workflow blueprint documents a process. It does not execute the process by itself.

## 6. Localization and translation parity

- Every published record should have an English and Portuguese counterpart.
- Counterparts must share the same `id` and content type.
- Localized fields include titles, summaries, descriptions, Markdown bodies, labels, and user-facing instructions.
- Technical identifiers, enum values, permission identifiers, and integration references remain language-independent.
- Document slugs may be translated.
- A missing translation must be reported explicitly; silently substituting another locale is not the default behavior.
- Translation parity checks should compare IDs and required structural fields, not translated text.

## 7. Collection layout

The canonical collection layout is:

```text
content/
  docs/
    en/
    pt/
  agents/
    en.json
    pt.json
  rules/
    en.json
    pt.json
  workflows/
    en.json
    pt.json
```

The workflow collection is a new addition to the existing layout.

## 8. Validation expectations

Future runtime validation must verify:

1. Required fields and field types.
2. Valid locale and enum values.
3. Unique IDs within each content collection.
4. Unique document slugs within each locale.
5. Valid timestamps and non-empty required strings.
6. Valid workflow step IDs and ordering.
7. Translation parity for published records.
8. Valid references between related records.
9. No unexpected fields or embedded secrets.

Validation implementation belongs to the subsequent typed-model and content-validation issues.

## 9. Versioning and evolution

This document defines schema version 1.

Changes to required fields, field meanings, or enum values must be treated as schema changes. Update this specification, its TypeScript representation, validation rules, and fixtures together.

Avoid adding optional fields without documenting their purpose and expected format.
