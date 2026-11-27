import fs from "node:fs";
import path from "node:path";

import {
  agentCollectionSchema,
  documentSchema,
  ruleCollectionSchema,
  workflowCollectionSchema,
  type Locale,
} from "./schemas";

export interface ContentIntegrityIssue {
  filePath: string;
  message: string;
}

type ContentType = "docs" | "agents" | "rules" | "workflows";

interface ContentRecord {
  id: string;
  locale: Locale;
  status: string;
  relatedIds?: string[];
  [key: string]: unknown;
}

interface ParsedRecord {
  type: ContentType;
  filePath: string;
  record: ContentRecord;
}

const LOCALES: Locale[] = ["en", "pt"];

const COLLECTIONS = [
  {
    type: "agents",
    schema: agentCollectionSchema,
  },
  {
    type: "rules",
    schema: ruleCollectionSchema,
  },
  {
    type: "workflows",
    schema: workflowCollectionSchema,
  },
] as const;

const SECRET_PATTERNS = [
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\b(?:password|passwd|api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["']?[^"' \n]{8,}/i,
];

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }

  return [];
}

function containsLikelySecret(value: unknown): boolean {
  return collectStrings(value).some((text) =>
    SECRET_PATTERNS.some((pattern) => pattern.test(text))
  );
}

function parseJson(
  filePath: string,
  issues: ContentIntegrityIssue[]
): unknown | undefined {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
  } catch {
    issues.push({ filePath, message: "Invalid JSON syntax." });
    return undefined;
  }
}

function addSchemaIssues(
  filePath: string,
  result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } },
  issues: ContentIntegrityIssue[]
): boolean {
  if (result.success) {
    return true;
  }

  for (const issue of result.error?.issues ?? []) {
    const field = issue.path.length
      ? issue.path.map(String).join(".")
      : "(root)";

    issues.push({
      filePath,
      message: `${field}: ${issue.message}`,
    });
  }

  return false;
}

export function validateContentIntegrity(
  contentDirectory = path.join(process.cwd(), "content")
): ContentIntegrityIssue[] {
  const issues: ContentIntegrityIssue[] = [];
  const records: ParsedRecord[] = [];

  function addRecord(
    type: ContentType,
    filePath: string,
    record: ContentRecord,
    expectedLocale: Locale
  ) {
    if (record.locale !== expectedLocale) {
      issues.push({
        filePath,
        message: `Record "${record.id}" has locale "${record.locale}", expected "${expectedLocale}".`,
      });
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id)) {
      issues.push({
        filePath,
        message: `ID "${record.id}" must use lowercase kebab-case.`,
      });
    }

    if (containsLikelySecret(record)) {
      issues.push({
        filePath,
        message: "Possible embedded credential or secret detected.",
      });
    }

    records.push({ type, filePath, record });
  }

  // Individual document files.
  for (const locale of LOCALES) {
    const docsDirectory = path.join(contentDirectory, "docs", locale);

    if (!fs.existsSync(docsDirectory)) {
      continue;
    }

    for (const filename of fs.readdirSync(docsDirectory).sort()) {
      if (!filename.endsWith(".json")) {
        continue;
      }

      const filePath = path.join(docsDirectory, filename);
      const data = parseJson(filePath, issues);

      if (data === undefined) {
        continue;
      }

      if (!addSchemaIssues(filePath, documentSchema.safeParse(data), issues)) {
        continue;
      }

      const document = data as ContentRecord;

      if (document.slug !== filename.slice(0, -5)) {
        issues.push({
          filePath,
          message: `Document slug "${String(document.slug)}" does not match its filename.`,
        });
      }

      addRecord("docs", filePath, document, locale);
    }
  }

  // Locale-specific agent, rule, and workflow collections.
  for (const collection of COLLECTIONS) {
    for (const locale of LOCALES) {
      const filePath = path.join(
        contentDirectory,
        collection.type,
        `${locale}.json`
      );

      if (!fs.existsSync(filePath)) {
        continue;
      }

      const data = parseJson(filePath, issues);

      if (data === undefined) {
        continue;
      }

      const result = collection.schema.safeParse(data);

      if (!addSchemaIssues(filePath, result, issues)) {
        continue;
      }

      const collectionRecords = data as ContentRecord[];
      const seenIds = new Set<string>();

      for (const record of collectionRecords) {
        if (seenIds.has(record.id)) {
          issues.push({
            filePath,
            message: `Duplicate content ID "${record.id}" in the ${locale} collection.`,
          });
          continue;
        }

        seenIds.add(record.id);
        addRecord(collection.type, filePath, record, locale);
      }
    }
  }

  // IDs may be shared by translations, but not by different content types.
  const typesById = new Map<string, Set<ContentType>>();

  for (const { type, record } of records) {
    const types = typesById.get(record.id) ?? new Set<ContentType>();
    types.add(type);
    typesById.set(record.id, types);
  }

  for (const [id, types] of typesById) {
    if (types.size > 1) {
      const matchingRecord = records.find(
        (entry) => entry.record.id === id
      );

      issues.push({
        filePath: matchingRecord?.filePath ?? contentDirectory,
        message: `ID "${id}" is used by multiple content types: ${[...types].join(", ")}.`,
      });
    }
  }

  // Published records require a published counterpart in the other locale.
  const recordsByTypeAndId = new Map<string, ParsedRecord[]>();

  for (const entry of records) {
    const key = `${entry.type}:${entry.record.id}`;
    const group = recordsByTypeAndId.get(key) ?? [];
    group.push(entry);
    recordsByTypeAndId.set(key, group);
  }

  for (const group of recordsByTypeAndId.values()) {
    for (const entry of group) {
      if (entry.record.status !== "published") {
        continue;
      }

      const counterpart = group.find(
        (candidate) => candidate.record.locale !== entry.record.locale
      );

      if (!counterpart) {
        issues.push({
          filePath: entry.filePath,
          message: `Published ${entry.type} record "${entry.record.id}" is missing its ${entry.record.locale === "en" ? "pt" : "en"} counterpart.`,
        });
      } else if (counterpart.record.status !== "published") {
        issues.push({
          filePath: counterpart.filePath,
          message: `Translation counterpart for published record "${entry.record.id}" must also be published.`,
        });
      }
    }
  }

  // relatedIds must resolve to an existing content record.
  const knownIds = new Set(records.map(({ record }) => record.id));

  for (const { filePath, record } of records) {
    for (const relatedId of record.relatedIds ?? []) {
      if (!knownIds.has(relatedId)) {
        issues.push({
          filePath,
          message: `Record "${record.id}" references unknown related ID "${relatedId}".`,
        });
      }
    }
  }

  return issues;
}
