# Content Contribution Workflow

**Status:** Contributor guidance  
**Supported locales:** `en`, `pt`

## 1. Purpose

This guide defines how contributors create, update, review, translate, and publish operational content.

All contributions must follow the canonical conventions in `docs/architecture/content-schemas.md`.

## 2. Contribution lifecycle

Content follows this lifecycle:

1. Create or update a content record.
2. Validate its structure and metadata.
3. Prepare the English and Portuguese versions.
4. Review accuracy, consistency, and policy compliance.
5. Submit changes through a pull request.
6. Publish only after approval and required checks.

New records should start with `draft` status.

## 3. Creating content

Before creating a record:

- Check whether equivalent content already exists.
- Reuse established categories and tags.
- Assign a stable ID.
- Identify the responsible content maintainer.
- Choose the appropriate content type and storage location.

Follow the canonical storage structure:

| Content type | Location                            |
| ------------ | ----------------------------------- |
| Documents    | `content/docs/{locale}/{slug}.json` |
| Agents       | `content/agents/{locale}.json`      |
| Rules        | `content/rules/{locale}.json`       |
| Workflows    | `content/workflows/{locale}.json`   |

Use the canonical schemas for required and optional fields.

## 4. Metadata and content quality

Contributors must:

- Use lowercase kebab-case for categories, tags, and document slugs.
- Keep IDs stable across translations.
- Use valid ISO 8601 timestamps with explicit timezones.
- Update `updatedAt` whenever content changes.
- Avoid undocumented fields.
- Avoid credentials, access tokens, and secrets.
- Write clear, actionable, and independently understandable content.

Operational rules must follow the rule taxonomy and precedence conventions in the canonical schema documentation.

## 5. Localization

English and Portuguese are the supported locales.

- Published records should have counterparts in both locales.
- Counterparts must share the same ID and content type.
- Translate user-facing content rather than technical identifiers.
- Keep categories, tags, permission identifiers, and enum values language-independent.
- Document slugs may differ between locales.
- Report missing translations explicitly.

Do not silently substitute one locale for another.

## 6. Review requirements

Before approval, reviewers should verify:

- Schema compatibility and required fields.
- Correct IDs, categories, tags, and timestamps.
- Accuracy and clarity of the content.
- English and Portuguese structural parity.
- Consistency with existing operational rules.
- Appropriate documentation of exceptions and approval requirements.
- Absence of credentials and sensitive configuration.

The content maintainer is responsible for ensuring the content remains accurate and relevant.

## 7. Pull requests

Content changes should be submitted through a pull request.

Each pull request should include:

- A concise description of the change.
- The affected content types and locales.
- Any new or modified categories or tags.
- Translation status.
- Relevant related issues.
- Validation results.

Keep unrelated content changes in separate pull requests where practical.

## 8. Publication and maintenance

- Publish only reviewed and approved content.
- Confirm required localized counterparts are ready before publication.
- Update `updatedAt` when publishing or modifying records.
- Archive obsolete content rather than silently deleting historical records.
- Review archived content when references or dependencies change.
- Keep documentation and runtime schemas aligned.

## 9. Validation

Run the repository checks before submitting changes:

```bash
pnpm check
```

The current runtime validates schema structure and content loading. Translation parity, cross-record references, secret detection, and governance approval remain separate responsibilities unless automated checks are introduced.

Do not claim that a check is automated unless it is implemented and tested.

## 10. Evolving this workflow

Changes to contribution requirements should be reflected in this guide.

Changes to canonical fields or validation behavior must also update:

- `docs/architecture/content-schemas.md`
- TypeScript content models, when affected
- Zod schemas, when affected
- Relevant fixtures and tests

This guide complements the canonical schema documentation and does not replace it.
