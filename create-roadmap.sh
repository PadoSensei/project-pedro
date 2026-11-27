#!/usr/bin/env bash
set -euo pipefail

REPO="PadoSensei/project-pedro"

echo "Creating Project Pedro roadmap in $REPO"

# --------------------------------------------------
# 1. MILESTONES
# --------------------------------------------------

create_milestone() {
  local title="$1"
  local description="$2"

  if gh api "repos/$REPO/milestones?state=all&per_page=100" \
    --jq '.[].title' | grep -Fxq "$title"; then
    echo "Milestone exists: $title"
  else
    gh api -X POST "repos/$REPO/milestones" \
      -f title="$title" \
      -f description="$description" >/dev/null
    echo "Created milestone: $title"
  fi
}

create_milestone "M1 - SSOT Foundation" \
  "Establish the content architecture, schemas, validation, and governance for Pedro's single source of truth."

create_milestone "M2 - Bilingual Knowledge Base" \
  "Deliver consistent English and Portuguese documentation, localization, and knowledge navigation."

create_milestone "M3 - Agent & Automation Registry" \
  "Define agent and automation registries, workflow blueprints, autonomy levels, and operational boundaries."

create_milestone "M4 - Operations Hub Experience" \
  "Build a usable interface for discovering, searching, and navigating Pedro's operational knowledge."

create_milestone "M5 - Quality & Release" \
  "Establish testing, accessibility, security, CI, deployment documentation, and release readiness."

# --------------------------------------------------
# 2. LABELS
# --------------------------------------------------

create_label() {
  local name="$1"
  local color="$2"
  local description="$3"

  if gh api -X POST "repos/$REPO/labels" \
      -f name="$name" \
      -f color="$color" \
      -f description="$description" >/dev/null 2>&1; then
    echo "Created label: $name"
  else
    # Update it if it already exists; fail if another error occurred.
    gh api "repos/$REPO/labels/$name" >/dev/null || {
      echo "Could not create or find label: $name" >&2
      return 1
    }

    gh api -X PATCH "repos/$REPO/labels/$name" \
      -f new_name="$name" \
      -f color="$color" \
      -f description="$description" >/dev/null

    echo "Updated label: $name"
  fi
}

create_label "type:feature" "1D76DB" "New functionality"
create_label "type:docs" "0075CA" "Documentation and knowledge content"
create_label "type:chore" "EDEDED" "Maintenance and infrastructure"
create_label "type:bug" "D73A4A" "Incorrect or broken behavior"
create_label "type:security" "B60205" "Security and privacy"

create_label "priority:p0" "B60205" "Critical priority"
create_label "priority:p1" "D93F0B" "High priority"
create_label "priority:p2" "FBCA04" "Normal priority"

create_label "area:content" "C5DEF5" "Content architecture and documentation"
create_label "area:i18n" "D4C5F9" "Internationalization"
create_label "area:agents" "BFD4F2" "Agents and automation"
create_label "area:ui" "C2E0C6" "User interface and experience"
create_label "area:platform" "EDEDED" "Application infrastructure"
create_label "area:qa" "F9D0C4" "Testing and quality"

# --------------------------------------------------
# 3. ISSUE CREATION
# --------------------------------------------------

declare -a ISSUE_NUMBERS
ISSUE_INDEX=0

create_issue() {
  local milestone="$1"
  local title="$2"
  local labels="$3"
  local dependency="$4"
  local scope="$5"

  ISSUE_INDEX=$((ISSUE_INDEX + 1))

  # Avoid creating an issue with an identical title.
  local existing
  existing=$(gh issue list --repo "$REPO" --state all \
    --limit 500 --json number,title \
    | python3 -c 'import json,sys; title=sys.argv[1]; data=json.load(sys.stdin); print(next((str(x["number"]) for x in data if x["title"] == title), ""))' "$title")

  if [[ -n "$existing" ]]; then
    ISSUE_NUMBERS[$ISSUE_INDEX]="$existing"
    echo "Already exists: #$existing - $title"
    return
  fi

  local dependency_text="None"
  if [[ "$dependency" != "0" ]]; then
    dependency_text="Depends on #${ISSUE_NUMBERS[$dependency]}"
  fi

  local body
  body=$(cat <<EOF
## Objective

$scope

## Scope

- Review the existing implementation before making changes.
- Implement the required functionality in the existing project architecture.
- Keep the content and workflows compatible with the English and Portuguese experience.
- Update relevant documentation when behavior or conventions change.

## Acceptance criteria

- [ ] The objective is implemented and verified.
- [ ] Existing functionality is not unintentionally broken.
- [ ] Relevant validation, tests, or manual verification are completed.
- [ ] Documentation is updated where appropriate.

## Dependencies

$dependency_text

## Notes

This issue belongs to the Project Pedro roadmap. Confirm the current repository implementation before assuming that functionality is missing.
EOF
)

  local url
  url=$(gh issue create --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --milestone "$milestone" \
    --label "$labels")

  local number="${url##*/}"
  ISSUE_NUMBERS[$ISSUE_INDEX]="$number"

  echo "Created #$number - $title"
}

# --------------------------------------------------
# M1 - SSOT FOUNDATION (8)
# --------------------------------------------------

M1="M1 - SSOT Foundation"

create_issue "$M1" "Audit existing content architecture" \
  "type:chore,priority:p1,area:content" 0 \
  "Inspect the existing content directories, readers, JSON files, and conventions. Document what exists, identify inconsistencies, and propose a clear target architecture."

create_issue "$M1" "Define canonical content schemas" \
  "type:feature,priority:p1,area:content" 1 \
  "Define the canonical structure for documentation, operational rules, fichas, and agent registry entries. Specify required fields, optional fields, and metadata conventions."

create_issue "$M1" "Implement typed content models" \
  "type:feature,priority:p1,area:platform" 2 \
  "Create TypeScript types or interfaces that represent the canonical content schemas and can be shared by content readers and UI components."

create_issue "$M1" "Implement content loading and validation" \
  "type:feature,priority:p1,area:content" 3 \
  "Create or improve the local content-loading layer. Validate content against the canonical schemas and provide useful errors for invalid files."

create_issue "$M1" "Standardize content metadata conventions" \
  "type:docs,priority:p2,area:content" 2 \
  "Document naming, identifiers, categories, status, ownership, tags, and other metadata conventions for repository content."

create_issue "$M1" "Establish operational rules taxonomy" \
  "type:docs,priority:p1,area:content" 2 \
  "Define how operational rules, strict rules, exceptions, and contradiction matrices are categorized and maintained."

create_issue "$M1" "Document content contribution workflow" \
  "type:docs,priority:p2,area:content" 5 \
  "Create contributor guidance for adding, editing, reviewing, and deprecating documentation, rules, and registry entries."

create_issue "$M1" "Add content integrity checks" \
  "type:feature,priority:p1,area:qa" 4 \
  "Add automated checks for malformed JSON, missing required metadata, invalid references, duplicate identifiers, and missing locale counterparts."

# --------------------------------------------------
# M2 - BILINGUAL KNOWLEDGE BASE (9)
# --------------------------------------------------

M2="M2 - Bilingual Knowledge Base"

create_issue "$M2" "Audit English and Portuguese routing" \
  "type:chore,priority:p1,area:i18n" 0 \
  "Review next-intl configuration, locale route handling, language detection, and the /en and /pt experiences. Document current behavior and gaps."

create_issue "$M2" "Inventory translation keys and coverage" \
  "type:feature,priority:p1,area:i18n" 9 \
  "Inventory UI translation keys in messages/en.json and messages/pt.json. Identify missing keys, unused keys, and inconsistent translations."

create_issue "$M2" "Enforce translation key parity" \
  "type:feature,priority:p1,area:i18n" 10 \
  "Add validation that English and Portuguese message files contain matching key structures and report missing or unexpected keys."

create_issue "$M2" "Define bilingual documentation taxonomy" \
  "type:docs,priority:p1,area:content" 5 \
  "Define categories and navigation metadata for bilingual documentation, including consistent identifiers and locale relationships."

create_issue "$M2" "Implement documentation detail pages" \
  "type:feature,priority:p1,area:ui" 12 \
  "Build or improve detail pages that render local documentation with consistent metadata, readable content, and locale-aware navigation."

create_issue "$M2" "Implement bilingual documentation search" \
  "type:feature,priority:p1,area:ui" 13 \
  "Enable users to find relevant documentation across the available content, with locale-aware results and useful empty states."

create_issue "$M2" "Add consistent locale switching" \
  "type:feature,priority:p2,area:i18n" 9 \
  "Provide a consistent language switcher that preserves the current page where a translation exists and handles missing counterparts gracefully."

create_issue "$M2" "Define missing translation fallback behavior" \
  "type:feature,priority:p2,area:i18n" 11 \
  "Specify and implement predictable behavior when a document or translation is unavailable in the selected locale."

create_issue "$M2" "Add bilingual content quality review" \
  "type:docs,priority:p2,area:qa" 14 \
  "Establish a review checklist for terminology, consistency, completeness, links, and meaning across English and Portuguese content."

# --------------------------------------------------
# M3 - AGENT & AUTOMATION REGISTRY (9)
# --------------------------------------------------

M3="M3 - Agent & Automation Registry"

create_issue "$M3" "Define agent registry schema" \
  "type:feature,priority:p1,area:agents" 2 \
  "Define a structured schema for agent definitions, including purpose, triggers, inputs, outputs, tools, ownership, and status."

create_issue "$M3" "Define agent metadata and categories" \
  "type:docs,priority:p2,area:agents" 18 \
  "Establish standard agent categories, identifiers, lifecycle statuses, ownership metadata, and discovery tags."

create_issue "$M3" "Implement agent registry listing" \
  "type:feature,priority:p1,area:agents" 19 \
  "Load agent registry entries from local content and display them in a consistent, discoverable listing."

create_issue "$M3" "Implement agent detail views" \
  "type:feature,priority:p1,area:agents" 20 \
  "Provide detail views showing an agent's purpose, capabilities, required inputs, outputs, dependencies, and autonomy level."

create_issue "$M3" "Define workflow blueprint schema" \
  "type:feature,priority:p1,area:agents" 18 \
  "Define a reusable blueprint format for repetitive operational workflows, including steps, triggers, inputs, outputs, exceptions, and verification."

create_issue "$M3" "Document paid media workflow fichas" \
  "type:docs,priority:p1,area:agents" 22 \
  "Create or standardize workflow fichas for relevant Google Ads, Meta Ads, and Google Tag Manager operational processes."

create_issue "$M3" "Define agent autonomy and risk levels" \
  "type:docs,priority:p1,area:agents" 18 \
  "Establish autonomy levels, approval requirements, human oversight expectations, and escalation rules for agent workflows."

create_issue "$M3" "Document integration and permission boundaries" \
  "type:docs,priority:p1,area:agents" 24 \
  "Document which systems agents may access, required permissions, sensitive operations, and actions requiring human approval."

create_issue "$M3" "Validate agent and workflow blueprints" \
  "type:feature,priority:p1,area:qa" 25 \
  "Validate registry entries and workflow blueprints against their schemas. Report missing fields, invalid references, and inconsistent autonomy settings."

# --------------------------------------------------
# M4 - OPERATIONS HUB EXPERIENCE (8)
# --------------------------------------------------

M4="M4 - Operations Hub Experience"

create_issue "$M4" "Define operations hub information architecture" \
  "type:docs,priority:p1,area:ui" 0 \
  "Define the primary sections, navigation hierarchy, and user journeys for accessing documentation, rules, agents, and workflow blueprints."

create_issue "$M4" "Implement consistent global navigation" \
  "type:feature,priority:p1,area:ui" 27 \
  "Implement navigation between the main hub sections with consistent behavior across English and Portuguese routes."

create_issue "$M4" "Implement documentation browsing and filters" \
  "type:feature,priority:p1,area:ui" 27 \
  "Allow users to browse documentation by category, tags, and other useful metadata."

create_issue "$M4" "Improve global search experience" \
  "type:feature,priority:p1,area:ui" 29 \
  "Provide a coherent search experience across relevant documentation and registry content, with clear result context."

create_issue "$M4" "Improve responsive and accessible layouts" \
  "type:feature,priority:p1,area:ui" 27 \
  "Review responsive layouts, keyboard navigation, semantic structure, focus visibility, and screen-reader usability."

create_issue "$M4" "Standardize reusable interface components" \
  "type:chore,priority:p2,area:ui" 27 \
  "Review reusable components and establish consistent patterns for cards, metadata, headings, lists, navigation, and content presentation."

create_issue "$M4" "Implement loading, empty, and error states" \
  "type:feature,priority:p2,area:ui" 28 \
  "Ensure pages communicate loading, missing content, unavailable translations, and errors clearly and consistently."

create_issue "$M4" "Add hub usage guidance and onboarding" \
  "type:docs,priority:p2,area:ui" 27 \
  "Explain the purpose of the hub and how team members should find, interpret, and contribute to operational knowledge."

# --------------------------------------------------
# M5 - QUALITY & RELEASE (8)
# --------------------------------------------------

M5="M5 - Quality & Release"

create_issue "$M5" "Establish unit testing conventions" \
  "type:chore,priority:p1,area:qa" 0 \
  "Choose and configure appropriate unit testing conventions for shared utilities, content readers, and validation logic."

create_issue "$M5" "Test content schemas and readers" \
  "type:feature,priority:p1,area:qa" 35 \
  "Add tests for valid and invalid content, missing fields, malformed JSON, and content-loading edge cases."

create_issue "$M5" "Add application end-to-end tests" \
  "type:feature,priority:p1,area:qa" 35 \
  "Cover critical user journeys such as locale navigation, documentation browsing, search, and agent discovery."

create_issue "$M5" "Audit accessibility and usability" \
  "type:chore,priority:p1,area:qa" 31 \
  "Run an accessibility review and address important keyboard, contrast, semantic, focus, and responsive usability issues."

create_issue "$M5" "Review security and environment configuration" \
  "type:security,priority:p0,area:platform" 0 \
  "Review environment variable handling, secret exposure risks, content rendering, dependency risks, and deployment configuration. Never commit secrets."

create_issue "$M5" "Establish continuous integration checks" \
  "type:feature,priority:p1,area:platform" 35 \
  "Configure CI checks for linting, type checking, content validation, tests, and production builds."

create_issue "$M5" "Document deployment and maintenance runbook" \
  "type:docs,priority:p2,area:platform" 40 \
  "Document environment setup, deployment, configuration, routine maintenance, troubleshooting, and recovery procedures."

create_issue "$M5" "Create release readiness checklist" \
  "type:docs,priority:p1,area:qa" 36 \
  "Define a release checklist covering content integrity, bilingual parity, accessibility, tests, security, build status, and deployment verification."

echo
echo "=========================================="
echo "ROADMAP CREATION COMPLETE"
echo "=========================================="
echo "Issues processed: $ISSUE_INDEX"
echo "Repository: https://github.com/$REPO/issues"
echo "Milestones: https://github.com/$REPO/milestones"
