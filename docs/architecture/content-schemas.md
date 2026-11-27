# Canonical Content Schemas

**Version:** 1  
**Locales:** `en`, `pt`  
**Status:** Canonical contract, implemented in runtime schemas

## 1. Shared conventions

All content records must follow these shared metadata conventions.

| Field       | Required | Convention                                   |
| ----------- | -------- | -------------------------------------------- |
| `id`        | Yes      | Stable identifier shared across translations |
| `locale`    | Yes      | `en` or `pt`                                 |
| `title`     | Yes      | Localized, non-empty title                   |
| `summary`   | Yes      | Localized short description                  |
| `status`    | Yes      | `draft`, `published`, or `archived`          |
| `category`  | Yes      | Lowercase kebab-case category                |
| `tags`      | Yes      | Array of lowercase kebab-case strings        |
| `createdAt` | Yes      | ISO 8601 timestamp with explicit timezone    |
| `updatedAt` | Yes      | ISO 8601 timestamp with explicit timezone    |

### 1.1 Identifiers

- IDs must be stable and unique within their content collection.
- English and Portuguese translations of the same record must share an ID.
- IDs must remain unchanged after publication.
- Lowercase kebab-case is recommended for IDs, for example `meta-campaign-launch`.
- IDs should describe the content concept rather than its current title or translated wording.
- Do not reuse an ID after a record is deleted or archived.
- Workflow step IDs must be unique within their parent workflow.

**Runtime note:** The current schema requires IDs to be non-empty strings but does not enforce kebab-case formatting. ID uniqueness is checked within each loaded collection, not globally across all content types.

### 1.2 Categories

Categories classify the primary subject or function of a content record.

Conventions:

- Use lowercase kebab-case.
- Prefer existing categories over creating near-duplicates.
- Keep categories concise, reusable, and independent of locale.
- Assign one primary category to each record.
- Use tags for additional context.
- New categories should be documented and reviewed by the content maintainer before being introduced into production content.

Illustrative examples:

- `paid-media`
- `analytics`
- `tracking`
- `automation`
- `operations`

These examples are not an exhaustive or formally enforced taxonomy.

### 1.3 Tags

Tags provide secondary descriptors and help users discover related content.

Conventions:

- Use lowercase kebab-case.
- Prefer reusing an existing tag with the same meaning.
- Avoid synonyms, spelling variations, and overly broad tags.
- Keep tags language-independent across English and Portuguese records.
- Use an empty array when no additional tags are appropriate.

Illustrative examples:

- `google-ads`
- `meta-ads`
- `conversion-tracking`
- `quality-assurance`

### 1.4 Status lifecycle

| Status      | Meaning                                                | Public listing policy |
| ----------- | ------------------------------------------------------ | --------------------- |
| `draft`     | Work in progress or awaiting review                    | Excluded              |
| `published` | Reviewed and approved for use                          | Included              |
| `archived`  | Retained for historical reference but no longer active | Excluded              |

Governance conventions:

- New records should default to `draft`.
- A record must be reviewed before publication.
- Publication should happen only when required localized counterparts are ready.
- Archived records should remain in version control unless there is a documented reason to remove them.
- Changing a record's status must update `updatedAt`.
- Public-facing consumers should display only published records unless a different policy is explicitly documented.

**Runtime note:** The content readers validate status values but do not automatically filter records by status or enforce publication approval and translation readiness.

### 1.5 Ownership and authorship

Content responsibility and operational ownership are separate concepts.

- Every content record should have a clearly identifiable maintainer responsible for its accuracy and lifecycle.
- The optional document field `author` identifies the author or contributor. It does not establish ongoing maintenance responsibility.
- The optional document field `reviewedBy` identifies the person who last reviewed the document.
- The optional document field `reviewedAt` records the time of that review.
- Workflow step `owner` identifies who is responsible for that operational step: `human`, `agent`, or `system`.
- Operational ownership does not grant repository permissions or authorize an agent to execute actions.

The shared metadata schema does not define a general-purpose `owner` field. Do not add undocumented ownership fields to content records.

### 1.6 Timestamps

- Use ISO 8601 timestamps with an explicit timezone.
- UTC (`Z`) is preferred.
- `createdAt` records the original creation time and must not change afterward.
- `updatedAt` changes whenever the content or its metadata changes.
- `reviewedAt` records the most recent review, when applicable.
- Do not use localized date strings or timestamps without timezone information.

### 1.7 Document slugs

- Document slugs must use lowercase kebab-case.
- Slugs are locale-specific and may differ between English and Portuguese translations.
- A document slug must match its filename.
- Avoid changing published slugs unless necessary.
- If a published slug changes, update references and links that depend on it.

### 1.8 General metadata rules

- IDs, categories, tags, enum values, permission identifiers, and integration references are language-independent.
- Titles, summaries, descriptions, labels, and document bodies are localized.
- Unknown fields must be rejected unless explicitly added to the canonical schema.
- Content files must never contain credentials, access tokens, or secrets.
- Optional metadata should be omitted when it does not apply rather than populated with meaningless placeholder values.
- New metadata conventions must be reflected in this document and, when applicable, in runtime schemas and tests.

## 2. Documents

**Storage:** `content/docs/{locale}/{slug}.json`

Each document represents an operational guide, platform instruction, standard operating procedure (SOP), or reference document.

Required fields:

- All shared metadata.
- `slug`: locale-specific lowercase kebab-case URL identifier.
- `body`: non-empty Markdown content.

Optional fields:

- `author`: author or contributor identifier.
- `relatedIds`: IDs of related content records.
- `readingTimeMinutes`: positive integer.
- `reviewedAt`: ISO 8601 timestamp.
- `reviewedBy`: reviewer identifier.

Document slugs may differ between locales, but translated documents must retain the same content ID.

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
- `humanApprovalRequired`: boolean indicating whether human approval is required.

Optional fields:

- `limitations`: known limitations.
- `integrationRefs`: identifiers of relevant integrations.
- `relatedIds`: related documentation or workflow IDs.

Agent records describe intended behavior, capabilities, and permission boundaries. They do not grant actual system permissions or independently authorize actions.

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

### 4.1 Rule classification

Use the existing shared `category` field to classify the primary subject of an operational rule.

Conventions:

- Categories must use lowercase kebab-case.
- Each rule should have one primary category.
- Prefer existing categories over creating near-duplicates.
- Use tags for secondary topics and context.
- Categories must have the same meaning in English and Portuguese content.

Possible category examples include:

- `security`
- `data-protection`
- `quality-assurance`
- `campaign-management`
- `tracking`
- `compliance`

These examples are illustrative, not an exhaustive or runtime-enforced enum. New categories should be reviewed by the content maintainer.

### 4.2 Severity and enforcement

Severity and enforcement describe different aspects of a rule and must not be treated as interchangeable.

| Field         | Values                              | Meaning                                       |
| ------------- | ----------------------------------- | --------------------------------------------- |
| `severity`    | `low`, `medium`, `high`, `critical` | Impact or risk associated with non-compliance |
| `enforcement` | `must`, `should`, `may`             | Normative strength of the rule                |

Use enforcement consistently:

- `must`: mandatory requirement.
- `should`: recommended practice; deviations require justification.
- `may`: permitted or optional behavior.

A high severity does not automatically change a rule's enforcement level. Both fields should reflect the intended policy.

### 4.3 Strict rules

Rules using `must` establish mandatory requirements within their stated scope.

- They must use clear, unambiguous language.
- They should identify the affected systems, teams, or workflows.
- They should explain the reason for the requirement.
- They must not be weakened by a lower-priority recommendation.
- Any permitted deviation must follow the documented exception process.

Legal, security, and safety requirements must not be overridden by ordinary operational preferences.

### 4.4 Exceptions

Exceptions document approved deviations from an existing rule.

Conventions:

- Identify the rule affected.
- Explain the reason for the exception.
- Identify the approving authority.
- Record the applicable scope.
- Include a review date or expiry condition.
- Keep the exception limited to what was approved.
- Reassess exceptions when the underlying rule or circumstances change.

An exception must not be interpreted as a permanent change to the original rule.

**Runtime note:** The current `exceptions` field is an optional array of non-empty strings. The approval and review details above are documentation conventions; the runtime schema does not validate them as structured fields.

### 4.5 Rule precedence and contradictions

When rules appear to conflict, apply these principles:

1. Applicable legal, security, and safety requirements take priority over ordinary operational preferences.
2. An explicitly approved exception applies only within its documented scope and approval.
3. A more specific rule takes precedence over a general rule when both address the same issue and no higher-priority requirement is violated.
4. A `should` or `may` rule must not be used to override an applicable `must` requirement.
5. If two applicable mandatory rules remain contradictory, do not choose one arbitrarily. Escalate the conflict for human review and document the resolution.

Rule authors should:

- Check related rules before introducing a new one.
- Avoid duplicating requirements with different wording.
- Reference related rules where useful.
- Update affected rules when a contradiction is resolved.

**Runtime note:** Rule precedence, exception approval, and contradiction detection are governance processes. They are not currently enforced by the Zod schema or content readers.

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

- `id`: identifier unique within the parent workflow.
- `title`: localized step title.
- `description`: explanation of the step.
- `owner`: `human`, `agent`, or `system`.
- `inputs`: expected inputs.
- `outputs`: expected outputs.
- `requiresApproval`: boolean indicating whether approval is required.

Optional workflow fields:

- `integrationRefs`: referenced integrations.
- `failureHandling`: documented response to a failed step.
- `relatedIds`: related content records.

A workflow blueprint documents a process. It does not execute the process by itself or grant execution permissions to its assigned owners.

## 6. Localization and translation parity

English and Portuguese content must follow consistent structural conventions.

- Every published record should have an English and Portuguese counterpart.
- Counterparts must share the same `id` and content type.
- Localized fields include titles, summaries, descriptions, Markdown bodies, labels, and user-facing instructions.
- Technical identifiers, enum values, permission identifiers, and integration references remain language-independent.
- Document slugs may be translated.
- A missing translation must be reported explicitly. Silently substituting another locale is not the default behavior.
- Translation parity checks should compare IDs and required structural fields, not translated text.

**Runtime note:** Translation parity is not currently enforced by the content readers or schemas. Publication readiness must therefore be checked by the relevant content workflow until automated parity validation is implemented.

## 7. Collection layout

The canonical collection layout is:

```text
content/
├── docs/
│   ├── en/
│   └── pt/
├── agents/
│   ├── en.json
│   └── pt.json
├── rules/
│   ├── en.json
│   └── pt.json
└── workflows/
    ├── en.json
    └── pt.json
```

Document records are stored individually by locale and slug. Agent, rule, and workflow records are stored as locale-specific collections.

## 8. Validation expectations

Runtime validation is implemented using Zod schemas in `lib/content/schemas.ts` and content readers in `lib/content.ts`.

### 8.1 Currently enforced

The runtime currently enforces:

- Required fields and field types.
- Valid locale and enum values.
- Unique IDs within each loaded collection.
- Lowercase kebab-case document slugs and matching document filenames.
- ISO 8601 timestamps with explicit timezone offsets.
- Unique workflow step IDs within each workflow.
- Rejection of unexpected fields.
- Non-empty required strings.

Content readers also:

- Return empty collections when collection files are missing.
- Return `null` when an individual document is missing.
- Reject malformed JSON with a file-specific validation error.
- Reject records whose locale does not match the requested collection.
- Reject duplicate content IDs within a collection.

### 8.2 Not yet enforced

The following integrity checks remain future work:

- Translation parity for published records.
- Valid references between related content records.
- Detection of embedded credentials, access tokens, and secrets.
- Global uniqueness of IDs across different content collections.
- Mandatory lowercase kebab-case formatting for content IDs.
- Automatic filtering of records by publication status.
- Ownership or maintainer metadata across all content types.
- Rule category validation against an approved taxonomy.
- Rule precedence and contradiction detection.
- Structured validation of exception approval and review details.

These checks should be implemented alongside appropriate fixtures and tests before being treated as runtime guarantees.

### 8.3 Documentation and implementation alignment

This document distinguishes between:

- **Schema requirements:** constraints enforced by the Zod schemas.
- **Reader behavior:** guarantees provided by the content-loading functions.
- **Governance conventions:** rules that contributors and reviewers must follow.
- **Future validation:** integrity checks that are not yet implemented.

When runtime behavior changes, update this document and its related tests in the same change whenever practical.

## 9. Versioning and evolution

This document defines schema version 1.

Changes to required fields, field meanings, or enum values must be treated as schema changes.

When changing the canonical contract:

1. Update this specification.
2. Update the TypeScript content types, if affected.
3. Update the Zod validation schemas, if affected.
4. Update fixtures and tests.
5. Review existing content for compatibility.
6. Document migration requirements when existing records need changes.

Avoid adding optional fields without documenting their purpose, expected format, and intended consumers.

Do not describe a convention as runtime-enforced until the corresponding validation and tests exist.
