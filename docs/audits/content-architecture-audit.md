# Content Architecture Audit

- **Project:** Project Pedro
- **Issue:** [#1 — Audit existing content architecture](https://github.com/PadoSensei/project-pedro/issues/1)
- **Milestone:** M1 — SSOT Foundation
- **Status:** Initial repository audit
- **Audit scope:** Content storage, loading, localization, validation, and governance

## 1. Executive summary

The repository has the beginnings of a filesystem-backed content layer, but it does not yet contain a populated or governed single source of truth.

The current `lib/content.ts` module reads JSON files from the root `content/` directory. It provides basic reader functions, but does not validate parsed data against schemas or enforce consistent locale, slug, or metadata conventions.

The `content/` directory exists but contains no content files. No dedicated translation-message directory or established content taxonomy was found in the audited repository tree.

The application builds successfully, but the current implementation is a starting scaffold rather than a complete content platform.

## 2. Existing architecture

### 2.1 Repository and runtime

The audited project uses:

- Next.js 16.4.6 with the App Router.
- React 19.3.0.
- TypeScript 5.
- `next-intl` 4.16.2.
- Tailwind CSS 4.
- pnpm for package management.

The README describes a Next.js 15 application, which does not match the installed package version. The README should be reconciled with the actual project configuration.

### 2.2 Content storage

The root `content/` directory exists but is empty.

No populated content collections, agent registry, operational rules, or bilingual documentation files were found during the audit.

No established directories were found for `i18n/`, `messages/`, `src/content/`, or `src/i18n/`.

### 2.3 Content reader

The existing `lib/content.ts` exports:

- `getDocSlugs(locale)`
- `getDocBySlug(locale, slug)`
- `getAllAgents(locale)`
- `getRules(locale)`

The module uses filesystem operations and JSON parsing.

Observed limitations:

1. JSON is parsed without runtime schema validation.
2. Locale and slug inputs are not validated centrally.
3. Missing files are handled with empty arrays or `null`, but malformed JSON and invalid content structures are not given a consistent domain-level error contract.
4. There is no documented canonical metadata convention.
5. There is no documented policy for missing translations.
6. There are no content integrity checks identified in the current package scripts.

### 2.4 Localization

`next-intl` is installed, but the audit did not find an established message catalog structure or a documented localization workflow.

The existence of a localization dependency alone does not establish complete bilingual routing, translation parity, or localized content governance.

### 2.5 Quality baseline

The following baseline checks passed:

| Check | Result |
|---|---|
| `pnpm lint` | Passed |
| `pnpm build` | Passed |
| TypeScript during production build | Passed |

The production build generated the `/`, `/_not-found`, and `/login` routes.

No dedicated test framework or test script was identified in the package scripts during this audit.

## 3. Architecture gaps

| Area | Current state | Required capability |
|---|---|---|
| Content storage | Empty filesystem directory | Documented canonical collections |
| Schemas | No runtime validation identified | Typed, validated content contracts |
| Metadata | No shared convention documented | Consistent IDs, slugs, titles, status, and timestamps |
| Localization | Dependency present; structure not established | Explicit English and Portuguese strategy |
| Readers | Basic filesystem and JSON readers | Validated, predictable reader API |
| Error handling | Missing files return empty values or `null` | Consistent handling of invalid and missing content |
| Governance | No contribution workflow documented | Authoring, review, and publishing rules |
| Integrity | No content checks identified | Automated validation of files and references |

## 4. Recommended target architecture

The following is a proposed direction for the next implementation issues, not a claim about the current repository.

### 4.1 Keep content separate from application code

Use the root `content/` directory as the canonical home for structured operational content.

Application components should consume content through a small, typed reader layer rather than reading files directly.

### 4.2 Establish explicit content collections

The initial domain collections should cover:

- Documentation and operational fichas.
- Agent definitions and metadata.
- Operational rules.
- Workflow blueprints.

The exact file layout and required fields should be finalized in Issue #2 before implementation.

### 4.3 Define localization deliberately

English and Portuguese should be supported consistently.

The schema design should decide which fields are language-independent and which require localized values. Missing translations should have an explicit policy rather than relying on accidental filesystem behavior.

### 4.4 Validate at the content boundary

Content should be validated when it enters the reader layer.

Invalid content should produce actionable errors that identify the file and the validation problem. A malformed file should not silently appear as valid empty content.

### 4.5 Keep readers predictable

The content API should:

- Validate locale and slug inputs.
- Return typed domain objects.
- Distinguish missing content from invalid content.
- Avoid exposing filesystem details to UI components.
- Support deterministic ordering where lists are displayed.
- Be testable independently of page components.

### 4.6 Add governance and integrity checks

Document naming, metadata, localization, review, and contribution conventions.

Automated checks should eventually verify schema validity, required translations, duplicate identifiers or slugs, and broken internal references.

## 5. Recommended implementation sequence

The existing roadmap provides an appropriate sequence:

1. **Issue #2:** Define canonical content schemas.
2. **Issue #3:** Implement typed content models.
3. **Issue #4:** Implement content loading and validation.
4. **Issue #5:** Standardize content metadata conventions.
5. **Issue #6:** Establish operational rules taxonomy.
6. **Issue #7:** Document the content contribution workflow.
7. **Issue #8:** Add content integrity checks.

Localization-specific implementation should be coordinated with the M2 issues so that the content model and translation strategy remain consistent.

## 6. Scope boundaries

This audit does not:

- Implement schemas or runtime validation.
- Move or create production content records.
- Change application routing or page behavior.
- Redesign authentication.
- Introduce a database or external content-management system.
- Select additional dependencies.

Those decisions belong in the relevant implementation issues and should be made against the actual project requirements.

## 7. Conclusion

The current repository provides a useful starting point: a filesystem-backed reader module, an existing content directory, TypeScript, and a passing production build.

However, the content layer is not yet a reliable single source of truth. The immediate priority is to define canonical schemas and metadata conventions before expanding the reader implementation or adding substantial content.

This audit establishes the baseline for M1 and provides the architectural direction for Issues #2–#8.
